// Utility functions for the maintenance order system

/**
 * Generate a unique order number
 * @returns {string} Order number in format YYYYMMDD-XXXX
 */
function generateOrderNumber() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${dateStr}-${randomNum}`;
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

/**
 * Format date to readable Chinese format
 * @param {string} dateStr 
 * @returns {string}
 */
function formatDateDisplay(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}年${month}月${day}日`;
}

/**
 * Format currency to Taiwan Dollar
 * @param {number} amount 
 * @returns {string}
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show toast message
 * @param {string} message 
 * @param {string} type - success, error, info
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('messageToast');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

/**
 * Hide toast message
 */
function hideToast() {
    const toast = document.getElementById('messageToast');
    toast.classList.add('hidden');
}

/**
 * Validate form data
 * @param {Object} formData 
 * @returns {Object} {isValid: boolean, errors: string[]}
 */
function validateOrderForm(formData) {
    const errors = [];
    
    if (!formData.site?.trim()) {
        errors.push('案場不能為空');
    }
    
    if (!formData.building?.trim()) {
        errors.push('棟別不能為空');
    }
    
    if (!formData.floor?.trim()) {
        errors.push('樓層不能為空');
    }
    
    if (!formData.unit?.trim()) {
        errors.push('戶別不能為空');
    }
    
    if (!formData.reason?.trim()) {
        errors.push('維修原因不能為空');
    }
    
    if (!formData.staff?.trim()) {
        errors.push('請選擇工務人員');
    }
    
    if (!formData.amount || formData.amount <= 0) {
        errors.push('金額必須大於0');
    }
    
    if (!formData.date) {
        errors.push('請選擇日期');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Debounce function
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Create element with attributes
 * @param {string} tag 
 * @param {Object} attributes 
 * @param {string} textContent 
 * @returns {HTMLElement}
 */
function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    return element;
}

/**
 * Convert file to base64
 * @param {File} file 
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Download data as file
 * @param {string} data 
 * @param {string} filename 
 * @param {string} type 
 */
function downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Generate unique link for order
 * @param {string} orderNumber 
 * @returns {string}
 */
function generateOrderLink(orderNumber) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?order=${orderNumber}`;
}

/**
 * Get URL parameters
 * @param {string} param 
 * @returns {string|null}
 */
function getUrlParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Copy text to clipboard
 * @param {string} text 
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('已複製到剪貼簿', 'success');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('已複製到剪貼簿', 'success');
    }
}

// Export functions for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateOrderNumber,
        formatDate,
        formatDateDisplay,
        formatCurrency,
        isValidEmail,
        showToast,
        hideToast,
        validateOrderForm,
        debounce,
        createElement,
        fileToBase64,
        downloadFile,
        generateOrderLink,
        getUrlParameter,
        copyToClipboard
    };
}