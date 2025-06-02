// Web Annotator Content Script
class WebAnnotator {
    constructor() {
      this.isActive = false;
      this.currentTool = 'pen';
      this.currentColor = '#ff0000';
      this.currentSize = 3;
      this.isDrawing = false;
      this.lastX = 0;
      this.lastY = 0;
      this.canvas = null;
      this.ctx = null;
      this.overlay = null;
      this.toolbar = null;
      this.annotations = [];
      this.textInput = null;
      this.isDragging = false;
      this.dragOffset = { x: 0, y: 0 };
      this.toolbarPosition = { top: '20px', right: '20px', left: 'auto' };
      this.toolbarVisible = true;
      this.states = [];
      this.currentStateIndex = -1;
      this.tempCanvas = null;
      this.tempCtx = null;
      
      this.init();
    }
  
    init() {
      this.createOverlay();
      this.createCanvas();
      this.createTempCanvas();
      this.createToolbar();
      this.createTextInput();
      this.bindEvents();
    }
  
    createOverlay() {
      this.overlay = document.createElement('div');
      this.overlay.id = 'web-annotator-overlay';
      document.body.appendChild(this.overlay);
    }
  
    createCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'web-annotator-canvas';
      this.canvas.width = window.innerWidth;
      this.canvas.height = document.documentElement.scrollHeight;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.overlay.appendChild(this.canvas);
    }
  
    createTempCanvas() {
      this.tempCanvas = document.createElement('canvas');
      this.tempCanvas.width = window.innerWidth;
      this.tempCanvas.height = document.documentElement.scrollHeight;
      this.tempCtx = this.tempCanvas.getContext('2d');
      this.tempCtx.lineCap = 'round';
      this.tempCtx.lineJoin = 'round';
    }
  
    createToolbar() {
      this.toolbar = document.createElement('div');
      this.toolbar.id = 'web-annotator-toolbar';
      this.toolbar.innerHTML = `
        <div class="wa-toolbar-header">
          <div class="wa-toolbar-title">Web Annotator</div>
          <div class="wa-toolbar-controls">
            <button class="wa-mini-btn" id="wa-minimize" title="Hide Toolbar (Ctrl+H)">−</button>
          </div>
        </div>
        
        <div class="wa-toolbar-row">
          <button class="wa-tool-btn active" data-tool="pen" title="Pen">✎</button>
          <button class="wa-tool-btn" data-tool="highlighter" title="Highlighter">▥</button>
          <button class="wa-tool-btn" data-tool="rectangle" title="Rectangle">☐</button>
          <button class="wa-tool-btn" data-tool="circle" title="Circle">○</button>
          <button class="wa-tool-btn" data-tool="arrow" title="Arrow">→</button>
          <button class="wa-tool-btn" data-tool="text" title="Text">A</button>
        </div>
        
        <div class="wa-control-group">
          <div class="wa-toolbar-row">
            <span class="wa-label">Color:</span>
            <input type="color" class="wa-color-picker" value="#ff0000">
          </div>
        </div>
        
        <div class="wa-control-group">
          <div class="wa-toolbar-row">
            <span class="wa-label">Size:</span>
            <input type="range" class="wa-slider" min="1" max="20" value="3">
            <span id="wa-size-display">3</span>
          </div>
        </div>
        
        <div class="wa-control-group">
          <div class="wa-toolbar-row">
            <button class="wa-tool-btn" id="wa-undo" title="Undo (Ctrl+Z)" disabled>↶</button>
            <button class="wa-tool-btn" id="wa-redo" title="Redo (Ctrl+Y)" disabled>↷</button>
            <button class="wa-tool-btn" id="wa-clear" title="Clear All">✗</button>
          </div>
        </div>
        
        <div class="wa-control-group">
          <button class="wa-tool-btn" id="wa-close" title="Close" style="width: 100%; background: #ea4335; color: white;">✕ Close</button>
        </div>
      `;
      this.overlay.appendChild(this.toolbar);
    }
  
    createTextInput() {
      this.textInput = document.createElement('textarea');
      this.textInput.id = 'web-annotator-text-input';
      this.textInput.placeholder = 'Enter text and press Enter...';
      document.body.appendChild(this.textInput);
    }
  
    bindEvents() {
      // Simplified event handling to prevent conflicts
      
      // Tool buttons - direct event listeners
      const toolButtons = this.toolbar.querySelectorAll('[data-tool]');
      toolButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setTool(e.target.getAttribute('data-tool'));
          this.updateToolButtons();
        });
      });
  
      // Control buttons - direct event listeners
      const undoBtn = this.toolbar.querySelector('#wa-undo');
      const redoBtn = this.toolbar.querySelector('#wa-redo');
      const clearBtn = this.toolbar.querySelector('#wa-clear');
      const closeBtn = this.toolbar.querySelector('#wa-close');
      const minimizeBtn = this.toolbar.querySelector('#wa-minimize');
  
      if (undoBtn) undoBtn.addEventListener('click', (e) => { e.stopPropagation(); this.undo(); });
      if (redoBtn) redoBtn.addEventListener('click', (e) => { e.stopPropagation(); this.redo(); });
      if (clearBtn) clearBtn.addEventListener('click', (e) => { e.stopPropagation(); this.clear(); });
      if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });
      if (minimizeBtn) minimizeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.hideToolbar(); });
  
      // Color picker
      const colorPicker = this.toolbar.querySelector('.wa-color-picker');
      if (colorPicker) {
        colorPicker.addEventListener('change', (e) => {
          this.currentColor = e.target.value;
        });
      }
  
      // Size slider
      const sizeSlider = this.toolbar.querySelector('.wa-slider');
      const sizeDisplay = this.toolbar.querySelector('#wa-size-display');
      if (sizeSlider && sizeDisplay) {
        sizeSlider.addEventListener('input', (e) => {
          this.currentSize = parseInt(e.target.value);
          sizeDisplay.textContent = this.currentSize;
        });
      }
  
      // Toolbar dragging - only on header
      const toolbarHeader = this.toolbar.querySelector('.wa-toolbar-header');
      if (toolbarHeader) {
        toolbarHeader.addEventListener('mousedown', (e) => {
          // Only drag if clicking on the header itself, not buttons
          if (e.target === toolbarHeader || e.target.classList.contains('wa-toolbar-title')) {
            this.startDragging(e);
          }
        });
      }
  
      document.addEventListener('mousemove', (e) => this.drag(e));
      document.addEventListener('mouseup', () => this.stopDragging());
  
      // Canvas drawing events
      this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
      this.canvas.addEventListener('mousemove', (e) => this.draw(e));
      this.canvas.addEventListener('mouseup', (e) => this.stopDrawing(e));
      this.canvas.addEventListener('mouseout', () => this.stopDrawing());
  
      // Text input events
      this.textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.finishTextInput();
        } else if (e.key === 'Escape') {
          this.cancelTextInput();
        }
      });
  
      this.textInput.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
  
      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (!this.isActive) return;
        
        if (e.key === 'Escape') {
          if (this.textInput.style.display === 'block') {
            this.cancelTextInput();
          } else {
            this.toggle();
          }
        } else if (e.ctrlKey && e.key === 'z') {
          e.preventDefault();
          this.undo();
        } else if (e.ctrlKey && e.key === 'y') {
          e.preventDefault();
          this.redo();
        } else if (e.key === 'h' && e.ctrlKey) {
          e.preventDefault();
          this.toggleToolbar();
        }
      });
  
      // Window resize
      window.addEventListener('resize', () => {
        if (this.isActive) {
          this.resizeCanvas();
        }
      });
  
      // Scroll synchronization
      window.addEventListener('scroll', () => {
        if (this.isActive) {
          this.updateCanvasPosition();
        }
      });
    }
  
    startDragging(e) {
      this.isDragging = true;
      const rect = this.toolbar.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
      this.toolbar.style.cursor = 'grabbing';
      e.preventDefault();
    }
  
    drag(e) {
      if (!this.isDragging) return;
      
      const x = e.clientX - this.dragOffset.x;
      const y = e.clientY - this.dragOffset.y;
      
      const maxX = window.innerWidth - this.toolbar.offsetWidth;
      const maxY = window.innerHeight - this.toolbar.offsetHeight;
      
      const finalX = Math.max(0, Math.min(x, maxX));
      const finalY = Math.max(0, Math.min(y, maxY));
      
      this.toolbar.style.left = finalX + 'px';
      this.toolbar.style.top = finalY + 'px';
      this.toolbar.style.right = 'auto';
      
      this.toolbarPosition = {
        left: finalX + 'px',
        top: finalY + 'px',
        right: 'auto'
      };
    }
  
    stopDragging() {
      this.isDragging = false;
      this.toolbar.style.cursor = 'move';
    }
  
    hideToolbar() {
      const rect = this.toolbar.getBoundingClientRect();
      this.toolbarPosition = {
        left: rect.left + 'px',
        top: rect.top + 'px',
        right: 'auto'
      };
      
      this.toolbar.style.display = 'none';
      this.toolbarVisible = false;
    }
  
    showToolbar() {
      this.toolbar.style.left = this.toolbarPosition.left;
      this.toolbar.style.top = this.toolbarPosition.top;
      this.toolbar.style.right = this.toolbarPosition.right;
      this.toolbar.style.display = 'flex';
      this.toolbarVisible = true;
    }
  
    toggleToolbar() {
      if (this.toolbarVisible) {
        this.hideToolbar();
      } else {
        this.showToolbar();
      }
    }
  
    setTool(tool) {
      this.currentTool = tool;
      this.canvas.style.cursor = tool === 'text' ? 'text' : 'crosshair';
    }
  
    updateToolButtons() {
      this.toolbar.querySelectorAll('.wa-tool-btn[data-tool]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tool') === this.currentTool);
      });
    }
  
    startDrawing(e) {
      if (this.currentTool === 'text') {
        this.startTextInput(e);
        return;
      }
  
      this.isDrawing = true;
      const rect = this.canvas.getBoundingClientRect();
      this.lastX = e.clientX - rect.left;
      this.lastY = e.clientY - rect.top;
  
      this.ctx.beginPath();
      this.setupDrawingStyle();
  
      if (['rectangle', 'circle', 'arrow'].includes(this.currentTool)) {
        this.tempCtx.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);
        this.tempCtx.drawImage(this.canvas, 0, 0);
      }
    }
  
    draw(e) {
      if (!this.isDrawing || this.currentTool === 'text') return;
  
      const rect = this.canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
  
      if (this.currentTool === 'pen' || this.currentTool === 'highlighter') {
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();
        this.lastX = currentX;
        this.lastY = currentY;
      } else if (['rectangle', 'circle', 'arrow'].includes(this.currentTool)) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.tempCanvas, 0, 0);
        this.drawShape(this.lastX, this.lastY, currentX, currentY);
      }
    }
  
    stopDrawing(e) {
      if (!this.isDrawing) return;
      this.saveState();
      this.isDrawing = false;
      this.ctx.beginPath();
    }
  
    setupDrawingStyle() {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.currentSize;
      
      if (this.currentTool === 'highlighter') {
        this.ctx.globalAlpha = 0.3;
        this.ctx.lineWidth = this.currentSize * 3;
      } else {
        this.ctx.globalAlpha = 1;
      }
    }
  
    drawShape(startX, startY, endX, endY) {
      this.ctx.beginPath();
      this.setupDrawingStyle();
  
      if (this.currentTool === 'rectangle') {
        const width = endX - startX;
        const height = endY - startY;
        this.ctx.strokeRect(startX, startY, width, height);
      } else if (this.currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
      } else if (this.currentTool === 'arrow') {
        this.drawArrow(startX, startY, endX, endY);
      }
    }
  
    drawArrow(startX, startY, endX, endY) {
      const headLength = 20;
      const headWidth = 8;
      const angle = Math.atan2(endY - startY, endX - startX);
  
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
  
      this.ctx.beginPath();
      this.ctx.moveTo(endX, endY);
      this.ctx.lineTo(
        endX - headLength * Math.cos(angle) + headWidth * Math.sin(angle),
        endY - headLength * Math.sin(angle) - headWidth * Math.cos(angle)
      );
      this.ctx.lineTo(
        endX - headLength * Math.cos(angle) - headWidth * Math.sin(angle),
        endY - headLength * Math.sin(angle) + headWidth * Math.cos(angle)
      );
      this.ctx.closePath();
      this.ctx.fillStyle = this.currentColor;
      this.ctx.fill();
    }
  
    startTextInput(e) {
      const x = e.clientX;
      const y = e.clientY;
  
      this.textInput.style.left = `${x}px`;
      this.textInput.style.top = `${y}px`;
      this.textInput.style.display = 'block';
      this.textInput.value = '';
      
      setTimeout(() => {
        this.textInput.focus();
      }, 10);
    }
  
    finishTextInput() {
      const text = this.textInput.value.trim();
      
      if (text) {
        const x = parseInt(this.textInput.style.left);
        const y = parseInt(this.textInput.style.top);
        
        this.addTextAnnotation(text, x, y);
        this.saveState();
      }
      
      this.cancelTextInput();
    }
  
    cancelTextInput() {
      this.textInput.style.display = 'none';
      this.textInput.value = '';
    }
  
    addTextAnnotation(text, x, y) {
      const textEl = document.createElement('div');
      textEl.className = 'wa-text-annotation';
      textEl.textContent = text;
      textEl.style.left = `${x}px`;
      textEl.style.top = `${y}px`;
      textEl.style.color = this.currentColor;
      textEl.style.fontSize = `${this.currentSize + 10}px`;
      
      document.body.appendChild(textEl);
      
      this.annotations.push({
        type: 'text',
        element: textEl,
        text: text,
        x: x,
        y: y,
        color: this.currentColor,
        size: this.currentSize + 10
      });
    }
  
    saveState() {
      if (this.currentStateIndex < this.states.length - 1) {
        this.states = this.states.slice(0, this.currentStateIndex + 1);
      }
      
      const canvasImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const textState = JSON.parse(JSON.stringify(this.annotations.map(annotation => ({
        type: annotation.type,
        text: annotation.text,
        x: annotation.x,
        y: annotation.y,
        color: annotation.color,
        size: annotation.size
      }))));
      
      this.states.push({
        canvas: canvasImageData,
        text: textState
      });
      
      this.currentStateIndex = this.states.length - 1;
      
      if (this.states.length > 50) {
        this.states.shift();
        this.currentStateIndex--;
      }
      
      this.updateUndoRedoButtons();
    }
  
    undo() {
      if (this.currentStateIndex > 0) {
        this.currentStateIndex--;
        this.restoreState(this.currentStateIndex);
        this.updateUndoRedoButtons();
      }
    }
  
    redo() {
      if (this.currentStateIndex < this.states.length - 1) {
        this.currentStateIndex++;
        this.restoreState(this.currentStateIndex);
        this.updateUndoRedoButtons();
      }
    }
  
    restoreState(index) {
      const state = this.states[index];
      
      this.ctx.putImageData(state.canvas, 0, 0);
      
      this.annotations.forEach(annotation => {
        if (annotation.element && annotation.element.parentNode) {
          annotation.element.remove();
        }
      });
      
      this.annotations = [];
      state.text.forEach(textData => {
        const textEl = document.createElement('div');
        textEl.className = 'wa-text-annotation';
        textEl.textContent = textData.text;
        textEl.style.left = `${textData.x}px`;
        textEl.style.top = `${textData.y}px`;
        textEl.style.color = textData.color;
        textEl.style.fontSize = `${textData.size}px`;
        
        document.body.appendChild(textEl);
        
        this.annotations.push({
          type: 'text',
          element: textEl,
          text: textData.text,
          x: textData.x,
          y: textData.y,
          color: textData.color,
          size: textData.size
        });
      });
    }
  
    updateUndoRedoButtons() {
      const undoBtn = document.getElementById('wa-undo');
      const redoBtn = document.getElementById('wa-redo');
      
      if (undoBtn) undoBtn.disabled = this.currentStateIndex <= 0;
      if (redoBtn) redoBtn.disabled = this.currentStateIndex >= this.states.length - 1;
    }
  
    clear() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.annotations.forEach(annotation => {
        if (annotation.element && annotation.element.parentNode) {
          annotation.element.remove();
        }
      });
      this.annotations = [];
      this.states = [];
      this.currentStateIndex = -1;
      this.saveState();
    }
  
    cleanupTextAnnotations() {
      this.annotations.forEach(annotation => {
        if (annotation.type === 'text' && annotation.element && annotation.element.parentNode) {
          annotation.element.remove();
        }
      });
      
      const orphanedTexts = document.querySelectorAll('.wa-text-annotation');
      orphanedTexts.forEach(el => el.remove());
      
      this.annotations = this.annotations.filter(annotation => annotation.type !== 'text');
    }
  
    resizeCanvas() {
      const oldImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.width = window.innerWidth;
      this.canvas.height = document.documentElement.scrollHeight;
      this.tempCanvas.width = window.innerWidth;
      this.tempCanvas.height = document.documentElement.scrollHeight;
      this.ctx.putImageData(oldImageData, 0, 0);
    }
  
    updateCanvasPosition() {
      this.canvas.style.top = `${window.scrollY}px`;
    }
  
    toggle() {
      this.isActive = !this.isActive;
      this.overlay.style.display = this.isActive ? 'block' : 'none';
      
      if (this.isActive) {
        this.resizeCanvas();
        this.saveState();
        this.showToolbar();
      } else {
        this.cancelTextInput();
        this.textInput.style.display = 'none';
        this.cleanupTextAnnotations();
      }
      
      return this.isActive;
    }
  
    getStatus() {
      return this.isActive;
    }
  }
  
  // Initialize the annotator
  if (!window.webAnnotator) {
    window.webAnnotator = new WebAnnotator();
  }
  
  // Message listener for popup communication
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'toggle':
        const active = window.webAnnotator.toggle();
        sendResponse({ active });
        break;
      case 'clear':
        window.webAnnotator.clear();
        sendResponse({ success: true });
        break;
      case 'getStatus':
        sendResponse({ active: window.webAnnotator.getStatus() });
        break;
    }
  });