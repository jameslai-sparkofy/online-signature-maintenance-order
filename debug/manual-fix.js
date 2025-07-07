const fs = require('fs');
const path = require('path');

/**
 * 手動修復前端問題
 * 基於之前的分析直接修復已知問題
 */
class ManualFixer {
    constructor() {
        this.assetsPath = path.join(__dirname, '..', 'src', 'main', 'resources', 'assets');
        this.fixes = [];
    }

    fixJavaScriptFileReferences() {
        console.log('🔧 修復 JavaScript 檔案參照...');
        
        const htmlFiles = ['index.html', 'signature.html'];
        
        htmlFiles.forEach(htmlFile => {
            const htmlPath = path.join(this.assetsPath, htmlFile);
            
            if (fs.existsSync(htmlPath)) {
                let content = fs.readFileSync(htmlPath, 'utf8');
                let modified = false;
                
                // 修正 JavaScript 路徑
                if (content.includes('src="../js/')) {
                    content = content.replace(/src="\.\.\/js\//g, 'src="js/');
                    modified = true;
                    console.log(`   ✅ ${htmlFile}: 修正 ../js/ → js/`);
                }
                
                if (content.includes('src="./js/')) {
                    content = content.replace(/src="\.\/js\//g, 'src="js/');
                    modified = true;
                    console.log(`   ✅ ${htmlFile}: 修正 ./js/ → js/`);
                }
                
                if (content.includes('src="/js/')) {
                    content = content.replace(/src="\/js\//g, 'src="js/');
                    modified = true;
                    console.log(`   ✅ ${htmlFile}: 修正 /js/ → js/`);
                }
                
                if (modified) {
                    fs.writeFileSync(htmlPath, content);
                    this.fixes.push(`修復 ${htmlFile} 中的 JavaScript 路徑`);
                }
            }
        });
    }

    enhanceFormHandler() {
        console.log('🔧 增強表單處理器...');
        
        const formHandlerPath = path.join(this.assetsPath, 'js', 'core', 'FormHandler.js');
        
        if (fs.existsSync(formHandlerPath)) {
            let content = fs.readFileSync(formHandlerPath, 'utf8');
            
            // 確保有完整的工務人員新增邏輯
            if (!content.includes('showAddStaffModal')) {
                console.log('   🔧 新增模態框處理方法...');
                
                const modalMethods = `
    
    showAddStaffModal() {
        console.log('📦 顯示新增工務人員彈窗');
        const modal = document.getElementById('addStaffModal');
        if (modal) {
            modal.classList.remove('hidden');
            // 聚焦到姓名欄位
            const nameInput = document.getElementById('staffName');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 100);
            }
        } else {
            console.error('❌ 找不到新增工務人員彈窗');
            alert('系統錯誤：找不到新增人員彈窗');
        }
    }
    
    hideAddStaffModal() {
        console.log('📦 隱藏新增工務人員彈窗');
        const modal = document.getElementById('addStaffModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    updateStaffOptions() {
        console.log('🔄 更新工務人員選項');
        try {
            const storage = new StorageService();
            const staffMembers = storage.getAllStaff();
            const staffSelect = document.getElementById('staff');
            
            if (!staffSelect) {
                console.error('❌ 找不到工務人員選擇欄位');
                return;
            }
            
            // 清空現有選項（保留預設選項）
            staffSelect.innerHTML = '<option value="">請選擇工務人員</option>';
            
            // 新增工務人員選項
            staffMembers.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff.name;
                option.textContent = staff.name;
                staffSelect.appendChild(option);
            });
            
            console.log(\`✅ 更新完成，共 \${staffMembers.length} 位工務人員\`);
            
        } catch (error) {
            console.error('💥 更新工務人員選項失敗:', error);
        }
    }`;
                
                content += modalMethods;
                fs.writeFileSync(formHandlerPath, content);
                this.fixes.push('新增模態框處理方法');
            }
            
            // 增強 handleAddStaff 方法
            if (content.includes('handleAddStaff') && !content.includes('comprehensive debugging')) {
                console.log('   🔧 增強工務人員新增處理...');
                
                const enhancedMethod = `
    async handleAddStaff(e) {
        e.preventDefault();
        console.log('🔧 開始處理工務人員新增 - comprehensive debugging');
        
        try {
            const formData = new FormData(e.target);
            const staffName = formData.get('staffName');
            const staffPhone = formData.get('staffPhone');
            
            console.log('📝 表單資料:', { staffName, staffPhone });
            
            // 驗證必填欄位
            if (!staffName || !staffName.trim()) {
                console.log('❌ 未提供姓名');
                alert('請輸入姓名');
                return;
            }
            
            // 建立工務人員資料
            const staff = {
                name: staffName.trim(),
                phone: staffPhone ? staffPhone.trim() : '',
                createdAt: new Date().toISOString()
            };
            
            console.log('👥 建立工務人員:', staff);
            
            // 檢查是否重複
            const storage = new StorageService();
            const existingStaff = storage.getAllStaff();
            const isDuplicate = existingStaff.some(existing => existing.name === staff.name);
            
            if (isDuplicate) {
                alert(\`工務人員 "\${staff.name}" 已存在\`);
                return;
            }
            
            // 保存到 localStorage
            storage.saveStaff(staff);
            console.log('💾 已保存到儲存空間');
            
            // 更新選項列表
            this.updateStaffOptions();
            
            // 自動選擇新建立的工務人員
            const staffSelect = document.getElementById('staff');
            if (staffSelect) {
                staffSelect.value = staff.name;
                console.log('✅ 已自動選擇:', staff.name);
            }
            
            // 關閉彈窗
            this.hideAddStaffModal();
            
            // 清空表單
            document.getElementById('addStaffForm').reset();
            
            // 顯示成功訊息
            if (typeof showToast === 'function') {
                showToast(\`工務人員 \${staff.name} 新增成功\`, 'success');
            } else {
                alert(\`工務人員 \${staff.name} 新增成功\`);
            }
            
            console.log('✅ 工務人員新增流程完成');
            
        } catch (error) {
            console.error('💥 工務人員新增失敗:', error);
            alert(\`新增工務人員失敗: \${error.message}\`);
        }
    }`;
                
                // 替換現有的 handleAddStaff 方法
                content = content.replace(/async handleAddStaff\(e\) \{[\s\S]*?\n    \}/, enhancedMethod.trim());
                fs.writeFileSync(formHandlerPath, content);
                this.fixes.push('增強工務人員新增處理邏輯');
            }
        }
    }

    enhanceAppController() {
        console.log('🔧 增強應用控制器...');
        
        const appControllerPath = path.join(this.assetsPath, 'js', 'core', 'AppController.js');
        
        if (fs.existsSync(appControllerPath)) {
            let content = fs.readFileSync(appControllerPath, 'utf8');
            
            // 確保有完整的事件監聽器設定
            if (!content.includes('comprehensive event setup')) {
                console.log('   🔧 新增完整事件設定...');
                
                const eventSetup = `
    
    setupEventListeners() {
        console.log('🎧 設定事件監聽器 - comprehensive event setup');
        
        try {
            // 新增工務人員按鈕
            const addStaffBtn = document.getElementById('addStaffBtn');
            if (addStaffBtn) {
                addStaffBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖱️ 新增工務人員按鈕被點擊');
                    if (this.formHandler && typeof this.formHandler.showAddStaffModal === 'function') {
                        this.formHandler.showAddStaffModal();
                    } else {
                        console.error('❌ FormHandler 或 showAddStaffModal 方法不存在');
                        alert('系統錯誤：無法開啟新增人員視窗');
                    }
                });
                console.log('✅ 新增工務人員按鈕事件已設定');
            } else {
                console.warn('⚠️ 找不到新增工務人員按鈕');
            }
            
            // 工務人員表單提交
            const addStaffForm = document.getElementById('addStaffForm');
            if (addStaffForm) {
                addStaffForm.addEventListener('submit', (e) => {
                    console.log('📝 工務人員表單提交');
                    if (this.formHandler && typeof this.formHandler.handleAddStaff === 'function') {
                        this.formHandler.handleAddStaff(e);
                    } else {
                        e.preventDefault();
                        console.error('❌ FormHandler 或 handleAddStaff 方法不存在');
                        alert('系統錯誤：無法處理表單提交');
                    }
                });
                console.log('✅ 工務人員表單事件已設定');
            } else {
                console.warn('⚠️ 找不到工務人員表單');
            }
            
            // 取消按鈕
            const cancelBtn = document.getElementById('cancelAddStaffBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('❌ 取消新增工務人員');
                    if (this.formHandler && typeof this.formHandler.hideAddStaffModal === 'function') {
                        this.formHandler.hideAddStaffModal();
                    }
                });
                console.log('✅ 取消按鈕事件已設定');
            }
            
            // Toast 關閉按鈕
            const closeToastBtn = document.getElementById('closeToastBtn');
            if (closeToastBtn) {
                closeToastBtn.addEventListener('click', () => {
                    if (typeof hideToast === 'function') {
                        hideToast();
                    }
                });
                console.log('✅ Toast 關閉按鈕事件已設定');
            }
            
        } catch (error) {
            console.error('💥 設定事件監聽器失敗:', error);
        }
    }
    
    initializeApplication() {
        console.log('🚀 初始化應用程式');
        
        try {
            // 初始化服務
            this.orderService = new OrderService();
            this.formHandler = new FormHandler();
            
            // 設定事件監聽器
            this.setupEventListeners();
            
            // 載入工務人員選項
            if (this.formHandler && typeof this.formHandler.updateStaffOptions === 'function') {
                this.formHandler.updateStaffOptions();
            }
            
            // 初始化表單
            this.initializeForm();
            
            console.log('✅ 應用程式初始化完成');
            
        } catch (error) {
            console.error('💥 應用程式初始化失敗:', error);
        }
    }`;
                
                content += eventSetup;
                fs.writeFileSync(appControllerPath, content);
                this.fixes.push('新增完整的事件設定和應用初始化');
            }
        }
    }

    enhanceAppInitialization() {
        console.log('🔧 增強應用程式初始化...');
        
        const appJsPath = path.join(this.assetsPath, 'js', 'core', 'app.js');
        
        if (fs.existsSync(appJsPath)) {
            let content = fs.readFileSync(appJsPath, 'utf8');
            
            // 確保有強健的初始化邏輯
            if (!content.includes('robust initialization')) {
                console.log('   🔧 新增強健的初始化邏輯...');
                
                const robustInit = `
// 強健的應用程式初始化 - robust initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM 載入完成，開始初始化');
    
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
                    console.error(\`❌ 缺少類別: \${className}\`);
                }
            });
            
            if (missingClasses.length > 0) {
                console.error(\`💥 無法初始化，缺少類別: \${missingClasses.join(', ')}\`);
                alert(\`系統載入失敗，缺少必要組件: \${missingClasses.join(', ')}\`);
                return;
            }
            
            console.log('✅ 所有必要類別都已載入');
            
            // 初始化應用程式
            const app = new AppController();
            
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
            
            console.log('✅ 應用程式初始化完成');
            
            // 全域錯誤處理
            window.addEventListener('error', (e) => {
                console.error('💥 全域錯誤:', e.error);
            });
            
        } catch (error) {
            console.error('💥 初始化過程發生錯誤:', error);
            alert(\`系統初始化失敗: \${error.message}\`);
        }
    }, 100);
});`;
                
                // 替換或新增初始化程式碼
                if (content.trim().length > 0) {
                    content = robustInit + '\n\n' + content;
                } else {
                    content = robustInit;
                }
                
                fs.writeFileSync(appJsPath, content);
                this.fixes.push('新增強健的應用程式初始化邏輯');
            }
        } else {
            // 如果檔案不存在，創建它
            console.log('   🔧 創建 app.js 檔案...');
            
            const appJsContent = `
// 線上簽名維修單系統 - 應用程式入口
// 強健的應用程式初始化 - robust initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM 載入完成，開始初始化線上簽名維修單系統');
    
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
                    console.error(\`❌ 缺少類別: \${className}\`);
                }
            });
            
            if (missingClasses.length > 0) {
                console.error(\`💥 無法初始化，缺少類別: \${missingClasses.join(', ')}\`);
                alert(\`系統載入失敗，缺少必要組件: \${missingClasses.join(', ')}\`);
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
            
            // 全域錯誤處理
            window.addEventListener('error', (e) => {
                console.error('💥 全域錯誤:', e.error);
            });
            
            // 未處理的 Promise 拒絕
            window.addEventListener('unhandledrejection', (e) => {
                console.error('💥 未處理的 Promise 拒絕:', e.reason);
            });
            
        } catch (error) {
            console.error('💥 初始化過程發生錯誤:', error);
            alert(\`系統初始化失敗: \${error.message}\`);
        }
    }, 100);
});`;
            
            fs.writeFileSync(appJsPath, appJsContent);
            this.fixes.push('創建強健的應用程式初始化檔案');
        }
    }

    async runAllFixes() {
        console.log('🔧 開始手動修復前端問題...');
        console.log('='.repeat(50));
        
        // 1. 修復檔案路徑
        this.fixJavaScriptFileReferences();
        
        // 2. 增強表單處理器
        this.enhanceFormHandler();
        
        // 3. 增強應用控制器
        this.enhanceAppController();
        
        // 4. 增強應用程式初始化
        this.enhanceAppInitialization();
        
        console.log('\n✅ 手動修復完成！');
        console.log(`📝 總共修復了 ${this.fixes.length} 個問題:`);
        
        this.fixes.forEach((fix, index) => {
            console.log(`   ${index + 1}. ${fix}`);
        });
        
        return this.fixes;
    }

    async saveFixReport() {
        const fixReport = {
            timestamp: new Date().toISOString(),
            type: 'manual_fix',
            totalFixes: this.fixes.length,
            fixes: this.fixes,
            nextSteps: [
                'git add .',
                'git commit -m "手動修復前端問題"',
                'git push origin main',
                '等待 Render 自動部署完成',
                '測試網站功能是否正常'
            ]
        };
        
        const reportPath = path.join(__dirname, 'manual-fix-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(fixReport, null, 2));
        
        console.log(`\n📋 修復報告保存在: ${reportPath}`);
        
        return fixReport;
    }
}

async function main() {
    console.log('🛠️ 線上簽名維修單系統 - 手動修復工具');
    console.log('='.repeat(50));
    
    const fixer = new ManualFixer();
    
    try {
        // 執行所有修復
        const fixes = await fixer.runAllFixes();
        
        // 保存修復報告
        await fixer.saveFixReport();
        
        console.log('\n🎉 修復完成！下一步建議：');
        console.log('   1. git add .');
        console.log('   2. git commit -m "手動修復前端 JavaScript 載入和事件處理問題"');
        console.log('   3. git push origin main');
        console.log('   4. 等待 Render 自動部署（約 2-3 分鐘）');
        console.log('   5. 測試網站功能');
        
    } catch (error) {
        console.error(`💥 手動修復過程發生錯誤: ${error.message}`);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ManualFixer;