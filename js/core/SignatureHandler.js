// Digital signature capture handler

class SignatureHandler {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.signature = null;
        this.isEmpty = true;
        
        this.init();
    }

    /**
     * Initialize signature handler
     */
    init() {
        this.canvas = document.getElementById('signatureCanvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.bindEvents();
    }

    /**
     * Setup canvas properties
     */
    setupCanvas() {
        // Set canvas size
        this.resizeCanvas();
        
        // Set drawing properties
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Set background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const scale = window.devicePixelRatio || 1;
        
        // Set display size
        this.canvas.style.width = '100%';
        this.canvas.style.height = '200px';
        
        // Set actual size in memory
        this.canvas.width = rect.width * scale;
        this.canvas.height = 200 * scale;
        
        // Scale the context to match device pixel ratio
        this.ctx.scale(scale, scale);
        
        // Redraw background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Bind mouse and touch events
     */
    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
        
        // Clear button
        const clearBtn = document.getElementById('clearSignatureBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSignature());
        }
        
        // Sign button
        const signBtn = document.getElementById('signOrderBtn');
        if (signBtn) {
            signBtn.addEventListener('click', () => this.handleSignOrder());
        }
    }

    /**
     * Get mouse/touch position relative to canvas
     * @param {Event} e 
     * @returns {Object}
     */
    getPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Start drawing
     * @param {Event} e 
     */
    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getPosition(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // Begin path
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
    }

    /**
     * Draw on canvas
     * @param {Event} e 
     */
    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getPosition(e);
        
        // Draw line
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        // Update last position
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // Mark as not empty
        this.isEmpty = false;
    }

    /**
     * Stop drawing
     */
    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.ctx.beginPath();
        
        // Save signature data
        this.signature = this.canvas.toDataURL('image/png');
    }

    /**
     * Clear signature
     */
    clearSignature() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset state
        this.signature = null;
        this.isEmpty = true;
        
        showToast('已清除簽名', 'success');
    }

    /**
     * Get signature data
     * @returns {string|null}
     */
    getSignature() {
        if (this.isEmpty) return null;
        
        return this.canvas.toDataURL('image/png');
    }

    /**
     * Check if signature is empty
     * @returns {boolean}
     */
    isSignatureEmpty() {
        return this.isEmpty;
    }

    /**
     * Validate signature
     * @returns {Object}
     */
    validateSignature() {
        const errors = [];
        
        if (this.isEmpty) {
            errors.push('請先簽名');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Handle sign order button click
     */
    async handleSignOrder() {
        try {
            const validation = this.validateSignature();
            if (!validation.isValid) {
                showToast(validation.errors.join(', '), 'error');
                return;
            }
            
            // Get order number from URL
            const orderNumber = getUrlParameter('order');
            if (!orderNumber) {
                showToast('找不到維修單編號', 'error');
                return;
            }
            
            // Get email
            const emailInput = document.getElementById('customerEmail');
            const email = emailInput ? emailInput.value.trim() : '';
            
            // Validate email if provided
            if (email && !isValidEmail(email)) {
                showToast('Email格式不正確', 'error');
                return;
            }
            
            // Get signature
            const signatureData = this.getSignature();
            
            // Sign the order
            const orderService = new OrderService();
            await orderService.signOrder(orderNumber, signatureData, email);
            
            showToast('簽名完成！', 'success');
            
            // Show confirmation and redirect
            setTimeout(() => {
                this.showSignatureConfirmation();
            }, 1500);
            
        } catch (error) {
            showToast(`簽名失敗: ${error.message}`, 'error');
        }
    }

    /**
     * Show signature confirmation
     */
    showSignatureConfirmation() {
        const confirmationHtml = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #059669; margin-bottom: 20px;">✅ 簽名完成</h2>
                <p style="font-size: 18px; margin-bottom: 20px;">感謝您的配合！</p>
                <p style="color: #6b7280;">維修單已完成簽名確認</p>
                <div style="margin-top: 30px;">
                    <button onclick="window.close()" class="btn btn-primary">關閉視窗</button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = confirmationHtml;
    }

    /**
     * Load existing signature
     * @param {string} signatureData 
     */
    loadSignature(signatureData) {
        if (!signatureData) return;
        
        const img = new Image();
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
            this.signature = signatureData;
            this.isEmpty = false;
        };
        img.src = signatureData;
    }

    /**
     * Export signature as image
     * @param {string} format 
     * @returns {string}
     */
    exportSignature(format = 'png') {
        if (this.isEmpty) return null;
        
        const mimeType = `image/${format}`;
        return this.canvas.toDataURL(mimeType);
    }

    /**
     * Set signature style
     * @param {Object} style 
     */
    setSignatureStyle(style = {}) {
        this.ctx.strokeStyle = style.color || '#000000';
        this.ctx.lineWidth = style.width || 2;
        this.ctx.lineCap = style.cap || 'round';
        this.ctx.lineJoin = style.join || 'round';
    }

    /**
     * Add text to signature
     * @param {string} text 
     * @param {number} x 
     * @param {number} y 
     */
    addText(text, x, y) {
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText(text, x, y);
        this.isEmpty = false;
    }

    /**
     * Get signature info
     * @returns {Object}
     */
    getSignatureInfo() {
        return {
            isEmpty: this.isEmpty,
            hasSignature: this.signature !== null,
            dataUrl: this.signature,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Create signature pad with custom options
     * @param {Object} options 
     */
    createSignaturePad(options = {}) {
        const defaultOptions = {
            backgroundColor: '#ffffff',
            penColor: '#000000',
            minWidth: 0.5,
            maxWidth: 2.5,
            velocityFilterWeight: 0.7,
            onBegin: () => {},
            onEnd: () => {}
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Apply configuration
        this.setSignatureStyle({
            color: config.penColor,
            width: config.maxWidth
        });
        
        // Set background
        this.ctx.fillStyle = config.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Convert signature to SVG
     * @returns {string}
     */
    toSVG() {
        // This is a simplified SVG export - in a real implementation,
        // you would need to track the drawing paths and convert them to SVG
        const svgString = `
            <svg width="${this.canvas.width}" height="${this.canvas.height}" xmlns="http://www.w3.org/2000/svg">
                <image href="${this.signature}" x="0" y="0" width="${this.canvas.width}" height="${this.canvas.height}"/>
            </svg>
        `;
        
        return svgString;
    }
}