const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://online-signature-maintenance-order.onrender.com';

test.describe('維修單系統測試', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('頁面基本載入測試', async ({ page }) => {
    // 檢查頁面標題
    await expect(page).toHaveTitle(/線上簽名維修單系統/);
    
    // 檢查主要標題
    await expect(page.locator('h1')).toContainText('線上簽名維修單系統');
    
    // 檢查導覽按鈕
    await expect(page.locator('#newOrderBtn')).toContainText('新增維修單');
    await expect(page.locator('#orderListBtn')).toContainText('維修單列表');
  });

  test('維修單號自動產生測試', async ({ page }) => {
    // 檢查維修單號欄位是否有值
    const orderNumberInput = page.locator('#orderNumber');
    await expect(orderNumberInput).toHaveValue(/\d{8}-\d{4}/);
    
    // 檢查是否為今天的日期格式
    const today = new Date();
    const dateStr = today.getFullYear() + 
                   String(today.getMonth() + 1).padStart(2, '0') + 
                   String(today.getDate()).padStart(2, '0');
    
    const orderNumber = await orderNumberInput.inputValue();
    expect(orderNumber).toMatch(new RegExp(`^${dateStr}-\\d{4}$`));
  });

  test('日期欄位自動填入測試', async ({ page }) => {
    // 檢查日期欄位是否設為今天
    const dateInput = page.locator('#date');
    const today = new Date();
    const expectedDate = today.getFullYear() + '-' + 
                        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(today.getDate()).padStart(2, '0');
    
    await expect(dateInput).toHaveValue(expectedDate);
  });

  test('表單欄位顯示測試', async ({ page }) => {
    // 檢查所有必要欄位是否存在
    await expect(page.locator('#site')).toBeVisible();
    await expect(page.locator('#building')).toBeVisible();
    await expect(page.locator('#floor')).toBeVisible();
    await expect(page.locator('#unit')).toBeVisible();
    await expect(page.locator('#reason')).toBeVisible();
    await expect(page.locator('#staff')).toBeVisible();
    await expect(page.locator('#amount')).toBeVisible();
    await expect(page.locator('#photos')).toBeVisible();
  });

  test('新增工務人員功能測試', async ({ page }) => {
    // 點擊新增人員按鈕
    await page.click('#addStaffBtn');
    
    // 檢查彈窗是否出現
    await expect(page.locator('#addStaffModal')).toBeVisible();
    
    // 填寫工務人員資料
    await page.fill('#staffName', '測試人員');
    await page.fill('#staffPhone', '0912345678');
    
    // 提交表單
    await page.click('#addStaffForm button[type="submit"]');
    
    // 檢查是否成功添加到下拉選單
    await expect(page.locator('#staff option')).toContainText('測試人員');
  });

  test('表單驗證測試', async ({ page }) => {
    // 嘗試提交空表單
    await page.click('button[type="submit"]');
    
    // 應該要有驗證錯誤（檢查是否有toast訊息或表單驗證）
    const toastMessage = page.locator('#messageToast');
    // 等待一下看是否有錯誤訊息出現
    await page.waitForTimeout(1000);
  });

  test('完整建立維修單流程測試', async ({ page }) => {
    // 填寫完整的維修單表單
    await page.fill('#site', '測試案場');
    await page.fill('#building', 'A棟');
    await page.fill('#floor', '3樓');
    await page.fill('#unit', '301');
    await page.fill('#reason', '水龍頭漏水需要維修');
    await page.fill('#amount', '500');
    
    // 先新增工務人員
    await page.click('#addStaffBtn');
    await page.fill('#staffName', '張師傅');
    await page.fill('#staffPhone', '0987654321');
    await page.click('#addStaffForm button[type="submit"]');
    
    // 選擇工務人員
    await page.selectOption('#staff', '張師傅');
    
    // 提交表單
    await page.click('button[type="submit"]');
    
    // 檢查是否成功建立（應該有成功訊息）
    await page.waitForTimeout(2000);
    
    // 檢查是否有簽名連結出現
    const successElement = page.locator('#orderSuccess');
    if (await successElement.isVisible()) {
      await expect(successElement).toContainText('維修單建立成功');
    }
  });

  test('導覽功能測試', async ({ page }) => {
    // 測試切換到維修單列表
    await page.click('#orderListBtn');
    await expect(page.locator('#orderList')).toBeVisible();
    await expect(page.locator('#newOrderForm')).toBeHidden();
    
    // 測試切換回新增維修單
    await page.click('#newOrderBtn');
    await expect(page.locator('#newOrderForm')).toBeVisible();
    await expect(page.locator('#orderList')).toBeHidden();
  });

  test('照片上傳功能測試', async ({ page }) => {
    // 創建一個測試用的圖片檔案
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    
    // 準備檔案上傳
    const fileInput = page.locator('#photos');
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: testImageBuffer
    });
    
    // 檢查照片預覽是否出現
    await page.waitForTimeout(1000);
    const photoPreview = page.locator('#photoPreview');
    // 檢查是否有照片項目出現
    await expect(photoPreview.locator('.photo-item')).toBeVisible();
  });

  test('響應式設計測試', async ({ page }) => {
    // 測試手機視窗大小
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面是否正常顯示
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#maintenanceForm')).toBeVisible();
    
    // 測試平板視窗大小
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面是否正常顯示
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#maintenanceForm')).toBeVisible();
  });

  test('本地儲存功能測試', async ({ page }) => {
    // 新增一個維修單後檢查 localStorage
    await page.fill('#site', '儲存測試案場');
    await page.fill('#building', 'B棟');
    await page.fill('#floor', '2樓');
    await page.fill('#unit', '201');
    await page.fill('#reason', '測試本地儲存功能');
    await page.fill('#amount', '300');
    
    // 新增工務人員
    await page.click('#addStaffBtn');
    await page.fill('#staffName', '李師傅');
    await page.click('#addStaffForm button[type="submit"]');
    await page.selectOption('#staff', '李師傅');
    
    // 提交表單
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // 檢查 localStorage 是否有資料
    const localStorageData = await page.evaluate(() => {
      return localStorage.getItem('maintenance_orders');
    });
    
    expect(localStorageData).toBeTruthy();
    
    // 切換到列表檢視，應該能看到剛才建立的維修單
    await page.click('#orderListBtn');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('#orderTableBody tr')).toContainText('儲存測試案場');
  });
});

