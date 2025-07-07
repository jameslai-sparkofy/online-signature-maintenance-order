// Storage service for managing data persistence

class StorageService {
    constructor() {
        this.storageKey = 'maintenance_orders';
        this.staffKey = 'staff_members';
        this.settingsKey = 'app_settings';
    }

    /**
     * Save order to localStorage
     * @param {Order} order 
     */
    saveOrder(order) {
        const orders = this.getAllOrders();
        const existingIndex = orders.findIndex(o => o.orderNumber === order.orderNumber);
        
        if (existingIndex >= 0) {
            orders[existingIndex] = order.toJSON();
        } else {
            orders.push(order.toJSON());
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(orders));
    }

    /**
     * Get all orders from localStorage
     * @returns {Object[]}
     */
    getAllOrders() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading orders:', error);
            return [];
        }
    }

    /**
     * Get order by number
     * @param {string} orderNumber 
     * @returns {Object|null}
     */
    getOrder(orderNumber) {
        const orders = this.getAllOrders();
        return orders.find(order => order.orderNumber === orderNumber) || null;
    }

    /**
     * Delete order
     * @param {string} orderNumber 
     */
    deleteOrder(orderNumber) {
        const orders = this.getAllOrders();
        const filteredOrders = orders.filter(order => order.orderNumber !== orderNumber);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredOrders));
    }

    /**
     * Get orders with filters
     * @param {Object} filters 
     * @returns {Object[]}
     */
    getFilteredOrders(filters = {}) {
        let orders = this.getAllOrders();

        if (filters.site) {
            orders = orders.filter(order => 
                order.site.toLowerCase().includes(filters.site.toLowerCase())
            );
        }

        if (filters.building) {
            orders = orders.filter(order => 
                order.building.toLowerCase().includes(filters.building.toLowerCase())
            );
        }

        if (filters.status) {
            orders = orders.filter(order => order.status === filters.status);
        }

        if (filters.dateFrom) {
            orders = orders.filter(order => order.date >= filters.dateFrom);
        }

        if (filters.dateTo) {
            orders = orders.filter(order => order.date <= filters.dateTo);
        }

        if (filters.staff) {
            orders = orders.filter(order => 
                order.staff.toLowerCase().includes(filters.staff.toLowerCase())
            );
        }

        // Sort by creation date (newest first)
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Save staff member
     * @param {Object} staff 
     */
    saveStaff(staff) {
        const staffMembers = this.getAllStaff();
        const existingIndex = staffMembers.findIndex(s => s.name === staff.name);
        
        if (existingIndex >= 0) {
            staffMembers[existingIndex] = staff;
        } else {
            staffMembers.push(staff);
        }
        
        localStorage.setItem(this.staffKey, JSON.stringify(staffMembers));
    }

    /**
     * Get all staff members
     * @returns {Object[]}
     */
    getAllStaff() {
        try {
            const data = localStorage.getItem(this.staffKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading staff:', error);
            return [];
        }
    }

    /**
     * Delete staff member
     * @param {string} name 
     */
    deleteStaff(name) {
        const staffMembers = this.getAllStaff();
        const filteredStaff = staffMembers.filter(staff => staff.name !== name);
        localStorage.setItem(this.staffKey, JSON.stringify(filteredStaff));
    }

    /**
     * Get app settings
     * @returns {Object}
     */
    getSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * Save app settings
     * @param {Object} settings 
     */
    saveSettings(settings) {
        const currentSettings = this.getSettings();
        const updatedSettings = { ...currentSettings, ...settings };
        localStorage.setItem(this.settingsKey, JSON.stringify(updatedSettings));
    }

    /**
     * Get default settings
     * @returns {Object}
     */
    getDefaultSettings() {
        return {
            lastUsedSite: '',
            autoFillPreviousValues: true,
            emailNotifications: true,
            defaultCurrency: 'TWD',
            dateFormat: 'YYYY-MM-DD',
            theme: 'light'
        };
    }

    /**
     * Export all data
     * @returns {Object}
     */
    exportData() {
        return {
            orders: this.getAllOrders(),
            staff: this.getAllStaff(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import data
     * @param {Object} data 
     */
    importData(data) {
        try {
            if (data.orders) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.orders));
            }
            
            if (data.staff) {
                localStorage.setItem(this.staffKey, JSON.stringify(data.staff));
            }
            
            if (data.settings) {
                localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Clear all data
     */
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.staffKey);
        localStorage.removeItem(this.settingsKey);
    }

    /**
     * Get storage statistics
     * @returns {Object}
     */
    getStorageStats() {
        const orders = this.getAllOrders();
        const staff = this.getAllStaff();
        
        return {
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            signedOrders: orders.filter(o => o.status === 'signed').length,
            totalStaff: staff.length,
            storageUsed: this.getStorageUsage()
        };
    }

    /**
     * Get storage usage information
     * @returns {Object}
     */
    getStorageUsage() {
        let totalSize = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        
        return {
            totalBytes: totalSize,
            totalKB: Math.round(totalSize / 1024),
            totalMB: Math.round(totalSize / (1024 * 1024))
        };
    }

    /**
     * Backup data to file
     */
    backupToFile() {
        const data = this.exportData();
        const jsonString = JSON.stringify(data, null, 2);
        const filename = `maintenance_orders_backup_${formatDate(new Date())}.json`;
        downloadFile(jsonString, filename, 'application/json');
    }

    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}