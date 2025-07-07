# 部署檢查清單

## 🚀 Render部署步驟

### 1. 部署前檢查
- [x] GitHub repository已建立並同步
- [x] 所有檔案已上傳
- [x] render.yaml配置檔已準備
- [x] package.json設定正確
- [x] _redirects檔案已建立

### 2. Render部署設定

**方法一：一鍵部署**
```
https://render.com/deploy?repo=https://github.com/jameslai-sparkofy/online-signature-maintenance-order
```

**方法二：手動部署**
1. 前往 [render.com](https://render.com)
2. 點擊 "New +" → "Static Site"
3. 連接GitHub repository
4. 設定如下：
   - **Name**: `online-signature-maintenance-order`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Publish Directory**: `src/main/resources/assets`
   - **Auto-Deploy**: `Yes`

### 3. 部署後驗證

#### 基本功能測試
- [ ] 網站可以正常載入
- [ ] 主頁面顯示正常
- [ ] 新增維修單功能正常
- [ ] 維修單列表功能正常
- [ ] 照片上傳功能正常
- [ ] 表單驗證正常運作

#### 簽名功能測試
- [ ] 簽名頁面可以直接存取
- [ ] URL參數傳遞正常（`?order=12345`）
- [ ] 簽名畫布功能正常
- [ ] 滑鼠簽名正常
- [ ] 觸控簽名正常（手機測試）
- [ ] 簽名儲存功能正常

#### 行動裝置測試
- [ ] iPhone Safari正常運作
- [ ] Android Chrome正常運作
- [ ] 響應式設計正常
- [ ] 觸控操作順暢
- [ ] 照片上傳在手機上正常

#### 資料功能測試
- [ ] 建立維修單後資料正常儲存
- [ ] 簽名後狀態正常更新
- [ ] 瀏覽器重新整理後資料保持
- [ ] 篩選功能正常運作
- [ ] 搜尋功能正常運作

### 4. 效能檢查
- [ ] 頁面載入時間 < 3秒
- [ ] 照片上傳響應時間合理
- [ ] 簽名操作流暢無延遲
- [ ] 大型照片自動壓縮正常

### 5. 瀏覽器相容性
- [ ] Chrome (最新版本)
- [ ] Firefox (最新版本)
- [ ] Safari (最新版本)
- [ ] Edge (最新版本)
- [ ] 手機瀏覽器

## 🔧 常見問題排除

### 部署失敗
**問題**: Build failed
**解決方案**:
1. 檢查 package.json 語法
2. 確認 render.yaml 路徑正確
3. 查看 Render 建置日誌

### 簽名頁面404錯誤
**問題**: `/signature?order=123` 返回404
**解決方案**:
1. 確認 `_redirects` 檔案在正確位置
2. 檢查重定向規則語法
3. 確認 `signature.html` 存在

### 照片上傳失敗
**問題**: 照片無法上傳或顯示
**解決方案**:
1. 檢查檔案大小限制（5MB）
2. 確認支援的檔案格式
3. 檢查瀏覽器控制台錯誤

### 資料不持久
**問題**: 重新整理後資料消失
**解決方案**:
1. 檢查 localStorage 是否啟用
2. 確認瀏覽器隱私設定
3. 測試無痕模式下的行為

### 跨域問題
**問題**: iframe載入失敗
**解決方案**:
1. 檢查 X-Frame-Options 設定
2. 確認 CSP 政策設定
3. 測試不同的 sandbox 參數

## 📱 WordPress整合檢查

### 基本嵌入測試
- [ ] iframe正常載入到WordPress頁面
- [ ] 高度設定適當（建議900px）
- [ ] 寬度100%正常顯示
- [ ] 無邊框樣式正確

### 功能完整性測試
- [ ] 在iframe中可以正常建立維修單
- [ ] 照片上傳在iframe中正常運作
- [ ] 簽名功能在iframe中正常
- [ ] 跨域cookie/localStorage正常

### 行動裝置iframe測試
- [ ] 手機上iframe顯示正常
- [ ] 觸控操作在iframe中順暢
- [ ] 響應式設計在iframe中正常
- [ ] 鍵盤彈出時不影響使用

## 🌐 生產環境設定

### 網域設定（可選）
如果有自訂網域：
1. 在Render設定Custom Domain
2. 更新DNS記錄
3. 設定SSL憑證
4. 測試HTTPS連線

### 監控設定
- [ ] 設定Render的監控通知
- [ ] 確認自動部署正常運作
- [ ] 設定錯誤追蹤（如果需要）

### 備份策略
- [ ] GitHub自動備份已啟用
- [ ] 定期匯出重要資料
- [ ] 文檔備份到安全位置

## ✅ 部署完成確認

部署網址：`https://____________.onrender.com`

**最終檢查：**
- [ ] 所有功能正常運作
- [ ] 效能表現良好
- [ ] 行動裝置相容
- [ ] WordPress整合就緒
- [ ] 使用者體驗良好

**交付項目：**
- [ ] 生產環境URL
- [ ] WordPress嵌入代碼
- [ ] 使用手冊
- [ ] 技術文檔
- [ ] 支援聯絡方式

---

**部署完成後，請更新此文檔中的實際網址！**