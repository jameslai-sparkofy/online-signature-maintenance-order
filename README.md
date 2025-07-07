# 線上簽名維修單系統

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jameslai-sparkofy/online-signature-maintenance-order)

🌐 **LIVE DEMO**: https://online-signature-maintenance-order.onrender.com

## 🚀 專案概述

專業的線上維修單管理系統，具備數位簽名功能，適用於物業管理、工程維修等場景。

### ✨ 主要功能

- **📝 維修單建立**: 完整的表單系統，支援自動產生單號
- **📷 照片上傳**: 多張照片上傳，自動壓縮與預覽
- **✍️ 數位簽名**: Canvas-based簽名功能，支援觸控與滑鼠
- **📋 訂單管理**: 列表檢視、篩選、狀態追蹤
- **🔗 分享連結**: 每筆訂單獨特簽名連結
- **📧 Email通知**: 簽名完成後自動通知

### 🛠️ 技術架構

- **前端**: 純JavaScript (ES6+)、HTML5、CSS3
- **儲存**: LocalStorage (瀏覽器本地儲存)
- **設計**: 響應式設計，支援行動裝置
- **部署**: 靜態網站，可部署至任何靜態主機
- **測試**: Playwright E2E 自動化測試

## 🚀 快速開始

### 本地開發

```bash
# 克隆專案
git clone https://github.com/jameslai-sparkofy/online-signature-maintenance-order.git
cd online-signature-maintenance-order

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 自動化測試

```bash
# 安裝 Playwright 瀏覽器
npm run install-playwright

# 執行測試
npm test

# 執行測試（有界面）
npm run test:headed

# 執行測試（除錯模式）
npm run test:debug

# 執行測試（UI模式）
npm run test:ui
```

### 部署到Render

1. Fork此專案到你的GitHub帳號
2. 前往 [Render](https://render.com)
3. 點擊 "New +" → "Static Site"
4. 連接你的GitHub repository
5. 使用以下設定：
   - **Build Command**: 留空
   - **Publish Directory**: `./`

或直接點擊上方的 **Deploy to Render** 按鈕！

## 🧪 測試涵蓋範圍

### 功能測試
- ✅ 頁面基本載入
- ✅ 維修單號自動產生
- ✅ 日期自動填入
- ✅ 表單欄位顯示
- ✅ 新增工務人員功能
- ✅ 表單驗證
- ✅ 完整建立維修單流程
- ✅ 導覽功能
- ✅ 照片上傳功能
- ✅ 本地儲存功能

### 響應式測試
- ✅ 桌面瀏覽器 (Chrome, Firefox, Safari, Edge)
- ✅ 手機裝置 (Pixel 5, iPhone 12)
- ✅ 平板裝置適配

### 簽名功能測試
- ✅ 簽名頁面載入
- ✅ 簽名畫布功能
- ✅ Email欄位驗證

### 效能測試
- ✅ 頁面載入時間 < 5秒
- ✅ JavaScript模組載入檢查

## 📱 使用說明

### 建立維修單

1. 點擊「新增維修單」
2. 填寫必要資訊：
   - 案場名稱
   - 棟別/樓層/戶別
   - 維修原因
   - 工務人員
   - 金額
3. 上傳維修照片
4. 提交建立維修單

### 數位簽名流程

1. 複製系統產生的簽名連結
2. 傳送給客戶或工地主任
3. 客戶點擊連結查看維修詳情
4. 在畫布上進行數位簽名
5. 選填Email接收確認信
6. 完成簽名確認

### 管理維修單

- 在「維修單列表」查看所有訂單
- 使用篩選功能快速找到特定訂單
- 查看詳細資訊和簽名狀態
- 複製分享連結

## 🏗️ 專案結構

```
根目錄/
├── index.html               # 主系統頁面
├── signature.html           # 客戶簽名頁面
├── styles.css              # 樣式表
├── js/                     # JavaScript模組
│   ├── core/               # 核心功能
│   │   ├── AppController.js # 主應用控制器
│   │   ├── FormHandler.js  # 表單處理
│   │   ├── PhotoHandler.js # 照片處理
│   │   ├── SignatureHandler.js # 簽名處理
│   │   └── app.js          # 應用程式入口
│   ├── models/             # 資料模型
│   │   └── Order.js        # 訂單模型
│   ├── services/           # 服務層
│   │   ├── OrderService.js # 訂單服務
│   │   └── StorageService.js # 儲存服務
│   └── utils/              # 工具函數
│       └── helpers.js      # 輔助函數
├── tests/                  # 測試檔案
│   └── playwright-test.js  # Playwright E2E測試
├── playwright.config.js    # Playwright配置
└── package.json           # 專案依賴配置
```

## 🌐 整合到WordPress

系統可透過iframe嵌入到WordPress網站：

```html
<iframe 
  src="https://online-signature-maintenance-order.onrender.com" 
  width="100%" 
  height="900px" 
  frameborder="0"
  allow="camera; microphone; geolocation"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads">
</iframe>
```

詳細整合說明請參考 [WordPress整合指南](wordpress-integration.md)

## 📋 瀏覽器相容性

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## 🔧 環境變數

無需額外環境變數配置，系統使用本地儲存。

## 📊 測試報告

執行測試後，可在以下位置查看詳細報告：
- HTML報告: `playwright-report/index.html`
- JSON結果: `test-results/results.json`
- JUnit報告: `test-results/results.xml`

## 🔄 持續整合

專案支援 GitHub Actions 自動化測試：

```yaml
# .github/workflows/test.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npm test
```

## 📄 授權

MIT License - 詳見 [LICENSE](LICENSE) 檔案

## 🤝 貢獻

歡迎提交Issue和Pull Request來改善此專案！

### 開發流程
1. Fork專案
2. 創建功能分支
3. 執行測試確保通過
4. 提交Pull Request

---

**🤖 Generated with [Claude Code](https://claude.ai/code)**