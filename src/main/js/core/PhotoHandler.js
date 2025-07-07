// Photo upload and management handler

class PhotoHandler {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.maxPhotos = 10;
        this.photos = [];
        this.photoPreview = null;
        this.photoInput = null;
        
        this.init();
    }

    /**
     * Initialize photo handler
     */
    init() {
        this.photoInput = document.getElementById('photos');
        this.photoPreview = document.getElementById('photoPreview');
        
        if (this.photoInput) {
            this.photoInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
    }

    /**
     * Handle file selection
     * @param {Event} event 
     */
    async handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;
        
        // Check if adding these files would exceed the limit
        if (this.photos.length + files.length > this.maxPhotos) {
            showToast(`最多只能上傳 ${this.maxPhotos} 張照片`, 'error');
            return;
        }
        
        // Process each file
        for (const file of files) {
            try {
                await this.processFile(file);
            } catch (error) {
                showToast(`處理檔案 ${file.name} 時發生錯誤: ${error.message}`, 'error');
            }
        }
        
        // Clear input to allow re-selecting same files
        event.target.value = '';
        
        // Update preview
        this.updatePreview();
    }

    /**
     * Process individual file
     * @param {File} file 
     */
    async processFile(file) {
        // Validate file type
        if (!this.allowedTypes.includes(file.type)) {
            throw new Error('不支援的檔案格式，請上傳 JPG、PNG、GIF 或 WebP 格式的圖片');
        }
        
        // Validate file size
        if (file.size > this.maxFileSize) {
            throw new Error(`檔案大小不能超過 ${this.maxFileSize / (1024 * 1024)}MB`);
        }
        
        // Convert to base64
        const base64Data = await fileToBase64(file);
        
        // Create compressed version if needed
        const compressedData = await this.compressImage(base64Data, file.type);
        
        // Add to photos array
        const photoData = {
            id: Date.now() + Math.random(),
            originalName: file.name,
            type: file.type,
            size: file.size,
            data: compressedData,
            uploadedAt: new Date().toISOString()
        };
        
        this.photos.push(photoData);
        showToast(`成功上傳 ${file.name}`, 'success');
    }

    /**
     * Compress image if needed
     * @param {string} base64Data 
     * @param {string} mimeType 
     * @returns {Promise<string>}
     */
    async compressImage(base64Data, mimeType) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions (max 800px on longest side)
                const maxSize = 800;
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                const compressedData = canvas.toDataURL(mimeType, 0.8);
                
                resolve(compressedData);
            };
            img.src = base64Data;
        });
    }

    /**
     * Update photo preview
     */
    updatePreview() {
        if (!this.photoPreview) return;
        
        this.photoPreview.innerHTML = '';
        
        this.photos.forEach((photo) => {
            const photoItem = createElement('div', { className: 'photo-item' });
            
            const img = createElement('img', {
                src: photo.data,
                alt: photo.originalName,
                title: `${photo.originalName} (${this.formatFileSize(photo.size)})`
            });
            
            const removeBtn = createElement('button', {
                className: 'remove-photo',
                type: 'button',
                title: '移除照片',
                dataset: { photoId: photo.id }
            }, '×');
            
            removeBtn.addEventListener('click', () => this.removePhoto(photo.id));
            
            photoItem.appendChild(img);
            photoItem.appendChild(removeBtn);
            this.photoPreview.appendChild(photoItem);
        });
        
        // Add upload prompt if no photos
        if (this.photos.length === 0) {
            const promptDiv = createElement('div', {
                className: 'photo-item upload-prompt',
                style: 'border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;'
            }, '點擊上方按鈕上傳照片');
            
            this.photoPreview.appendChild(promptDiv);
        }
    }

    /**
     * Remove photo
     * @param {string} photoId 
     */
    removePhoto(photoId) {
        this.photos = this.photos.filter(photo => photo.id !== photoId);
        this.updatePreview();
        showToast('已移除照片', 'success');
    }

    /**
     * Get all photos
     * @returns {Array}
     */
    getPhotos() {
        return this.photos;
    }

    /**
     * Set photos (for editing existing order)
     * @param {Array} photos 
     */
    setPhotos(photos) {
        this.photos = photos || [];
        this.updatePreview();
    }

    /**
     * Clear all photos
     */
    clearPhotos() {
        this.photos = [];
        this.updatePreview();
    }

    /**
     * Format file size
     * @param {number} bytes 
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Validate photos
     * @returns {Object}
     */
    validatePhotos() {
        const errors = [];
        
        if (this.photos.length === 0) {
            errors.push('請至少上傳一張照片');
        }
        
        if (this.photos.length > this.maxPhotos) {
            errors.push(`照片數量不能超過 ${this.maxPhotos} 張`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get photos data for saving
     * @returns {Array}
     */
    getPhotosData() {
        return this.photos.map(photo => ({
            id: photo.id,
            originalName: photo.originalName,
            type: photo.type,
            size: photo.size,
            data: photo.data,
            uploadedAt: photo.uploadedAt
        }));
    }

    /**
     * Get total photos size
     * @returns {number}
     */
    getTotalSize() {
        return this.photos.reduce((total, photo) => total + photo.size, 0);
    }

    /**
     * Get photos count
     * @returns {number}
     */
    getPhotosCount() {
        return this.photos.length;
    }

    /**
     * Export photos as ZIP (mock implementation)
     * @param {string} orderNumber 
     */
    exportPhotos(orderNumber) {
        // In a real implementation, you would use a library like JSZip
        showToast('照片匯出功能需要後端支援', 'info');
        
        // For now, we'll download each photo individually
        this.photos.forEach((photo, index) => {
            const link = document.createElement('a');
            link.href = photo.data;
            link.download = `${orderNumber}_photo_${index + 1}_${photo.originalName}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    /**
     * Create thumbnail
     * @param {string} base64Data 
     * @param {number} size 
     * @returns {Promise<string>}
     */
    async createThumbnail(base64Data, size = 150) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = size;
                canvas.height = size;
                
                // Calculate crop area (center crop)
                const sourceSize = Math.min(img.width, img.height);
                const sourceX = (img.width - sourceSize) / 2;
                const sourceY = (img.height - sourceSize) / 2;
                
                ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
                
                const thumbnailData = canvas.toDataURL('image/jpeg', 0.8);
                resolve(thumbnailData);
            };
            img.src = base64Data;
        });
    }

    /**
     * Add photo from URL (for testing)
     * @param {string} url 
     * @param {string} filename 
     */
    async addPhotoFromUrl(url, filename = 'photo.jpg') {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            const file = new File([blob], filename, { type: blob.type });
            await this.processFile(file);
            this.updatePreview();
        } catch (error) {
            showToast(`無法載入照片: ${error.message}`, 'error');
        }
    }
}