const { chromium } = require('playwright');

/**
 * 測試線上網站的 JavaScript 載入問題
 */
async function testLiveSite() {
    let browser;
    let page;
    
    try {
        console.log('🚀 啟動 Playwright 測試線上網站...');
        
        browser = await chromium.launch({
            headless: false, // 顯示瀏覽器
            devtools: true   // 開啟開發者工具
        });
        
        page = await browser.newPage();
        
        // 收集所有控制台訊息
        const consoleMessages = [];
        const errors = [];
        const networkFailures = [];
        
        // 監聽控制台訊息
        page.on('console', msg => {
            const message = `[${msg.type().toUpperCase()}] ${msg.text()}`;
            consoleMessages.push(message);
            console.log(message);
        });
        
        // 監聽錯誤
        page.on('pageerror', error => {
            const errorMsg = `頁面錯誤: ${error.message}`;
            errors.push(errorMsg);
            console.error('💥', errorMsg);
        });
        
        // 監聽網路請求失敗
        page.on('requestfailed', request => {
            const failureMsg = `網路請求失敗: ${request.url()} - ${request.failure()?.errorText}`;
            networkFailures.push(failureMsg);
            console.error('🌐', failureMsg);
        });
        
        // 監聽回應
        page.on('response', response => {
            if (!response.ok()) {
                const errorMsg = `HTTP 錯誤: ${response.url()} - ${response.status()} ${response.statusText()}`;
                networkFailures.push(errorMsg);
                console.error('📡', errorMsg);
            }
        });
        
        console.log('🌐 正在載入網站...');
        await page.goto('https://online-signature-maintenance-order.onrender.com/', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        
        console.log('✅ 網站載入完成，等待 JavaScript 執行...');
        
        // 等待 JavaScript 載入
        await page.waitForTimeout(5000);
        
        // 檢查 JavaScript 檔案載入狀態
        console.log('\n📋 檢查 JavaScript 載入狀態...');
        
        const scriptLoadStatus = await page.evaluate(() => {
            return {
                loadedScripts: window.loadedScripts || [],
                scriptLoadErrors: window.scriptLoadErrors || [],
                availableClasses: {
                    AppController: typeof AppController !== 'undefined',
                    OrderService: typeof OrderService !== 'undefined', 
                    StorageService: typeof StorageService !== 'undefined',
                    FormHandler: typeof FormHandler !== 'undefined',
                    Order: typeof Order !== 'undefined',
                    helpers: typeof generateOrderNumber !== 'undefined'
                },
                windowKeys: Object.keys(window).filter(key => 
                    key.includes('Controller') || 
                    key.includes('Service') || 
                    key.includes('Handler') ||
                    key.includes('Order')
                ),
                scripts: Array.from(document.scripts).map(script => ({
                    src: script.src,
                    loaded: script.readyState || 'unknown'
                }))
            };
        });
        
        console.log('📝 載入的腳本:', scriptLoadStatus.loadedScripts);
        console.log('❌ 載入錯誤:', scriptLoadStatus.scriptLoadErrors);
        console.log('🔧 可用的類別:', scriptLoadStatus.availableClasses);
        console.log('🗝️ 相關的 window 屬性:', scriptLoadStatus.windowKeys);
        
        // 檢查特定的 script 標籤
        console.log('\n🔍 檢查 script 標籤載入狀態:');
        scriptLoadStatus.scripts.forEach(script => {
            if (script.src) {
                console.log(`  ${script.src} - ${script.loaded}`);
            }
        });
        
        // 嘗試手動載入一個 JavaScript 檔案來測試
        console.log('\n🧪 測試手動載入 helpers.js...');
        
        const helperTest = await page.evaluate(async () => {
            try {
                // 嘗試獲取 helpers.js 檔案
                const response = await fetch('/js/utils/helpers.js');
                const text = await response.text();
                
                return {
                    status: response.status,
                    ok: response.ok,
                    contentLength: text.length,
                    contentStart: text.substring(0, 200),
                    hasGenerateOrderNumber: text.includes('generateOrderNumber')
                };
            } catch (error) {
                return {
                    error: error.message
                };
            }
        });
        
        console.log('🧪 手動載入結果:', helperTest);
        
        // 檢查網頁 HTML 結構
        console.log('\n🏗️ 檢查網頁結構...');
        const pageStructure = await page.evaluate(() => {
            return {
                hasMainForm: !!document.getElementById('maintenanceForm'),
                hasAddStaffBtn: !!document.getElementById('addStaffBtn'),
                hasModal: !!document.getElementById('addStaffModal'),
                scriptTags: Array.from(document.scripts).length,
                bodyContent: document.body.innerHTML.length,
                headContent: document.head.innerHTML.length
            };
        });
        
        console.log('🏗️ 頁面結構:', pageStructure);
        
        // 等待更長時間看是否有延遲載入
        console.log('\n⏳ 等待額外 10 秒檢查延遲載入...');
        await page.waitForTimeout(10000);
        
        // 再次檢查類別
        const finalCheck = await page.evaluate(() => {
            return {
                AppController: typeof AppController !== 'undefined',
                OrderService: typeof OrderService !== 'undefined', 
                StorageService: typeof StorageService !== 'undefined',
                FormHandler: typeof FormHandler !== 'undefined'
            };
        });
        
        console.log('🔍 最終檢查結果:', finalCheck);
        
        // 生成詳細報告
        const report = {
            timestamp: new Date().toISOString(),
            url: 'https://online-signature-maintenance-order.onrender.com/',
            scriptLoadStatus,
            pageStructure,
            finalCheck,
            consoleMessages,
            errors,
            networkFailures,
            helperTest
        };
        
        // 保存報告
        const fs = require('fs');
        const reportPath = require('path').join(__dirname, 'live-site-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`\n📋 詳細報告已保存到: ${reportPath}`);
        
        // 嘗試點擊按鈕測試
        console.log('\n🖱️ 測試按鈕點擊...');
        try {
            await page.click('#addStaffBtn');
            await page.waitForTimeout(2000);
            
            const modalVisible = await page.evaluate(() => {
                const modal = document.getElementById('addStaffModal');
                return modal && !modal.classList.contains('hidden');
            });
            
            console.log('👀 彈窗是否顯示:', modalVisible);
            
        } catch (error) {
            console.log('❌ 按鈕點擊測試失敗:', error.message);
        }
        
        console.log('\n✅ 測試完成！');
        
        // 保持瀏覽器開啟一段時間供檢查
        console.log('🔍 瀏覽器將保持開啟 30 秒供手動檢查...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.error('💥 測試過程發生錯誤:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 執行測試
testLiveSite().catch(console.error);