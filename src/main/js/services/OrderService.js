// Order service for managing maintenance orders

class OrderService {
    constructor() {
        this.storage = new StorageService();
    }

    /**
     * Create new order
     * @param {Object} orderData 
     * @returns {Promise<Order>}
     */
    async createOrder(orderData) {
        try {
            const order = new Order(orderData);
            const validation = order.validate();
            
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }
            
            this.storage.saveOrder(order);
            
            // Update settings with last used site
            this.storage.saveSettings({ lastUsedSite: order.site });
            
            return order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    /**
     * Get order by number
     * @param {string} orderNumber 
     * @returns {Order|null}
     */
    getOrder(orderNumber) {
        const orderData = this.storage.getOrder(orderNumber);
        return orderData ? Order.fromJSON(orderData) : null;
    }

    /**
     * Get all orders
     * @returns {Order[]}
     */
    getAllOrders() {
        const ordersData = this.storage.getAllOrders();
        return ordersData.map(data => Order.fromJSON(data));
    }

    /**
     * Get filtered orders
     * @param {Object} filters 
     * @returns {Order[]}
     */
    getFilteredOrders(filters = {}) {
        const ordersData = this.storage.getFilteredOrders(filters);
        return ordersData.map(data => Order.fromJSON(data));
    }

    /**
     * Update order
     * @param {string} orderNumber 
     * @param {Object} updateData 
     * @returns {Promise<Order>}
     */
    async updateOrder(orderNumber, updateData) {
        try {
            const existingOrder = this.getOrder(orderNumber);
            if (!existingOrder) {
                throw new Error('維修單不存在');
            }
            
            const updatedOrder = new Order({ ...existingOrder.toJSON(), ...updateData });
            const validation = updatedOrder.validate();
            
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }
            
            this.storage.saveOrder(updatedOrder);
            return updatedOrder;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    /**
     * Sign order
     * @param {string} orderNumber 
     * @param {string} signature 
     * @param {string} email 
     * @returns {Promise<Order>}
     */
    async signOrder(orderNumber, signature, email = '') {
        try {
            const order = this.getOrder(orderNumber);
            if (!order) {
                throw new Error('維修單不存在');
            }
            
            if (order.isSigned()) {
                throw new Error('此維修單已經簽名');
            }
            
            if (!signature || signature.trim() === '') {
                throw new Error('請提供簽名');
            }
            
            if (email && !isValidEmail(email)) {
                throw new Error('Email格式不正確');
            }
            
            order.sign(signature, email);
            this.storage.saveOrder(order);
            
            // Send email notification if email provided
            if (email) {
                await this.sendEmailNotification(order, email);
            }
            
            return order;
        } catch (error) {
            console.error('Error signing order:', error);
            throw error;
        }
    }

    /**
     * Delete order
     * @param {string} orderNumber 
     * @returns {Promise<boolean>}
     */
    async deleteOrder(orderNumber) {
        try {
            const order = this.getOrder(orderNumber);
            if (!order) {
                throw new Error('維修單不存在');
            }
            
            this.storage.deleteOrder(orderNumber);
            return true;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    /**
     * Get order statistics
     * @returns {Object}
     */
    getOrderStatistics() {
        const orders = this.getAllOrders();
        
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            signed: orders.filter(o => o.status === 'signed').length,
            thisMonth: 0,
            totalAmount: 0,
            averageAmount: 0
        };
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        let monthlyOrders = 0;
        let totalAmount = 0;
        
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                monthlyOrders++;
            }
            totalAmount += order.amount;
        });
        
        stats.thisMonth = monthlyOrders;
        stats.totalAmount = totalAmount;
        stats.averageAmount = orders.length > 0 ? totalAmount / orders.length : 0;
        
        return stats;
    }

    /**
     * Export orders to CSV
     * @param {Object} filters 
     * @returns {string}
     */
    exportToCSV(filters = {}) {
        const orders = this.getFilteredOrders(filters);
        
        let csvContent = Order.getCSVHeaders() + '\n';
        
        orders.forEach(order => {
            csvContent += order.toCSV() + '\n';
        });
        
        return csvContent;
    }

