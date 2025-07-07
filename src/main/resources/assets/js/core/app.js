// 線上簽名維修單系統 - 應用程式入口
// 立即確保彈窗隱藏，避免載入時意外顯示

// 立即執行：確保彈窗隱藏
(function() {
    console.log('🔧 立即執行：隱藏所有彈窗');
    
    // 在 DOM 解析完成前就設定樣式
    const style = document.createElement('style');
    style.textContent = `
        .modal.hidden, 
        #addStaffModal.hidden,
        .hidden {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
        
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);
    
    // 立即隱藏彈窗（如果已存在）
    const hideModals = function() {
        const modal = document.getElementById('addStaffModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            console.log('✅ 彈窗已強制隱藏');
        }
    };
    
    // 立即執行
    hideModals();
    
    // 在 DOM 改變時也執行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideModals);
    } else {
        hideModals();
    }
})();

// 主要應用程式初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM 載入完成，開始初始化線上簽名維修單系統');
    
    // 再次確保彈窗隱藏
    const modal = document.getElementById('addStaffModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        console.log('✅ 再次確認彈窗已隱藏');
    }
    
    // 等待一小段時間確保所有腳本都載入
    setTimeout(() => {
        try {
            console.log('🔧 檢查必要的類別是否存在...');
            
            // 檢查必要的類別
            const requiredClasses = [
                'AppController',
                'OrderService', 
                'StorageService',
                'FormHandler'
            ];
            
            const missingClasses = [];
            requiredClasses.forEach(className => {
                if (typeof window[className] === 'undefined') {
                    missingClasses.push(className);
                    console.error(`❌ 缺少類別: ${className}`);
                }
            });
            
            if (missingClasses.length > 0) {
                console.error(`💥 無法初始化，缺少類別: ${missingClasses.join(', ')}`);
                alert(`系統載入失敗，缺少必要組件: ${missingClasses.join(', ')}`);
                return;
            }
            
            console.log('✅ 所有必要類別都已載入');
            
            // 初始化應用程式
            const app = new AppController();
            window.app = app; // 存到全域供除錯使用
            
            // 執行初始化
            if (typeof app.initializeApplication === 'function') {
                app.initializeApplication();
            } else {
                console.warn('⚠️ initializeApplication 方法不存在，使用基本初始化');
                
                // 基本初始化
                if (typeof app.setupEventListeners === 'function') {
                    app.setupEventListeners();
                }
                
                if (app.formHandler && typeof app.formHandler.updateStaffOptions === 'function') {
                    app.formHandler.updateStaffOptions();
                }
            }
            
            console.log('✅ 線上簽名維修單系統初始化完成');
            
            // 最後一次確保彈窗隱藏
            const finalModal = document.getElementById('addStaffModal');
            if (finalModal) {
                finalModal.classList.add('hidden');
                finalModal.style.display = 'none';
                console.log('✅ 最終確認彈窗已隱藏');
            }
            
        } catch (error) {
            console.error('💥 初始化過程發生錯誤:', error);
            alert(`系統初始化失敗: ${error.message}`);
        }
    }, 100);
});

// 全域錯誤處理
window.addEventListener('error', (e) => {
    console.error('💥 全域錯誤:', e.error);
});

// 未處理的 Promise 拒絕
window.addEventListener('unhandledrejection', (e) => {
    console.error('💥 未處理的 Promise 拒絕:', e.reason);
});

// 瀏覽器兼容性檢查
function checkBrowserCompatibility() {
    const requiredFeatures = [
        'localStorage' in window,
        'JSON' in window,
        'querySelector' in document,
        'addEventListener' in document,
        'FileReader' in window
    ];
    
    return requiredFeatures.every(feature => feature);
}

// 儲存可用性檢查
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

// 除錯工具（僅在開發環境）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugApp = () => window.app;
    console.log('🔧 除錯模式：使用 window.debugApp() 存取應用程式實例');
}

console.log(`
🔧 線上簽名維修單系統
📱 版本: 1.0.0
🌐 部署網址: ${window.location.href}
`);