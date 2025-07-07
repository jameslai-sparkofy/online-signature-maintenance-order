// Form handling and validation

class FormHandler {
    constructor() {
        this.form = null;
        this.orderService = new OrderService();
        this.storageService = new StorageService();
        this.photoHandler = null;
        
        this.init();
    }

    /**
     * Initialize form handler
     */
    init() {
        console.log('FormHandler.init() called');
        this.form = document.getElementById('maintenanceForm');
        if (!this.form) {
            console.error('MaintenanceForm not found!');
            return;
        }
        
        console.log('Form found, initializing components...');
        this.photoHandler = new PhotoHandler();
        this.setupForm();
        this.bindEvents();
        this.loadStaffOptions();
        this.loadPreviousValues();
        console.log('FormHandler initialization complete');
    }

    /**
     * Setup form initial state
     */
    setupForm() {
        // Set default date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date();
            const formattedDate = today.getFullYear() + '-' + 
                                String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                                String(today.getDate()).padStart(2, '0');
            dateInput.value = formattedDate;
        }
        
        // Generate and set order number
        const orderNumberInput = document.getElementById('orderNumber');
        if (orderNumberInput) {
            const now = new Date();
            const dateStr = now.getFullYear() + 
                          String(now.getMonth() + 1).padStart(2, '0') + 
                          String(now.getDate()).padStart(2, '0');
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            orderNumberInput.value = `${dateStr}-${randomNum}`;
        }
    }

    /**
     * Bind form events
     */
    bindEvents() {
        console.log('Binding form events...');
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Form reset
        this.form.addEventListener('reset', () => this.handleReset());
        
        // Add staff button
        const addStaffBtn = document.getElementById('addStaffBtn');
        if (addStaffBtn) {
            console.log('Add staff button found, binding click event');
            addStaffBtn.addEventListener('click', () => this.showAddStaffModal());
        } else {
            console.error('Add staff button not found!');
        }
        
        // Add staff form
        const addStaffForm = document.getElementById('addStaffForm');
        if (addStaffForm) {
            console.log('Add staff form found, binding submit event');
            addStaffForm.addEventListener('submit', (e) => this.handleAddStaff(e));
        } else {
            console.error('Add staff form not found!');
        }
        
        // Cancel add staff
        const cancelBtn = document.getElementById('cancelAddStaffBtn');
        if (cancelBtn) {
            console.log('Cancel button found, binding click event');
            cancelBtn.addEventListener('click', () => this.hideAddStaffModal());
        } else {
            console.error('Cancel add staff button not found!');
        }
        
        // Auto-save site for next time
        const siteInput = document.getElementById('site');
        if (siteInput) {
            siteInput.addEventListener('change', () => {
                this.storageService.saveSettings({ lastUsedSite: siteInput.value });
            });
        }
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    /**
     * Handle form submission
     * @param {Event} e 
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            // Collect form data
            const formData = this.getFormData();
            
            // Validate form
            const validation = this.validateForm(formData);
            if (!validation.isValid) {
                showToast(validation.errors.join('\n'), 'error');
                return;
            }
            
            // Include photos
            formData.photos = this.photoHandler.getPhotosData();
            
            // Create order
            const order = await this.orderService.createOrder(formData);
            
            showToast('維修單建立成功！', 'success');
            
            // Show success message with link
            this.showOrderCreatedSuccess(order);
            
            // Reset form
            this.resetForm();
            
        } catch (error) {
            showToast(`建立維修單失敗: ${error.message}`, 'error');
        }
    }

    /**
     * Get form data
     * @returns {Object}
     */
    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value.trim();
        }
        
        // Convert amount to number
        if (data.amount) {
            data.amount = parseFloat(data.amount);
        }
        
        return data;
    }

    /**
     * Validate form
     * @param {Object} formData 
     * @returns {Object}
     */
    validateForm(formData) {
        const errors = [];
        
        // Required fields
        if (!formData.site) errors.push('案場不能為空');
        if (!formData.building) errors.push('棟別不能為空');
        if (!formData.floor) errors.push('樓層不能為空');
        if (!formData.unit) errors.push('戶別不能為空');
        if (!formData.reason) errors.push('維修原因不能為空');
        if (!formData.staff) errors.push('請選擇工務人員');
        if (!formData.amount || formData.amount <= 0) errors.push('金額必須大於0');
        if (!formData.date) errors.push('請選擇日期');
        
        // Photo validation
        const photoValidation = this.photoHandler.validatePhotos();
        if (!photoValidation.isValid) {
            errors.push(...photoValidation.errors);
        }
        
        // Date validation
        if (formData.date) {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            const maxDate = new Date();
            maxDate.setDate(today.getDate() + 30);
            
            if (selectedDate > maxDate) {
                errors.push('日期不能超過30天後');
            }
        }
        
        // Amount validation
        if (formData.amount && formData.amount > 1000000) {
            errors.push('金額不能超過1,000,000元');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate individual field
     * @param {HTMLElement} field 
     */
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        
        // Remove previous error styling
        field.classList.remove('error');
        
        switch (field.id) {
            case 'site':
                if (!value) {
                    isValid = false;
                    message = '案場不能為空';
                }
                break;
                
            case 'building':
                if (!value) {
                    isValid = false;
                    message = '棟別不能為空';
                }
                break;
                
            case 'floor':
                if (!value) {
                    isValid = false;
                    message = '樓層不能為空';
                }
                break;
                
            case 'unit':
                if (!value) {
                    isValid = false;
                    message = '戶別不能為空';
                }
                break;
                
            case 'reason':
                if (!value) {
                    isValid = false;
                    message = '維修原因不能為空';
                } else if (value.length < 5) {
                    isValid = false;
                    message = '維修原因至少需要5個字';
                }
                break;
                
            case 'staff':
                if (!value) {
                    isValid = false;
                    message = '請選擇工務人員';
                }
                break;
                
            case 'amount':
                const amount = parseFloat(value);
                if (!value || amount <= 0) {
                    isValid = false;
                    message = '金額必須大於0';
                } else if (amount > 1000000) {
                    isValid = false;
                    message = '金額不能超過1,000,000元';
                }
                break;
        }
        
        if (!isValid) {
            field.classList.add('error');
            field.title = message;
        } else {
            field.title = '';
        }
        
        return isValid;
    }

    /**
     * Handle form reset
     */
    handleReset() {
        setTimeout(() => {
            this.setupForm();
            this.photoHandler.clearPhotos();
            this.loadPreviousValues();
        }, 10);
    }

    /**
     * Reset form
     */
    resetForm() {
        this.form.reset();
        this.setupForm();
        this.photoHandler.clearPhotos();
        this.loadPreviousValues();
    }

    /**
     * Load staff options
     */
    loadStaffOptions() {
        console.log('loadStaffOptions called');
        const staffSelect = document.getElementById('staff');
        if (!staffSelect) {
            console.log('Staff select element not found');
            return;
        }
        
        const staffMembers = this.storageService.getAllStaff();
        console.log('Loading staff members:', staffMembers);
        
        // Clear existing options (except first)
        while (staffSelect.children.length > 1) {
            staffSelect.removeChild(staffSelect.lastChild);
        }
        
        // Add staff options
        staffMembers.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.name;
            option.textContent = staff.name;
            staffSelect.appendChild(option);
            console.log('Added staff option:', staff.name);
        });
        
        console.log('Staff options loaded, total options:', staffSelect.children.length);
    }

    /**
     * Load previous values from settings
     */
    loadPreviousValues() {
        const settings = this.storageService.getSettings();
        
        if (settings.autoFillPreviousValues && settings.lastUsedSite) {
            const siteInput = document.getElementById('site');
            if (siteInput && !siteInput.value) {
                siteInput.value = settings.lastUsedSite;
            }
        }
    }

    /**
     * Show add staff modal
     */
    showAddStaffModal() {
        const modal = document.getElementById('addStaffModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Hide add staff modal
     */
    hideAddStaffModal() {
        const modal = document.getElementById('addStaffModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Clear form
        const form = document.getElementById('addStaffForm');
        if (form) {
            form.reset();
        }
    }

    /**
     * Handle add staff
     * @param {Event} e 
     */
    async handleAddStaff(e) {
        e.preventDefault();
        console.log('handleAddStaff called');
        
        try {
            const formData = new FormData(e.target);
            const staffName = formData.get('staffName');
            const staffPhone = formData.get('staffPhone');
            
            console.log('Form data:', { staffName, staffPhone });
            
            if (!staffName || !staffName.trim()) {
                console.log('No staff name provided');
                alert('請輸入姓名');
                return;
            }
            
            const staffData = {
                name: staffName.trim(),
                phone: staffPhone ? staffPhone.trim() : '',
                addedAt: new Date().toISOString()
            };
            
            console.log('Staff data to save:', staffData);
            
            // Check if already exists
            const existingStaff = this.storageService.getAllStaff();
            console.log('Existing staff:', existingStaff);
            
            if (existingStaff.some(staff => staff.name === staffData.name)) {
                console.log('Staff already exists');
                alert('此工務人員已存在');
                return;
            }
            
            // Save staff
            this.storageService.saveStaff(staffData);
            console.log('Staff saved successfully');
            
            // Reload staff options
            this.loadStaffOptions();
            console.log('Staff options reloaded');
            
            // Select the new staff
            const staffSelect = document.getElementById('staff');
            if (staffSelect) {
                staffSelect.value = staffData.name;
                console.log('New staff selected in dropdown');
            }
            
            // Show success message
            if (typeof showToast === 'function') {
                showToast('工務人員新增成功', 'success');
            } else {
                alert('工務人員新增成功');
            }
            
            this.hideAddStaffModal();
            console.log('Modal hidden');
            
        } catch (error) {
            console.error('Error adding staff:', error);
            if (typeof showToast === 'function') {
                showToast(`新增工務人員失敗: ${error.message}`, 'error');
            } else {
                alert(`新增工務人員失敗: ${error.message}`);
            }
        }
    }

    /**
     * Show order created success message
     * @param {Order} order 
     */
    showOrderCreatedSuccess(order) {
        const link = order.link;
        
        const successHtml = `
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #0369a1; margin-bottom: 16px;">✅ 維修單建立成功</h3>
                <div style="margin-bottom: 16px;">
                    <strong>維修單號：</strong>${order.orderNumber}<br>
                    <strong>案場：</strong>${order.site}<br>
                    <strong>位置：</strong>${order.getLocation()}<br>
                    <strong>金額：</strong>${order.getFormattedAmount()}
                </div>
                <div style="margin-bottom: 16px;">
                    <strong>簽名連結：</strong><br>
                    <input type="text" value="${link}" readonly style="width: 100%; padding: 8px; margin: 4px 0; border: 1px solid #d1d5db; border-radius: 4px;">
                    <button onclick="copyToClipboard('${link}')" class="btn btn-small btn-primary">複製連結</button>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    請將上方連結傳送給客戶或工地主任進行簽名確認
                </p>
            </div>
        `;
        
        // Insert after form
        const successDiv = createElement('div', { id: 'orderSuccess' });
        successDiv.innerHTML = successHtml;
        
        // Remove existing success message
        const existing = document.getElementById('orderSuccess');
        if (existing) {
            existing.remove();
        }
        
        this.form.parentNode.insertBefore(successDiv, this.form.nextSibling);
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Auto-save form data
     */
    autoSave() {
        const formData = this.getFormData();
        localStorage.setItem('draft_order', JSON.stringify(formData));
    }

    /**
     * Load auto-saved data
     */
    loadAutoSaved() {
        try {
            const draftData = localStorage.getItem('draft_order');
            if (draftData) {
                const data = JSON.parse(draftData);
                
                // Fill form with saved data
                Object.entries(data).forEach(([key, value]) => {
                    const field = document.getElementById(key);
                    if (field && value) {
                        field.value = value;
                    }
                });
                
                showToast('已載入上次未完成的表單', 'info');
            }
        } catch (error) {
            console.error('Error loading auto-saved data:', error);
        }
    }

    /**
     * Clear auto-saved data
     */
    clearAutoSaved() {
        localStorage.removeItem('draft_order');
    }

    /**
     * Enable auto-save
     */
    enableAutoSave() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        const autoSaveHandler = debounce(() => this.autoSave(), 1000);
        
        inputs.forEach(input => {
            input.addEventListener('input', autoSaveHandler);
        });
    }
}