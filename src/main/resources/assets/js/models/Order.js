// Order model for maintenance orders

class Order {
    constructor(data = {}) {
        // 使用安全的初始化，避免在載入時立即呼叫可能未定義的函數
        this.orderNumber = data.orderNumber || this._generateOrderNumber();
        this.date = data.date || this._formatDate(new Date());
        this.site = data.site || '';
        this.building = data.building || '';
        this.floor = data.floor || '';
        this.unit = data.unit || '';
        this.reason = data.reason || '';
        this.staff = data.staff || '';
        this.amount = data.amount || 0;
        this.photos = data.photos || [];
        this.status = data.status || 'pending'; // pending, signed
        this.signature = data.signature || null;
        this.customerEmail = data.customerEmail || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.signedAt = data.signedAt || null;
        this.link = data.link || this._generateOrderLink(this.orderNumber);
    }
    
    /**
     * 安全的訂單號生成（避免依賴外部函數）
     */
    _generateOrderNumber() {
        if (typeof generateOrderNumber === 'function') {
            return generateOrderNumber();
        }
        // fallback 實現
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${dateStr}-${randomNum}`;
    }
    
    /**
     * 安全的日期格式化（避免依賴外部函數）
     */
    _formatDate(date) {
        if (typeof formatDate === 'function') {
            return formatDate(date);
        }
        // fallback 實現
        return date.toISOString().slice(0, 10);
    }
    
    /**
     * 安全的連結生成（避免依賴外部函數）
     */
    _generateOrderLink(orderNumber) {
        if (typeof generateOrderLink === 'function') {
            return generateOrderLink(orderNumber);
        }
        // fallback 實現
        const baseUrl = window.location.origin + window.location.pathname.replace('/index.html', '').replace(/\/$/, '');
        return `${baseUrl}/signature.html?order=${orderNumber}`;
    }

    /**
     * Convert order to JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            orderNumber: this.orderNumber,
            date: this.date,
            site: this.site,
            building: this.building,
            floor: this.floor,
            unit: this.unit,
            reason: this.reason,
            staff: this.staff,
            amount: this.amount,
            photos: this.photos,
            status: this.status,
            signature: this.signature,
            customerEmail: this.customerEmail,
            createdAt: this.createdAt,
            signedAt: this.signedAt,
            link: this.link
        };
    }

    /**
     * Create Order from JSON
     * @param {Object} json 
     * @returns {Order}
     */
    static fromJSON(json) {
        return new Order(json);
    }

    /**
     * Get location string
     * @returns {string}
     */
    getLocation() {
        return `${this.building}棟${this.floor}樓${this.unit}戶`;
    }

    /**
     * Get status display text
     * @returns {string}
     */
    getStatusText() {
        switch (this.status) {
            case 'pending':
                return '待簽名';
            case 'signed':
                return '已簽名';
            default:
                return '未知狀態';
        }
    }

    /**
     * Get formatted amount
     * @returns {string}
     */
    getFormattedAmount() {
        if (typeof formatCurrency === 'function') {
            return formatCurrency(this.amount);
        }
        // fallback 實現
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(this.amount);
    }

    /**
     * Get formatted date
     * @returns {string}
     */
    getFormattedDate() {
        return formatDateDisplay(this.date);
    }

    /**
     * Check if order is signed
     * @returns {boolean}
     */
    isSigned() {
        return this.status === 'signed';
    }

    /**
     * Sign the order
     * @param {string} signature - Base64 signature data
     * @param {string} email - Customer email (optional)
     */
    sign(signature, email = '') {
        this.signature = signature;
        this.customerEmail = email;
        this.status = 'signed';
        this.signedAt = new Date().toISOString();
    }

    /**
     * Validate order data
     * @returns {Object} {isValid: boolean, errors: string[]}
     */
    validate() {
        const errors = [];

        if (!this.site?.trim()) {
            errors.push('案場不能為空');
        }

        if (!this.building?.trim()) {
            errors.push('棟別不能為空');
        }

        if (!this.floor?.trim()) {
            errors.push('樓層不能為空');
        }

        if (!this.unit?.trim()) {
            errors.push('戶別不能為空');
        }

        if (!this.reason?.trim()) {
            errors.push('維修原因不能為空');
        }

        if (!this.staff?.trim()) {
            errors.push('請選擇工務人員');
        }

        if (!this.amount || this.amount <= 0) {
            errors.push('金額必須大於0');
        }

        if (!this.date) {
            errors.push('請選擇日期');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get order summary for display
     * @returns {Object}
     */
    getSummary() {
        return {
            orderNumber: this.orderNumber,
            date: this.getFormattedDate(),
            site: this.site,
            location: this.getLocation(),
            staff: this.staff,
            amount: this.getFormattedAmount(),
            status: this.getStatusText(),
            photoCount: this.photos.length
        };
    }

    /**
     * Get detailed order information
     * @returns {Object}
     */
    getDetails() {
        return {
            基本資訊: {
                維修單號: this.orderNumber,
                日期: this.getFormattedDate(),
                案場: this.site,
                位置: this.getLocation(),
                工務人員: this.staff,
                金額: this.getFormattedAmount()
            },
            維修內容: {
                原因: this.reason,
                照片數量: `${this.photos.length}張`
            },
            狀態資訊: {
                狀態: this.getStatusText(),
                建立時間: formatDateDisplay(this.createdAt.slice(0, 10)),
                簽名時間: this.signedAt ? formatDateDisplay(this.signedAt.slice(0, 10)) : '未簽名'
            }
        };
    }

    /**
     * Export order to CSV format
     * @returns {string}
     */
    toCSV() {
        const csvData = [
            this.orderNumber,
            this.date,
            this.site,
            this.building,
            this.floor,
            this.unit,
            this.reason,
            this.staff,
            this.amount,
            this.getStatusText(),
            this.createdAt,
            this.signedAt || ''
        ];
        
        return csvData.map(field => `"${field}"`).join(',');
    }

    /**
     * Get CSV headers
     * @returns {string}
     */
    static getCSVHeaders() {
        return [
            '維修單號',
            '日期',
            '案場',
            '棟別',
            '樓層',
            '戶別',
            '維修原因',
            '工務人員',
            '金額',
            '狀態',
            '建立時間',
            '簽名時間'
        ].map(header => `"${header}"`).join(',');
    }
}