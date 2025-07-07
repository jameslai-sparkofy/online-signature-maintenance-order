const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Frontend Debug Script
 * 自動檢測和診斷前端問題
 */
class FrontendDebugger {
    constructor() {
        this.browser = null;
        this.page = null;
        this.issues = [];
        this.testResults = {};
        this.baseUrl = 'https://online-signature-maintenance-order.onrender.com';
    }

    async initialize() {
        console.log('🚀 啟動 Puppeteer Debug 系統...');
        
        this.browser = await puppeteer.launch({
            headless: false, // 顯示瀏覽器視窗以便觀察
            devtools: true,  // 開啟開發者工具
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        this.page = await this.browser.newPage();
        
        // 設定監聽器來捕捉控制台訊息和錯誤
        this.setupErrorHandlers();
        
        // 設定視窗大小
        await this.page.setViewport({ width: 1280, height: 720 });
        
        console.log('✅ Puppeteer 初始化完成');
    }

    setupErrorHandlers() {
        // 捕捉控制台錯誤
        this.page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            
            if (type === 'error') {
                this.issues.push({
                    type: 'console_error',
                    message: text,
                    timestamp: new Date().toISOString()
                });
                console.log(`❌ Console Error: ${text}`);
            } else if (type === 'warning') {
                console.log(`⚠️ Console Warning: ${text}`);
            } else if (type === 'log') {
                console.log(`📝 Console Log: ${text}`);
            }
        });

        // 捕捉頁面錯誤
        this.page.on('pageerror', error => {
            this.issues.push({
                type: 'page_error',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            console.log(`💥 Page Error: ${error.message}`);
        });

        // 捕捉請求失敗
        this.page.on('requestfailed', request => {
            this.issues.push({
                type: 'request_failed',
                url: request.url(),
                method: request.method(),
                errorText: request.failure().errorText,
                timestamp: new Date().toISOString()
            });
            console.log(`🌐 Request Failed: ${request.url()} - ${request.failure().errorText}`);
        });

        // 捕捉響應錯誤
        this.page.on('response', response => {
            if (!response.ok()) {
                this.issues.push({
                    type: 'response_error',
                    url: response.url(),
                    status: response.status(),
                    statusText: response.statusText(),
                    timestamp: new Date().toISOString()
                });
                console.log(`📡 Response Error: ${response.url()} - ${response.status()} ${response.statusText()}`);
            }
        });
    }

    async navigateToSite() {
        console.log(`🌐 導航到網站: ${this.baseUrl}`);
        
        try {
            await this.page.goto(this.baseUrl, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            console.log('✅ 網站載入完成');
            
            // 等待一下讓所有資源載入
            await this.page.waitForTimeout(3000);
            
            return true;
        } catch (error) {
            this.issues.push({
                type: 'navigation_error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            console.log(`❌ 導航失敗: ${error.message}`);
            return false;
        }
    }

    async checkJavaScriptFiles() {
        console.log('🔍 檢查 JavaScript 檔案載入狀態...');
        
        const jsFiles = [
            'js/utils/helpers.js',
            'js/models/Order.js',
            'js/services/OrderService.js',
            'js/services/StorageService.js',
            'js/core/SignatureHandler.js',
            'js/core/PhotoHandler.js',
            'js/core/FormHandler.js',
            'js/core/AppController.js',
            'js/core/app.js'
        ];

        for (const jsFile of jsFiles) {
            try {
                const response = await this.page.goto(`${this.baseUrl}/${jsFile}`, {
                    waitUntil: 'networkidle2'
                });
                
                if (response.ok()) {
                    console.log(`✅ ${jsFile} - 載入成功`);
                } else {
                    console.log(`❌ ${jsFile} - 載入失敗 (${response.status()})`);
                    this.issues.push({
                        type: 'js_file_missing',
                        file: jsFile,
                        status: response.status(),
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.log(`💥 ${jsFile} - 檢查失敗: ${error.message}`);
                this.issues.push({
                    type: 'js_file_error',
                    file: jsFile,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // 回到主頁
        await this.page.goto(this.baseUrl);
    }

    async testStaffAddition() {
        console.log('👥 測試工務人員新增功能...');
        
        try {
            // 等待新增工務人員按鈕出現
            await this.page.waitForSelector('#addStaffBtn', { timeout: 10000 });
            
            // 點擊新增工務人員按鈕
            console.log('🖱️ 點擊新增工務人員按鈕...');
            await this.page.click('#addStaffBtn');
            
            // 等待彈窗出現
            await this.page.waitForSelector('#addStaffModal', { timeout: 5000 });
            
            // 檢查彈窗是否可見
            const modalVisible = await this.page.evaluate(() => {
                const modal = document.getElementById('addStaffModal');
                return modal && !modal.classList.contains('hidden');
            });
            
            if (modalVisible) {
                console.log('✅ 新增工務人員彈窗正常顯示');
                
                // 填寫表單
                await this.page.type('#staffName', '測試工務員');
                await this.page.type('#staffPhone', '0912345678');
                
                // 提交表單
                await this.page.click('#addStaffForm button[type="submit"]');
                
                // 等待表單處理
                await this.page.waitForTimeout(2000);
                
                // 檢查是否成功新增
                const staffOptions = await this.page.evaluate(() => {
                    const select = document.getElementById('staff');
                    return Array.from(select.options).map(option => option.text);
                });
                
                if (staffOptions.includes('測試工務員')) {
                    console.log('✅ 工務人員新增成功');
                    this.testResults.staffAddition = 'success';
                } else {
                    console.log('❌ 工務人員新增失敗 - 未出現在選項中');
                    this.testResults.staffAddition = 'failed';
                    this.issues.push({
                        type: 'staff_addition_failed',
                        message: '工務人員未出現在選項中',
                        timestamp: new Date().toISOString()
                    });
                }
                
            } else {
                console.log('❌ 新增工務人員彈窗未顯示');
                this.testResults.staffAddition = 'modal_not_shown';
                this.issues.push({
                    type: 'modal_not_shown',
                    message: '新增工務人員彈窗未顯示',
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.log(`💥 工務人員新增測試失敗: ${error.message}`);
            this.testResults.staffAddition = 'error';
            this.issues.push({
                type: 'staff_test_error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testFormFunctionality() {
        console.log('📝 測試表單基本功能...');
        
        try {
            // 檢查表單是否存在
            const formExists = await this.page.$('#maintenanceForm') !== null;
            if (!formExists) {
                throw new Error('主表單不存在');
            }
            
            // 檢查必要欄位
            const requiredFields = ['#orderNumber', '#date', '#site', '#building', '#floor', '#unit', '#reason', '#staff', '#amount'];
            
            for (const field of requiredFields) {
                const fieldExists = await this.page.$(field) !== null;
                if (!fieldExists) {
                    this.issues.push({
                        type: 'missing_field',
                        field: field,
                        timestamp: new Date().toISOString()
                    });
                    console.log(`❌ 缺少欄位: ${field}`);
                } else {
                    console.log(`✅ 欄位存在: ${field}`);
                }
            }
            
            // 檢查維修單號是否自動生成
            const orderNumber = await this.page.$eval('#orderNumber', el => el.value);
            if (orderNumber) {
                console.log(`✅ 維修單號自動生成: ${orderNumber}`);
            } else {
                console.log('❌ 維修單號未自動生成');
                this.issues.push({
                    type: 'order_number_not_generated',
                    message: '維修單號未自動生成',
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.log(`💥 表單功能測試失敗: ${error.message}`);
            this.issues.push({
                type: 'form_test_error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async analyzePageStructure() {
        console.log('🏗️ 分析頁面結構...');
        
        try {
            const pageInfo = await this.page.evaluate(() => {
                return {
                    title: document.title,
                    scriptsLoaded: Array.from(document.scripts).map(script => script.src || 'inline'),
                    stylesheetsLoaded: Array.from(document.styleSheets).length,
                    elementsCount: document.querySelectorAll('*').length,
                    hasJQuery: typeof window.$ !== 'undefined',
                    hasBootstrap: typeof window.bootstrap !== 'undefined',
                    customClasses: Array.from(new Set(
                        Array.from(document.querySelectorAll('*'))
                        .map(el => Array.from(el.classList))
                        .flat()
                        .filter(cls => cls && !cls.startsWith('_'))
                    )).slice(0, 20)
                };
            });
            
            console.log('📊 頁面資訊:');
            console.log(`   標題: ${pageInfo.title}`);
            console.log(`   載入的腳本數量: ${pageInfo.scriptsLoaded.length}`);
            console.log(`   樣式表數量: ${pageInfo.stylesheetsLoaded}`);
            console.log(`   元素總數: ${pageInfo.elementsCount}`);
            console.log(`   使用的 CSS 類別: ${pageInfo.customClasses.join(', ')}`);
            
        } catch (error) {
            console.log(`💥 頁面結構分析失敗: ${error.message}`);
        }
    }

    async takeScreenshots() {
        console.log('📸 截取頁面截圖...');
        
        try {
            // 全頁截圖
            await this.page.screenshot({
                path: path.join(__dirname, 'screenshots', 'full-page.png'),
                fullPage: true
            });
            
            // 視窗截圖
            await this.page.screenshot({
                path: path.join(__dirname, 'screenshots', 'viewport.png')
            });
            
            console.log('✅ 截圖完成，保存在 debug/screenshots/ 目錄');
            
        } catch (error) {
            console.log(`💥 截圖失敗: ${error.message}`);
        }
    }

    async generateReport() {
        console.log('📋 生成診斷報告...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalIssues: this.issues.length,
                criticalIssues: this.issues.filter(i => ['page_error', 'js_file_missing', 'navigation_error'].includes(i.type)).length,
                warningIssues: this.issues.filter(i => ['console_error', 'request_failed'].includes(i.type)).length
            },
            testResults: this.testResults,
            issues: this.issues,
            recommendations: this.generateRecommendations()
        };
        
        // 保存報告
        const reportPath = path.join(__dirname, 'debug-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // 輸出摘要
        console.log('\n🔍 診斷報告摘要:');
        console.log(`   總問題數: ${report.summary.totalIssues}`);
        console.log(`   嚴重問題: ${report.summary.criticalIssues}`);
        console.log(`   警告問題: ${report.summary.warningIssues}`);
        console.log(`   報告保存在: ${reportPath}`);
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        // JavaScript 檔案問題
        const jsMissing = this.issues.filter(i => i.type === 'js_file_missing');
        if (jsMissing.length > 0) {
            recommendations.push({
                priority: 'high',
                type: 'js_files',
                message: `有 ${jsMissing.length} 個 JavaScript 檔案無法載入，需要檢查檔案路徑和部署設定`,
                files: jsMissing.map(i => i.file)
            });
        }
        
        // 控制台錯誤
        const consoleErrors = this.issues.filter(i => i.type === 'console_error');
        if (consoleErrors.length > 0) {
            recommendations.push({
                priority: 'medium',
                type: 'console_errors',
                message: `發現 ${consoleErrors.length} 個控制台錯誤，需要修正 JavaScript 程式碼`,
                errors: consoleErrors.map(i => i.message)
            });
        }
        
        // 功能測試失敗
        if (this.testResults.staffAddition !== 'success') {
            recommendations.push({
                priority: 'high',
                type: 'functionality',
                message: '工務人員新增功能異常，需要檢查事件處理器和表單邏輯'
            });
        }
        
        return recommendations;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('🧹 清理完成');
    }

    async run() {
        try {
            // 創建截圖目錄
            const screenshotDir = path.join(__dirname, 'screenshots');
            if (!fs.existsSync(screenshotDir)) {
                fs.mkdirSync(screenshotDir, { recursive: true });
            }
            
            await this.initialize();
            
            const navigationSuccess = await this.navigateToSite();
            if (!navigationSuccess) {
                throw new Error('無法載入網站');
            }
            
            await this.checkJavaScriptFiles();
            await this.analyzePageStructure();
            await this.testFormFunctionality();
            await this.testStaffAddition();
            await this.takeScreenshots();
            
            const report = await this.generateReport();
            
            return report;
            
        } catch (error) {
            console.error(`💥 Debug 過程發生錯誤: ${error.message}`);
            this.issues.push({
                type: 'debug_error',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        } finally {
            await this.cleanup();
        }
    }
}

// 執行 debug
async function main() {
    console.log('🔧 線上簽名維修單系統 - 前端自動化診斷');
    console.log('='.repeat(50));
    
    const frontendDebugger = new FrontendDebugger();
    const report = await frontendDebugger.run();
    
    console.log('\n✅ 診斷完成！');
    
    if (report && report.summary.totalIssues > 0) {
        console.log('\n📝 建議執行自動修復: npm run debug:fix');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = FrontendDebugger;