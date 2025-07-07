# WordPress整合指南

## 🔗 iframe嵌入方式

### 基本嵌入代碼

```html
<iframe 
  src="https://your-app-name.onrender.com" 
  width="100%" 
  height="900px" 
  frameborder="0"
  allow="camera; microphone; geolocation"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads">
  您的瀏覽器不支援iframe，請直接前往 
  <a href="https://your-app-name.onrender.com">維修單系統</a>
</iframe>
```

### WordPress Gutenberg區塊

在WordPress編輯器中：

1. 新增「自訂HTML」區塊
2. 貼上以下代碼：

```html
<div class="maintenance-system-container">
  <iframe 
    src="https://your-app-name.onrender.com" 
    width="100%" 
    height="900px" 
    frameborder="0"
    style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
    allow="camera; microphone; geolocation"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
    title="線上簽名維修單系統">
  </iframe>
</div>

<style>
.maintenance-system-container {
  margin: 20px 0;
  padding: 0;
}

.maintenance-system-container iframe {
  max-width: 100%;
  min-height: 800px;
}

@media (max-width: 768px) {
  .maintenance-system-container iframe {
    height: 600px;
  }
}
</style>
```

### 進階整合選項

#### 1. 響應式高度調整

```html
<script>
// 自動調整iframe高度
function resizeIframe() {
  const iframe = document.querySelector('#maintenance-iframe');
  if (iframe) {
    iframe.style.height = '800px';
    
    // 監聽訊息來動態調整高度
    window.addEventListener('message', function(event) {
      if (event.origin === 'https://your-app-name.onrender.com') {
        if (event.data.type === 'resize') {
          iframe.style.height = event.data.height + 'px';
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', resizeIframe);
</script>

<iframe 
  id="maintenance-iframe"
  src="https://your-app-name.onrender.com" 
  width="100%" 
  height="800px" 
  frameborder="0">
</iframe>
```

#### 2. 載入狀態指示器

```html
<div id="loading-container">
  <div class="loading-spinner">
    <div class="spinner"></div>
    <p>載入維修單系統中...</p>
  </div>
  
  <iframe 
    id="maintenance-iframe"
    src="https://your-app-name.onrender.com" 
    width="100%" 
    height="900px" 
    frameborder="0"
    onload="document.getElementById('loading-container').querySelector('.loading-spinner').style.display='none'">
  </iframe>
</div>

<style>
.loading-spinner {
  text-align: center;
  padding: 40px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

## 🔧 WordPress外掛整合

### functions.php 添加功能

```php
// 在主題的 functions.php 中添加
function add_maintenance_system_shortcode() {
    return '<iframe 
        src="https://your-app-name.onrender.com" 
        width="100%" 
        height="900px" 
        frameborder="0"
        style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
        allow="camera; microphone; geolocation"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads">
    </iframe>';
}
add_shortcode('maintenance_system', 'add_maintenance_system_shortcode');

// 使用方式：在文章或頁面中插入 [maintenance_system]
```

### 自訂頁面模板

創建 `page-maintenance.php`：

```php
<?php
/*
Template Name: 維修單系統
*/

get_header(); ?>

<div class="maintenance-page-container">
    <div class="page-header">
        <h1>線上簽名維修單系統</h1>
        <p>請使用以下系統建立和管理維修單</p>
    </div>
    
    <div class="maintenance-system-wrapper">
        <iframe 
            src="https://your-app-name.onrender.com" 
            width="100%" 
            height="900px" 
            frameborder="0"
            allow="camera; microphone; geolocation"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads">
        </iframe>
    </div>
</div>

<style>
.maintenance-page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.page-header {
    text-align: center;
    margin-bottom: 30px;
}

.maintenance-system-wrapper {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.maintenance-system-wrapper iframe {
    border-radius: 8px;
}
</style>

<?php get_footer(); ?>
```

## 🛡️ 安全性考量

### iframe安全設定

```html
<!-- 推薦的安全設定 -->
<iframe 
  src="https://your-app-name.onrender.com" 
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
  allow="camera; microphone; geolocation"
  referrerpolicy="strict-origin-when-cross-origin"
  loading="lazy">
</iframe>
```

### 內容安全政策（CSP）

在WordPress中添加CSP頭：

```php
// functions.php
function add_maintenance_system_csp() {
    if (is_page('maintenance')) {
        header("Content-Security-Policy: frame-src 'self' https://your-app-name.onrender.com;");
    }
}
add_action('send_headers', 'add_maintenance_system_csp');
```

## 📱 行動裝置優化

```css
/* 響應式設計 */
@media (max-width: 768px) {
  .maintenance-system-wrapper iframe {
    height: 600px;
    min-height: 500px;
  }
}

@media (max-width: 480px) {
  .maintenance-system-wrapper {
    padding: 10px;
    margin: 0 -10px;
  }
  
  .maintenance-system-wrapper iframe {
    height: 500px;
  }
}
```

## 🎨 樣式客製化

### 與WordPress主題整合

```css
/* 配合WordPress主題樣式 */
.maintenance-system-container {
  background: var(--wp-background-color, #ffffff);
  border-radius: var(--wp-border-radius, 8px);
  box-shadow: var(--wp-box-shadow, 0 2px 4px rgba(0,0,0,0.1));
}

.maintenance-system-container iframe {
  border: 1px solid var(--wp-border-color, #e2e8f0);
}
```

## 🔗 連結處理

### 簽名連結整合

系統產生的簽名連結格式：
```
https://your-app-name.onrender.com?order=20240707-1234
```

可以設定重定向規則讓連結更友善：
```
https://yourwordpress.com/signature/20240707-1234
```

## 測試檢查清單

- [ ] iframe正常載入
- [ ] 響應式設計在手機上正常
- [ ] 簽名功能在iframe中正常運作
- [ ] 照片上傳功能正常
- [ ] 資料儲存功能正常
- [ ] 簽名連結可以正常開啟
- [ ] 跨域功能正常運作

---

**替換 `your-app-name.onrender.com` 為你的實際Render網址！**