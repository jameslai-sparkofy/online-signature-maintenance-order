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
        this.form = document.getElementById('maintenanceForm');
        if (!this.form) return;
        
        this.photoHandler = new PhotoHandler();
        this.setupForm();
        this.bindEvents();
        this.loadStaffOptions();
        this.loadPreviousValues();
    }

    /**
     * Setup form initial state
     */
    setupForm() {
        // Set default date to today
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = formatDate(new Date());
        }
        
        // Generate and set order number
        const orderNumberInput = document.getElementById('orderNumber');
        if (orderNumberInput) {
            orderNumberInput.value = generateOrderNumber();
        }
    }

    /**
     * Bind form events
     */
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Form reset
        this.form.addEventListener('reset', () => this.handleReset());
        
        // Add staff button
        const addStaffBtn = document.getElementById('addStaffBtn');
        if (addStaffBtn) {
            addStaffBtn.addEventListener('click', () => this.showAddStaffModal());
        }
        
        // Add staff form
        const addStaffForm = document.getElementById('addStaffForm');
        if (addStaffForm) {
            addStaffForm.addEventListener('submit', (e) => this.handleAddStaff(e));
        }
        
        // Cancel add staff
        const cancelBtn = document.getElementById('cancelAddStaffBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideAddStaffModal());
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
        const staffSelect = document.getElementById('staff');
        if (!staffSelect) return;
        
        const staffMembers = this.storageService.getAllStaff();
        
        // Clear existing options (except first)
        while (staffSelect.children.length > 1) {
            staffSelect.removeChild(staffSelect.lastChild);
        }
        
        // Add staff options
        staffMembers.forEach(staff => {
            const option = createElement('option', { value: staff.name }, staff.name);
            staffSelect.appendChild(option);
        });
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
        
        try {
            const formData = new FormData(e.target);
            const staffData = {
                name: formData.get('staffName').trim(),
                phone: formData.get('staffPhone').trim(),
                addedAt: new Date().toISOString()
            };
            
            // Validate
            if (!staffData.name) {
                showToast('請輸入姓名', 'error');
                return;
            }
            
            // Check if already exists
            const existingStaff = this.storageService.getAllStaff();
            if (existingStaff.some(staff => staff.name === staffData.name)) {
                showToast('此工務人員已存在', 'error');
                return;
            }
            
            // Save staff
            this.storageService.saveStaff(staffData);
            
            // Reload staff options
            this.loadStaffOptions();
            
            // Select the new staff
            const staffSelect = document.getElementById('staff');
            if (staffSelect) {
                staffSelect.value = staffData.name;
            }
            
            showToast('工務人員新增成功', 'success');
            this.hideAddStaffModal();
            
        } catch (error) {
            showToast(`新增工務人員失敗: ${error.message}`, 'error');
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