    /**
     * Export orders to JSON
     * @param {Object} filters 
     * @returns {string}
     */
    exportToJSON(filters = {}) {
        const orders = this.getFilteredOrders(filters);
        const exportData = {
            exportDate: new Date().toISOString(),
            totalOrders: orders.length,
            filters: filters,
            orders: orders.map(order => order.toJSON())
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Send email notification (mock implementation)
     * @param {Order} order 
     * @param {string} email 
     * @returns {Promise<boolean>}
     */
    async sendEmailNotification(order, email) {
        // Mock email sending - in real implementation, this would call a backend service
        console.log(`Sending email notification to ${email} for order ${order.orderNumber}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In real implementation, you would call your email service API here
        // For now, we'll just log the email content
        const emailContent = this.generateEmailContent(order);
        console.log('Email content:', emailContent);
        
        return true;
    }

    /**
     * Generate email content for notification
     * @param {Order} order 
     * @returns {Object}
     */
    generateEmailContent(order) {
        const subject = `維修單簽名確認 - ${order.orderNumber}`;
        const body = `
親愛的客戶，您好：

您的維修單已完成簽名確認，詳細資訊如下：

維修單號：${order.orderNumber}
日期：${order.getFormattedDate()}
案場：${order.site}
位置：${order.getLocation()}
工務人員：${order.staff}
維修原因：${order.reason}
金額：${order.getFormattedAmount()}
簽名時間：${formatDateDisplay(order.signedAt.slice(0, 10))}

感謝您的配合！

此為系統自動發送的郵件，請勿回覆。
        `;
        
        return { subject, body };
    }

    /**
     * Get orders by date range
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Order[]}
     */
    getOrdersByDateRange(startDate, endDate) {
        return this.getFilteredOrders({
            dateFrom: startDate,
            dateTo: endDate
        });
    }

    /**
     * Get orders by site
     * @param {string} site 
     * @returns {Order[]}
     */
    getOrdersBySite(site) {
        return this.getFilteredOrders({ site });
    }

    /**
     * Get orders by staff
     * @param {string} staff 
     * @returns {Order[]}
     */
    getOrdersByStaff(staff) {
        return this.getFilteredOrders({ staff });
    }

    /**
     * Get orders by status
     * @param {string} status 
     * @returns {Order[]}
     */
    getOrdersByStatus(status) {
        return this.getFilteredOrders({ status });
    }

    /**
     * Search orders by keyword
     * @param {string} keyword 
     * @returns {Order[]}
     */
    searchOrders(keyword) {
        const orders = this.getAllOrders();
        const lowerKeyword = keyword.toLowerCase();
        
        return orders.filter(order => 
            order.orderNumber.toLowerCase().includes(lowerKeyword) ||
            order.site.toLowerCase().includes(lowerKeyword) ||
            order.building.toLowerCase().includes(lowerKeyword) ||
            order.reason.toLowerCase().includes(lowerKeyword) ||
            order.staff.toLowerCase().includes(lowerKeyword)
        );
    }

    /**
     * Get recent orders
     * @param {number} limit 
     * @returns {Order[]}
     */
    getRecentOrders(limit = 10) {
        const orders = this.getAllOrders();
        return orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    /**
     * Duplicate order
     * @param {string} orderNumber 
     * @returns {Promise<Order>}
     */
    async duplicateOrder(orderNumber) {
        try {
            const existingOrder = this.getOrder(orderNumber);
            if (!existingOrder) {
                throw new Error('維修單不存在');
            }
            
            const duplicateData = {
                ...existingOrder.toJSON(),
                orderNumber: generateOrderNumber(),
                date: formatDate(new Date()),
                status: 'pending',
                signature: null,
                customerEmail: '',
                createdAt: new Date().toISOString(),
                signedAt: null
            };
            
            delete duplicateData.link;
            
            const duplicateOrder = new Order(duplicateData);
            duplicateOrder.link = generateOrderLink(duplicateOrder.orderNumber);
            
            this.storage.saveOrder(duplicateOrder);
            return duplicateOrder;
        } catch (error) {
            console.error('Error duplicating order:', error);
            throw error;
        }
    }
}