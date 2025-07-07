const fs = require('fs');
const path = require('path');
const FrontendDebugger = require('./puppeteer-debug');

/**
 * 自動修復前端問題
 * 根據診斷結果自動修正常見問題
 */
class AutoFixer {
    constructor() {
        this.assetsPath = path.join(__dirname, '..', 'src', 'main', 'resources', 'assets');
        this.fixes = [];
    }

    async loadDebugReport() {
        const reportPath = path.join(__dirname, 'debug-report.json');
        
        if (!fs.existsSync(reportPath)) {
            console.log('📊 先執行診斷...');
            const frontendDebugger = new FrontendDebugger();
            const report = await frontendDebugger.run();
            return report;
        }
        
        const reportData = fs.readFileSync(reportPath, 'utf8');
        return JSON.parse(reportData);
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
                const scriptReplacements = [
                    { from: 'src="../js/', to: 'src="js/' },
                    { from: 'src="./js/', to: 'src="js/' },
                    { from: 'src="/js/', to: 'src="js/' }
                ];
                
                scriptReplacements.forEach(({ from, to }) => {
                    if (content.includes(from)) {
                        content = content.replace(new RegExp(from, 'g'), to);
                        modified = true;
                        console.log(`   ✅ ${htmlFile}: 修正 ${from} → ${to}`);
                    }
                });
                
                // 修正 CSS 路徑
                const cssReplacements = [
                    { from: 'href="../styles.css"', to: 'href="styles.css"' },
                    { from: 'href="./styles.css"', to: 'href="styles.css"' },
                    { from: 'href="/styles.css"', to: 'href="styles.css"' }
                ];
                
                cssReplacements.forEach(({ from, to }) => {
                    if (content.includes(from)) {
                        content = content.replace(new RegExp(from, 'g'), to);
                        modified = true;
                        console.log(`   ✅ ${htmlFile}: 修正 ${from} → ${to}`);
                    }
                });
                
                if (modified) {
                    fs.writeFileSync(htmlPath, content);
                    this.fixes.push(`修復 ${htmlFile} 中的檔案路徑參照`);
                }
            }
        });
    }

    fixFormInitialization() {
        console.log('🔧 修復表單初始化問題...');
        
        const appJsPath = path.join(this.assetsPath, 'js', 'core', 'app.js');
        
        if (fs.existsSync(appJsPath)) {
            let content = fs.readFileSync(appJsPath, 'utf8');
            let modified = false;
            
            // 確保 DOM 載入完成後才初始化
            const initPattern = /document\.addEventListener\('DOMContentLoaded'/;
            
            if (!initPattern.test(content)) {
                console.log('   🔧 新增 DOMContentLoaded 事件監聽器...');
                
                content = `// 確保 DOM 載入完成後才初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM 載入完成，開始初始化應用程式');
    
    try {
        // 初始化應用程式
        if (typeof AppController !== 'undefined') {
            const app = new AppController();
            console.log('✅ AppController 初始化完成');
        } else {
            console.error('❌ AppController 未定義');
        }
    } catch (error) {
        console.error('💥 應用程式初始化失敗:', error);
    }
});

${content}`;
                
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(appJsPath, content);
                this.fixes.push('修復應用程式初始化邏輯');
            }
        }
    }

    fixFormHandlerEvents() {
        console.log('🔧 修復表單處理器事件...');
        
        const formHandlerPath = path.join(this.assetsPath, 'js', 'core', 'FormHandler.js');
        
        if (fs.existsSync(formHandlerPath)) {
            let content = fs.readFileSync(formHandlerPath, 'utf8');
            let modified = false;
            
            // 增強事件處理器的錯誤處理
            const handleAddStaffMethod = content.match(/async handleAddStaff\(e\) \{[\s\S]*?\n    \}/);
            
            if (handleAddStaffMethod && !content.includes('comprehensive debugging')) {
                console.log('   🔧 增強工務人員新增功能的錯誤處理...');
                
                const enhancedMethod = `
    async handleAddStaff(e) {
        e.preventDefault();
        console.log('🔧 handleAddStaff called - comprehensive debugging enabled');
        
        try {
            const formData = new FormData(e.target);
            const staffName = formData.get('staffName');
            const staffPhone = formData.get('staffPhone');
            
            console.log('📝 Form data:', { staffName, staffPhone });
            
            // 驗證必填欄位
            if (!staffName || !staffName.trim()) {
                console.log('❌ No staff name provided');
                alert('請輸入姓名');
                return;
            }
            
            // 建立工務人員資料
            const staff = {
                name: staffName.trim(),
                phone: staffPhone ? staffPhone.trim() : '',
                createdAt: new Date().toISOString()
            };
            
            console.log('👥 Creating staff:', staff);
            
            // 保存到 localStorage
            const storage = new StorageService();
            storage.saveStaff(staff);
            
            console.log('💾 Staff saved to storage');
            
            // 更新選項列表
            this.updateStaffOptions();
            
            // 自動選擇新建立的工務人員
            const staffSelect = document.getElementById('staff');
            if (staffSelect) {
                staffSelect.value = staff.name;
                console.log('✅ Staff auto-selected:', staff.name);
            }
            
            // 關閉彈窗
            this.hideAddStaffModal();
            
            // 清空表單
            document.getElementById('addStaffForm').reset();
            
            // 顯示成功訊息
            showToast(\`工務人員 \${staff.name} 新增成功\`, 'success');
            
            console.log('✅ Staff addition completed successfully');
            
        } catch (error) {
            console.error('💥 Error in handleAddStaff:', error);
            alert(\`新增工務人員失敗: \${error.message}\`);
        }
    }`;
                
                content = content.replace(/async handleAddStaff\(e\) \{[\s\S]*?\n    \}/, enhancedMethod.trim());
                modified = true;
            }
            
            // 確保模態框顯示/隱藏方法存在
            if (!content.includes('showAddStaffModal')) {
                console.log('   🔧 新增模態框顯示/隱藏方法...');
                
                const modalMethods = `
    
    showAddStaffModal() {
        console.log('📦 Showing add staff modal');
        const modal = document.getElementById('addStaffModal');
        if (modal) {
            modal.classList.remove('hidden');
            // 聚焦到姓名欄位
            const nameInput = document.getElementById('staffName');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 100);
            }
        } else {
            console.error('❌ Add staff modal not found');
        }
    }
    
    hideAddStaffModal() {
        console.log('📦 Hiding add staff modal');
        const modal = document.getElementById('addStaffModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    updateStaffOptions() {
        console.log('🔄 Updating staff options');
        try {
            const storage = new StorageService();
            const staffMembers = storage.getAllStaff();
            const staffSelect = document.getElementById('staff');
            
            if (!staffSelect) {
                console.error('❌ Staff select element not found');
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
            
            console.log(\`✅ Updated staff options, total: \${staffMembers.length}\`);
            
        } catch (error) {
            console.error('💥 Error updating staff options:', error);
        }
    }`;
                
                content += modalMethods;
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(formHandlerPath, content);
                this.fixes.push('增強表單處理器事件和錯誤處理');
            }
        }
    }

    fixAppControllerInitialization() {
        console.log('🔧 修復應用控制器初始化...');
        
        const appControllerPath = path.join(this.assetsPath, 'js', 'core', 'AppController.js');
        
        if (fs.existsSync(appControllerPath)) {
            let content = fs.readFileSync(appControllerPath, 'utf8');
            let modified = false;
            
            // 確保構造函數中有完整的初始化邏輯
            const constructorPattern = /constructor\(\) \{[\s\S]*?\n    \}/;
            const constructorMatch = content.match(constructorPattern);
            
            if (constructorMatch && !content.includes('comprehensive initialization')) {
                console.log('   🔧 增強應用控制器初始化...');
                
                const enhancedConstructor = `
    constructor() {
        console.log('🎮 AppController: comprehensive initialization started');
        
        try {
            // 初始化服務
            this.orderService = new OrderService();
            this.formHandler = new FormHandler();
            
            console.log('✅ Services initialized');
            
            // 初始化事件監聽器
            this.initializeEventListeners();
            
            // 初始化表單
            this.initializeForm();
            
            // 載入工務人員選項
            this.loadStaffOptions();
            
            console.log('✅ AppController initialization completed');
            
        } catch (error) {
            console.error('💥 AppController initialization failed:', error);
        }
    }`;
                
                content = content.replace(constructorPattern, enhancedConstructor.trim());
                modified = true;
            }
            
            // 確保事件監聽器初始化方法存在
            if (!content.includes('initializeEventListeners')) {
                console.log('   🔧 新增事件監聽器初始化方法...');
                
                const eventListenerMethod = `
    
    initializeEventListeners() {
        console.log('🎧 Initializing event listeners');
        
        try {
            // 新增工務人員按鈕
            const addStaffBtn = document.getElementById('addStaffBtn');
            if (addStaffBtn) {
                addStaffBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖱️ Add staff button clicked');
                    this.formHandler.showAddStaffModal();
                });
                console.log('✅ Add staff button listener attached');
            } else {
                console.warn('⚠️ Add staff button not found');
            }
            
            // 工務人員表單提交
            const addStaffForm = document.getElementById('addStaffForm');
            if (addStaffForm) {
                addStaffForm.addEventListener('submit', (e) => {
                    console.log('📝 Add staff form submitted');
                    this.formHandler.handleAddStaff(e);
                });
                console.log('✅ Add staff form listener attached');
            } else {
                console.warn('⚠️ Add staff form not found');
            }
            
            // 取消按鈕
            const cancelBtn = document.getElementById('cancelAddStaffBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('❌ Cancel add staff clicked');
                    this.formHandler.hideAddStaffModal();
                });
                console.log('✅ Cancel button listener attached');
            }
            
            // 主表單提交
            const mainForm = document.getElementById('maintenanceForm');
            if (mainForm) {
                mainForm.addEventListener('submit', (e) => {
                    console.log('📋 Main form submitted');
                    this.formHandler.handleFormSubmit(e);
                });
                console.log('✅ Main form listener attached');
            }
            
        } catch (error) {
            console.error('💥 Error initializing event listeners:', error);
        }
    }
    
    loadStaffOptions() {
        console.log('👥 Loading staff options');
        if (this.formHandler && typeof this.formHandler.updateStaffOptions === 'function') {
            this.formHandler.updateStaffOptions();
        } else {
            console.warn('⚠️ FormHandler updateStaffOptions method not available');
        }
    }`;
                
                content += eventListenerMethod;
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(appControllerPath, content);
                this.fixes.push('修復應用控制器初始化和事件處理');
            }
        }
    }

    fixHelpersFunction() {
        console.log('🔧 修復輔助函數...');
        
        const helpersPath = path.join(this.assetsPath, 'js', 'utils', 'helpers.js');
        
        if (fs.existsSync(helpersPath)) {
            let content = fs.readFileSync(helpersPath, 'utf8');
            let modified = false;
            
            // 確保 generateOrderLink 函數正確處理簽名頁面
            if (content.includes('generateOrderLink') && !content.includes('signature.html')) {
                console.log('   🔧 修復 generateOrderLink 函數...');
                
                const oldFunction = /function generateOrderLink\(orderNumber\) \{[\s\S]*?\n\}/;
                const newFunction = `function generateOrderLink(orderNumber) {
    const baseUrl = window.location.origin + window.location.pathname.replace('/index.html', '').replace(/\/$/, '');
    return \`\${baseUrl}/signature.html?order=\${orderNumber}\`;
}`;
                
                content = content.replace(oldFunction, newFunction);
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(helpersPath, content);
                this.fixes.push('修復輔助函數的連結生成邏輯');
            }
        }
    }

    createMissingFiles() {
        console.log('🔧 檢查並創建缺失的檔案...');
        
        // 檢查必要的目錄結構
        const requiredDirs = [
            path.join(this.assetsPath, 'js'),
            path.join(this.assetsPath, 'js', 'utils'),
            path.join(this.assetsPath, 'js', 'models'),
            path.join(this.assetsPath, 'js', 'services'),
            path.join(this.assetsPath, 'js', 'core')
        ];
        
        requiredDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`   📁 創建目錄: ${dir}`);
                this.fixes.push(`創建缺失目錄: ${path.relative(this.assetsPath, dir)}`);
            }
        });
        
        // 檢查 CSS 檔案
        const stylesPath = path.join(this.assetsPath, 'styles.css');
        if (!fs.existsSync(stylesPath)) {
            console.log('   🎨 創建基本 CSS 檔案...');
            
            const basicCSS = `/* 線上簽名維修單系統 - 基本樣式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.hidden {
    display: none !important;
}

.btn {
    display: inline-block;
    padding: 10px 20px;
    margin: 5px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn:hover {
    opacity: 0.8;
    transform: translateY(-1px);
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
}

.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 1001;
    min-width: 250px;
}

.toast.success {
    background-color: #28a745;
}

.toast.error {
    background-color: #dc3545;
}

.toast.info {
    background-color: #17a2b8;
}`;
            
            fs.writeFileSync(stylesPath, basicCSS);
            this.fixes.push('創建基本 CSS 樣式檔案');
        }
    }

    async runFixes(report) {
        console.log('🔧 開始自動修復...');
        console.log('='.repeat(40));
        
        // 修復檔案路徑問題
        this.fixJavaScriptFileReferences();
        
        // 創建缺失的檔案
        this.createMissingFiles();
        
        // 修復表單相關問題
        this.fixFormInitialization();
        this.fixFormHandlerEvents();
        this.fixAppControllerInitialization();
        
        // 修復輔助函數
        this.fixHelpersFunction();
        
        console.log('\n✅ 自動修復完成！');
        console.log(`📝 總共修復了 ${this.fixes.length} 個問題:`);
        
        this.fixes.forEach((fix, index) => {
            console.log(`   ${index + 1}. ${fix}`);
        });
        
        return this.fixes;
    }

    async saveFixReport() {
        const fixReport = {
            timestamp: new Date().toISOString(),
            totalFixes: this.fixes.length,
            fixes: this.fixes,
            nextSteps: [
                '重新部署應用程式到 Render',
                '執行 npm run debug 重新檢測',
                '手動測試工務人員新增功能',
                '檢查所有表單功能是否正常'
            ]
        };
        
        const reportPath = path.join(__dirname, 'fix-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(fixReport, null, 2));
        
        console.log(`\n📋 修復報告保存在: ${reportPath}`);
        
        return fixReport;
    }
}

async function main() {
    console.log('🛠️ 線上簽名維修單系統 - 自動修復工具');
    console.log('='.repeat(50));
    
    const fixer = new AutoFixer();
    
    try {
        // 載入診斷報告
        const report = await fixer.loadDebugReport();
        
        if (!report) {
            console.log('❌ 無法載入診斷報告');
            return;
        }
        
        console.log(`📊 發現 ${report.summary.totalIssues} 個問題，開始修復...`);
        
        // 執行修復
        const fixes = await fixer.runFixes(report);
        
        // 保存修復報告
        await fixer.saveFixReport();
        
        console.log('\n🎉 修復完成！建議下一步：');
        console.log('   1. git add .');
        console.log('   2. git commit -m "自動修復前端問題"');
        console.log('   3. git push origin main');
        console.log('   4. 等待 Render 自動部署');
        console.log('   5. npm run debug 重新檢測');
        
    } catch (error) {
        console.error(`💥 自動修復過程發生錯誤: ${error.message}`);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AutoFixer;