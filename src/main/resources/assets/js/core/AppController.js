// Main application controller

class AppController {
    constructor() {
        this.orderService = new OrderService();
        this.storageService = new StorageService();
        this.formHandler = null;
        this.signatureHandler = null;
        this.currentView = 'newOrder';
        this.currentOrder = null;
        
        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        this.checkUrlParameters();
        this.setupNavigation();
        this.initializeComponents();
        this.bindEvents();
        this.showInitialView();
    }

    /**
     * Check URL parameters for order viewing
     */
    checkUrlParameters() {
        const orderNumber = getUrlParameter('order');
        if (orderNumber) {
            this.loadOrderForSigning(orderNumber);
        }
    }

    /**
     * Setup navigation
     */
    setupNavigation() {
        const newOrderBtn = document.getElementById('newOrderBtn');
        const orderListBtn = document.getElementById('orderListBtn');
        
        if (newOrderBtn) {
            newOrderBtn.addEventListener('click', () => this.showView('newOrder'));
        }
        
        if (orderListBtn) {
            orderListBtn.addEventListener('click', () => this.showView('orderList'));
        }
    }

    /**
     * Initialize components
     */
    initializeComponents() {
        // Check if we're in signature mode
        const orderNumber = getUrlParameter('order');
        if (orderNumber) {
            this.signatureHandler = new SignatureHandler();
        } else {
            this.formHandler = new FormHandler();
        }
    }