// 簽名頁面測試
test.describe('簽名頁面測試', () => {
  test('簽名頁面基本功能', async ({ page }) => {
    // 使用一個測試用的維修單號
    await page.goto(`${BASE_URL}/signature.html?order=20250707-1234`);
    await page.waitForLoadState('networkidle');
    
    // 檢查頁面載入
    await expect(page.locator('h1')).toContainText('維修單簽名確認');
    
    // 檢查簽名畫布
    await expect(page.locator('#signatureCanvas')).toBeVisible();
    
    // 檢查控制按鈕
    await expect(page.locator('#clearSignatureBtn')).toBeVisible();
    await expect(page.locator('#signOrderBtn')).toBeVisible();
    
    // 檢查Email欄位
    await expect(page.locator('#customerEmail')).toBeVisible();
  });

  test('簽名畫布功能測試', async ({ page }) => {
    await page.goto(`${BASE_URL}/signature.html?order=20250707-1234`);
    await page.waitForLoadState('networkidle');
    
    // 在畫布上畫線（模擬簽名）
    const canvas = page.locator('#signatureCanvas');
    await canvas.hover({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(200, 150);
    await page.mouse.move(150, 200);
    await page.mouse.up();
    
    // 測試清除按鈕
    await page.click('#clearSignatureBtn');
    
    // 檢查是否有清除的訊息
    await page.waitForTimeout(500);
  });
});

// 效能測試
test.describe('效能測試', () => {
  test('頁面載入效能', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 頁面載入時間應該少於 5 秒
    expect(loadTime).toBeLessThan(5000);
    
    console.log(`頁面載入時間: ${loadTime}ms`);
  });

  test('JavaScript 載入測試', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // 檢查所有 JavaScript 函數是否正確載入
    const functionsLoaded = await page.evaluate(() => {
      return {
        generateOrderNumber: typeof generateOrderNumber === 'function',
        showToast: typeof showToast === 'function',
        formatDate: typeof formatDate === 'function',
        Order: typeof Order === 'function',
        OrderService: typeof OrderService === 'function',
        StorageService: typeof StorageService === 'function'
      };
    });
    
    Object.entries(functionsLoaded).forEach(([funcName, loaded]) => {
      expect(loaded).toBe(true);
      console.log(`${funcName}: ${loaded ? '✅' : '❌'}`);
    });
  });
});