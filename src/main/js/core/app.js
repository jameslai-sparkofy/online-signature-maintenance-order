// Main application entry point

// Global app instance
let app;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check browser compatibility
        if (!checkBrowserCompatibility()) {
            showBrowserCompatibilityError();
            return;
        }
        
        // Check storage availability
        if (!checkStorageAvailability()) {
            showToast('瀏覽器不支援本地儲存功能，部分功能可能無法正常使用', 'error');
        }
        
        // Initialize application
        app = new AppController();
        
        console.log('維修單系統已初始化');
        
    } catch (error) {
        console.error('應用程式初始化失敗:', error);
        showToast('系統初始化失敗，請重新整理頁面', 'error');
    }
});

/**
 * Check browser compatibility
 * @returns {boolean}
 */
function checkBrowserCompatibility() {
    // Check for required APIs
    const requiredFeatures = [
        'localStorage' in window,
        'JSON' in window,
        'querySelector' in document,
        'addEventListener' in document,
        'FileReader' in window,
        'canvas' in document.createElement('canvas')
    ];
    
    return requiredFeatures.every(feature => feature);
}

/**
 * Show browser compatibility error
 */
function showBrowserCompatibilityError() {
    const errorHtml = `
        <div style="text-align: center; padding: 40px; color: #dc2626;">
            <h2>瀏覽器不相容</h2>
            <p style="margin: 20px 0;">您的瀏覽器版本過舊，不支援此系統所需的功能。</p>
            <p>請更新至最新版本的 Chrome、Firefox、Safari 或 Edge 瀏覽器。</p>
        </div>
    `;
    
    document.body.innerHTML = errorHtml;
}

/**
 * Check storage availability
 * @returns {boolean}
 */
function checkStorageAvailability() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('全域錯誤:', event.error);
    showToast('發生未預期的錯誤，請重新整理頁面', 'error');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('未處理的 Promise 拒絕:', event.reason);
    showToast('操作失敗，請稍後再試', 'error');
});

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker can be added here for offline functionality
        console.log('Service Worker 支援可用');
    });
}

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('頁面載入時間:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
        }, 0);
    });
}

// Utility functions for global access
window.maintenanceApp = {
    /**
     * Get app instance
     * @returns {AppController}
     */
    getApp() {
        return app;
    },
    
    /**
     * Show help information
     */
    showHelp() {
        const helpHtml = `
            <div class="modal">
                <div class="modal-content">
                    <h3>系統說明</h3>
                    <div style="margin: 20px 0;">
                        <h4>主要功能</h4>
                        <ul style="margin-left: 20px;">
                            <li>建立維修單：填寫維修資訊並上傳照片</li>
                            <li>數位簽名：客戶可透過連結進行線上簽名</li>
                            <li>訂單管理：查看、篩選和管理所有維修單</li>
                            <li>資料匯出：將訂單資料匯出為 CSV 或 JSON 格式</li>
                        </ul>
                        
                        <h4 style="margin-top: 20px;">使用說明</h4>
                        <ol style="margin-left: 20px;">
                            <li>點擊「新增維修單」建立維修單</li>
                            <li>填寫所有必要資訊並上傳照片</li>
                            <li>複製產生的簽名連結傳送給客戶</li>
                            <li>客戶點擊連結進行簽名確認</li>
                            <li>在「維修單列表」中查看所有訂單狀態</li>
                        </ol>
                        
                        <h4 style="margin-top: 20px;">注意事項</h4>
                        <ul style="margin-left: 20px;">
                            <li>照片檔案大小限制：5MB</li>
                            <li>支援格式：JPG、PNG、GIF、WebP</li>
                            <li>資料儲存在瀏覽器本地</li>
                            <li>建議定期備份重要資料</li>
                        </ul>
                    </div>
                    <div style="text-align: right;">
                        <button onclick="this.closest('.modal').remove()" class="btn btn-primary">關閉</button>
                    </div>
                </div>
            </div>
        `;
        
        const helpModal = document.createElement('div');
        helpModal.innerHTML = helpHtml;
        document.body.appendChild(helpModal.firstElementChild);
    },
    
    /**
     * Backup data
     */
    backupData() {
        if (app && app.storageService) {
            app.storageService.backupToFile();
        }
    },
    
    /**
     * Show system info
     */
    showSystemInfo() {
        const info = app ? app.getAppStatus() : {};
        const storageStats = app ? app.storageService.getStorageStats() : {};
        
        const infoHtml = `
            <div class="modal">
                <div class="modal-content">
                    <h3>系統資訊</h3>
                    <div style="margin: 20px 0;">
                        <p><strong>當前檢視：</strong>${info.currentView || 'N/A'}</p>
                        <p><strong>維修單總數：</strong>${info.orderCount || 0}</p>
                        <p><strong>待簽名：</strong>${storageStats.pendingOrders || 0}</p>
                        <p><strong>已簽名：</strong>${storageStats.signedOrders || 0}</p>
                        <p><strong>工務人員：</strong>${storageStats.totalStaff || 0}</p>
                        <p><strong>儲存空間使用：</strong>${storageStats.storageUsed?.totalKB || 0} KB</p>
                        <p><strong>瀏覽器：</strong>${navigator.userAgent.split(' ').pop()}</p>
                        <p><strong>本地儲存：</strong>${info.storageAvailable ? '✅ 可用' : '❌ 不可用'}</p>
                    </div>
                    <div style="text-align: right;">
                        <button onclick="maintenanceApp.backupData()" class="btn btn-secondary" style="margin-right: 8px;">備份資料</button>
                        <button onclick="this.closest('.modal').remove()" class="btn btn-primary">關閉</button>
                    </div>
                </div>
            </div>
        `;
        
        const infoModal = document.createElement('div');
        infoModal.innerHTML = infoHtml;
        document.body.appendChild(infoModal.firstElementChild);
    },
    
    /**
     * Reset application data
     */
    resetApp() {
        if (!confirm('確定要清除所有資料嗎？此操作無法復原！')) {
            return;
        }
        
        if (app && app.storageService) {
            app.storageService.clearAllData();
            showToast('資料已清除，請重新整理頁面', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
};

// Expose app for debugging in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugApp = () => app;
    console.log('除錯模式：使用 window.debugApp() 存取應用程式實例');
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + H = Help
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        window.maintenanceApp.showHelp();
    }
    
    // Ctrl/Cmd + I = System Info
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        window.maintenanceApp.showSystemInfo();
    }
    
    // Ctrl/Cmd + S = Statistics (only on order list view)
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && app && app.currentView === 'orderList') {
        e.preventDefault();
        app.showStatistics();
    }
});

// Add app info to console
console.log(`
🔧 線上簽名維修單系統
📱 版本: 1.0.0
🌐 瀏覽器: ${navigator.userAgent}
⌨️  快捷鍵:
   Ctrl+H - 說明
   Ctrl+I - 系統資訊
   Ctrl+S - 統計資料 (訂單列表頁面)
   ESC - 關閉彈窗
`);

export { app, maintenanceApp };