    /**
     * Bind global events
     */
    bindEvents() {
        // Toast close button
        const closeToastBtn = document.getElementById('closeToastBtn');
        if (closeToastBtn) {
            closeToastBtn.addEventListener('click', hideToast);
        }
        
        // Modal close on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscape();
            }
        });
    }

    /**
     * Show initial view
     */
    showInitialView() {
        const orderNumber = getUrlParameter('order');
        if (orderNumber) {
            this.showView('signature');
        } else {
            this.showView('newOrder');
        }
    }

    /**
     * Show specific view
     * @param {string} viewName 
     */
    showView(viewName) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.add('hidden'));
        
        // Show target section
        const targetSection = document.getElementById(this.getViewId(viewName));
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
        
        // Update navigation state
        this.updateNavigation(viewName);
        
        // Load view-specific data
        this.loadViewData(viewName);
        
        this.currentView = viewName;
    }

    /**
     * Get view element ID
     * @param {string} viewName 
     * @returns {string}
     */
    getViewId(viewName) {
        const viewMap = {
            newOrder: 'newOrderForm',
            orderList: 'orderList',
            signature: 'signaturePage'
        };
        
        return viewMap[viewName] || 'newOrderForm';
    }

    /**
     * Update navigation state
     * @param {string} activeView 
     */
    updateNavigation(activeView) {
        const buttons = document.querySelectorAll('.nav .btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = activeView === 'newOrder' 
            ? document.getElementById('newOrderBtn')
            : document.getElementById('orderListBtn');
            
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    /**
     * Load view-specific data
     * @param {string} viewName 
     */
    loadViewData(viewName) {
        switch (viewName) {
            case 'orderList':
                this.loadOrderList();
                break;
            case 'signature':
                const orderNumber = getUrlParameter('order');
                if (orderNumber) {
                    this.loadOrderForSigning(orderNumber);
                }
                break;
        }
    }

    /**
     * Load order list
     */
    loadOrderList() {
        const orders = this.orderService.getAllOrders();
        this.renderOrderTable(orders);
        this.setupOrderFilters();
    }

    /**
     * Render order table
     * @param {Order[]} orders 
     */
    renderOrderTable(orders) {
        const tbody = document.getElementById('orderTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (orders.length === 0) {
            const row = createElement('tr');
            row.innerHTML = '<td colspan="8" style="text-align: center; color: #6b7280;">暫無維修單</td>';
            tbody.appendChild(row);
            return;
        }
        
        orders.forEach(order => {
            const row = this.createOrderRow(order);
            tbody.appendChild(row);
        });
    }

    /**
     * Create order table row
     * @param {Order} order 
     * @returns {HTMLElement}
     */
    createOrderRow(order) {
        const row = createElement('tr');
        
        const statusClass = order.status === 'signed' ? 'status-signed' : 'status-pending';
        
        row.innerHTML = `
            <td>${order.orderNumber}</td>
            <td>${order.getFormattedDate()}</td>
            <td>${order.site}</td>
            <td>${order.getLocation()}</td>
            <td>${order.staff}</td>
            <td>${order.getFormattedAmount()}</td>
            <td><span class="status-badge ${statusClass}">${order.getStatusText()}</span></td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="app.viewOrderDetails('${order.orderNumber}')">查看</button>
                <button class="btn btn-small btn-primary" onclick="app.copyOrderLink('${order.orderNumber}')">複製連結</button>
                ${!order.isSigned() ? `<button class="btn btn-small btn-secondary" onclick="app.deleteOrder('${order.orderNumber}')">刪除</button>` : ''}
            </td>
        `;
        
        return row;
    }

    /**
     * Setup order filters
     */
    setupOrderFilters() {
        const siteFilter = document.getElementById('siteFilter');
        const buildingFilter = document.getElementById('buildingFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        const filterOrders = debounce(() => {
            const filters = {
                site: siteFilter?.value || '',
                building: buildingFilter?.value || '',
                status: statusFilter?.value || ''
            };
            
            const filteredOrders = this.orderService.getFilteredOrders(filters);
            this.renderOrderTable(filteredOrders);
        }, 300);
        
        [siteFilter, buildingFilter, statusFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('input', filterOrders);
            }
        });
    }

    /**
     * Load order for signing
     * @param {string} orderNumber 
     */
    loadOrderForSigning(orderNumber) {
        const order = this.orderService.getOrder(orderNumber);
        
        if (!order) {
            showToast('找不到此維修單', 'error');
            return;
        }
        
        if (order.isSigned()) {
            this.showAlreadySignedMessage(order);
            return;
        }
        
        this.currentOrder = order;
        this.renderOrderDetails(order);
        this.showView('signature');
    }

    /**
     * Render order details for signing
     * @param {Order} order 
     */
    renderOrderDetails(order) {
        const orderDetails = document.getElementById('orderDetails');
        if (!orderDetails) return;
        
        const details = order.getDetails();
        
        let html = '<h3>維修單詳細資訊</h3><div class="detail-grid">';
        
        Object.entries(details).forEach(([category, items]) => {
            html += `<div class="detail-category">`;
            html += `<h4 style="color: #374151; margin-bottom: 12px;">${category}</h4>`;
            
            Object.entries(items).forEach(([label, value]) => {
                html += `
                    <div class="detail-item">
                        <span class="detail-label">${label}</span>
                        <span class="detail-value">${value}</span>
                    </div>
                `;
            });
            
            html += `</div>`;
        });
        
        html += '</div>';
        
        // Add photos if any
        if (order.photos && order.photos.length > 0) {
            html += '<h4 style="margin-top: 24px; margin-bottom: 12px;">維修照片</h4>';
            html += '<div class="photo-preview">';
            
            order.photos.forEach(photo => {
                html += `
                    <div class="photo-item">
                        <img src="${photo.data}" alt="${photo.originalName}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        orderDetails.innerHTML = html;
    }

    /**
     * Show already signed message
     * @param {Order} order 
     */
    showAlreadySignedMessage(order) {
        const signedHtml = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #059669; margin-bottom: 20px;">✅ 此維修單已完成簽名</h2>
                <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: left;">
                    <h3>維修單資訊</h3>
                    <p><strong>維修單號：</strong>${order.orderNumber}</p>
                    <p><strong>案場：</strong>${order.site}</p>
                    <p><strong>位置：</strong>${order.getLocation()}</p>
                    <p><strong>金額：</strong>${order.getFormattedAmount()}</p>
                    <p><strong>簽名時間：</strong>${formatDateDisplay(order.signedAt.slice(0, 10))}</p>
                </div>
                <p style="color: #6b7280;">感謝您的配合！</p>
                <div style="margin-top: 30px;">
                    <button onclick="window.close()" class="btn btn-primary">關閉視窗</button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = signedHtml;
    }

    /**
     * View order details
     * @param {string} orderNumber 
     */
    viewOrderDetails(orderNumber) {
        const order = this.orderService.getOrder(orderNumber);
        if (!order) {
            showToast('找不到此維修單', 'error');
            return;
        }
        
        // Create modal with order details
        const modal = this.createOrderDetailsModal(order);
        document.body.appendChild(modal);
    }

    /**
     * Create order details modal
     * @param {Order} order 
     * @returns {HTMLElement}
     */
    createOrderDetailsModal(order) {
        const modal = createElement('div', { className: 'modal' });
        
        const content = createElement('div', { className: 'modal-content' });
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3>維修單詳細資訊</h3>
                <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
        `;
        
        const details = order.getDetails();
        Object.entries(details).forEach(([category, items]) => {
            html += `<div style="margin-bottom: 20px;">`;
            html += `<h4 style="color: #374151; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">${category}</h4>`;
            
            Object.entries(items).forEach(([label, value]) => {
                html += `
                    <div style="display: flex; margin-bottom: 8px;">
                        <span style="min-width: 120px; font-weight: 500; color: #6b7280;">${label}：</span>
                        <span style="color: #1f2937;">${value}</span>
                    </div>
                `;
            });
            
            html += `</div>`;
        });
        
        // Add photos if any
        if (order.photos && order.photos.length > 0) {
            html += '<h4 style="margin-top: 24px; margin-bottom: 12px;">維修照片</h4>';
            html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">';
            
            order.photos.forEach(photo => {
                html += `
                    <div style="aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
                        <img src="${photo.data}" alt="${photo.originalName}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;" onclick="window.open(this.src)">
                    </div>
                `;
            });
            
            html += '</div>';
        }
        
        // Add signature if signed
        if (order.signature) {
            html += `
                <h4 style="margin-top: 24px; margin-bottom: 12px;">客戶簽名</h4>
                <div style="text-align: center; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                    <img src="${order.signature}" alt="客戶簽名" style="max-width: 300px; max-height: 150px;">
                </div>
            `;
        }
        
        html += `
            <div style="margin-top: 24px; text-align: right;">
                <button onclick="app.copyOrderLink('${order.orderNumber}')" class="btn btn-secondary" style="margin-right: 8px;">複製簽名連結</button>
                <button onclick="this.closest('.modal').remove()" class="btn btn-primary">關閉</button>
            </div>
        `;
        
        content.innerHTML = html;
        modal.appendChild(content);
        
        return modal;
    }

    /**
     * Copy order link
     * @param {string} orderNumber 
     */
    async copyOrderLink(orderNumber) {
        const link = generateOrderLink(orderNumber);
        await copyToClipboard(link);
    }

    /**
     * Delete order
     * @param {string} orderNumber 
     */
    async deleteOrder(orderNumber) {
        if (!confirm('確定要刪除此維修單嗎？此操作無法復原。')) {
            return;
        }
        
        try {
            await this.orderService.deleteOrder(orderNumber);
            showToast('維修單已刪除', 'success');
            this.loadOrderList();
        } catch (error) {
            showToast(`刪除失敗: ${error.message}`, 'error');
        }
    }

    /**
     * Close modal
     * @param {HTMLElement} modal 
     */
    closeModal(modal) {
        modal.remove();
    }

    /**
     * Handle escape key
     */
    handleEscape() {
        // Close any open modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
        
        // Hide toast
        hideToast();
    }

    /**
     * Export orders
     * @param {string} format 
     */
    exportOrders(format = 'csv') {
        try {
            const filters = this.getCurrentFilters();
            let filename, content, mimeType;
            
            if (format === 'csv') {
                content = this.orderService.exportToCSV(filters);
                filename = `maintenance_orders_${formatDate(new Date())}.csv`;
                mimeType = 'text/csv';
            } else if (format === 'json') {
                content = this.orderService.exportToJSON(filters);
                filename = `maintenance_orders_${formatDate(new Date())}.json`;
                mimeType = 'application/json';
            }
            
            downloadFile(content, filename, mimeType);
            showToast('匯出成功', 'success');
        } catch (error) {
            showToast(`匯出失敗: ${error.message}`, 'error');
        }
    }

    /**
     * Get current filter values
     * @returns {Object}
     */
    getCurrentFilters() {
        const siteFilter = document.getElementById('siteFilter');
        const buildingFilter = document.getElementById('buildingFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        return {
            site: siteFilter?.value || '',
            building: buildingFilter?.value || '',
            status: statusFilter?.value || ''
        };
    }

    /**
     * Show statistics
     */
    showStatistics() {
        const stats = this.orderService.getOrderStatistics();
        
        const statsHtml = `
            <div class="modal">
                <div class="modal-content">
                    <h3>維修單統計</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0;">
                        <div style="text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px;">
                            <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${stats.total}</div>
                            <div style="color: #6b7280;">總維修單數</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: #fef3c7; border-radius: 8px;">
                            <div style="font-size: 24px; font-weight: bold; color: #92400e;">${stats.pending}</div>
                            <div style="color: #92400e;">待簽名</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: #d1fae5; border-radius: 8px;">
                            <div style="font-size: 24px; font-weight: bold; color: #065f46;">${stats.signed}</div>
                            <div style="color: #065f46;">已簽名</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: #e0e7ff; border-radius: 8px;">
                            <div style="font-size: 24px; font-weight: bold; color: #3730a3;">${stats.thisMonth}</div>
                            <div style="color: #3730a3;">本月新增</div>
                        </div>
                    </div>
                    <div style="margin: 20px 0;">
                        <p><strong>總金額：</strong>${formatCurrency(stats.totalAmount)}</p>
                        <p><strong>平均金額：</strong>${formatCurrency(stats.averageAmount)}</p>
                    </div>
                    <div style="text-align: right;">
                        <button onclick="this.closest('.modal').remove()" class="btn btn-primary">關閉</button>
                    </div>
                </div>
            </div>
        `;
        
        const statsModal = createElement('div');
        statsModal.innerHTML = statsHtml;
        document.body.appendChild(statsModal.firstElementChild);
    }

    /**
     * Get application status
     * @returns {Object}
     */
    getAppStatus() {
        return {
            currentView: this.currentView,
            currentOrder: this.currentOrder?.orderNumber || null,
            storageAvailable: this.storageService.isStorageAvailable(),
            orderCount: this.orderService.getAllOrders().length,
            storageStats: this.storageService.getStorageStats()
        };
    }
}
    
    setupEventListeners() {
        console.log('🎧 設定事件監聽器 - comprehensive event setup');
        
        try {
            // 新增工務人員按鈕
            const addStaffBtn = document.getElementById('addStaffBtn');
            if (addStaffBtn) {
                addStaffBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖱️ 新增工務人員按鈕被點擊');
                    if (this.formHandler && typeof this.formHandler.showAddStaffModal === 'function') {
                        this.formHandler.showAddStaffModal();
                    } else {
                        console.error('❌ FormHandler 或 showAddStaffModal 方法不存在');
                        alert('系統錯誤：無法開啟新增人員視窗');
                    }
                });
                console.log('✅ 新增工務人員按鈕事件已設定');
            } else {
                console.warn('⚠️ 找不到新增工務人員按鈕');
            }
            
            // 工務人員表單提交
            const addStaffForm = document.getElementById('addStaffForm');
            if (addStaffForm) {
                addStaffForm.addEventListener('submit', (e) => {
                    console.log('📝 工務人員表單提交');
                    if (this.formHandler && typeof this.formHandler.handleAddStaff === 'function') {
                        this.formHandler.handleAddStaff(e);
                    } else {
                        e.preventDefault();
                        console.error('❌ FormHandler 或 handleAddStaff 方法不存在');
                        alert('系統錯誤：無法處理表單提交');
                    }
                });
                console.log('✅ 工務人員表單事件已設定');
            } else {
                console.warn('⚠️ 找不到工務人員表單');
            }
            
            // 取消按鈕
            const cancelBtn = document.getElementById('cancelAddStaffBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('❌ 取消新增工務人員');
                    if (this.formHandler && typeof this.formHandler.hideAddStaffModal === 'function') {
                        this.formHandler.hideAddStaffModal();
                    }
                });
                console.log('✅ 取消按鈕事件已設定');
            }
            
            // Toast 關閉按鈕
            const closeToastBtn = document.getElementById('closeToastBtn');
            if (closeToastBtn) {
                closeToastBtn.addEventListener('click', () => {
                    if (typeof hideToast === 'function') {
                        hideToast();
                    }
                });
                console.log('✅ Toast 關閉按鈕事件已設定');
            }
            
        } catch (error) {
            console.error('💥 設定事件監聽器失敗:', error);
        }
    }
    
    initializeApplication() {
        console.log('🚀 初始化應用程式');
        
        try {
            // 初始化服務
            this.orderService = new OrderService();
            this.formHandler = new FormHandler();
            
            // 設定事件監聽器
            this.setupEventListeners();
            
            // 載入工務人員選項
            if (this.formHandler && typeof this.formHandler.updateStaffOptions === 'function') {
                this.formHandler.updateStaffOptions();
            }
            
            // 初始化表單
            this.initializeForm();
            
            console.log('✅ 應用程式初始化完成');
            
        } catch (error) {
            console.error('💥 應用程式初始化失敗:', error);
        }
    }