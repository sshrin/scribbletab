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
    const iconSize = 18;
    const miniIconSize = 12;
    
    // SVG Icons
    const penIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
    const highlighterIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>`;
    const rectangleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/></svg>`;
    const circleIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`;
    const arrowIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
    const textIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`;
    const undoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`;
    const redoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg>`;
    const clearIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>`;
    const closeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    const minimizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="${miniIconSize}" height="${miniIconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

    this.toolbar = document.createElement('div');
    this.toolbar.id = 'web-annotator-toolbar';
    this.toolbar.innerHTML = `
      <div class="wa-toolbar-header">
        <div class="wa-toolbar-title">ScribbleTab</div>
        <div class="wa-toolbar-controls">
          <button class="wa-mini-btn" id="wa-minimize" title="Hide Toolbar (Ctrl+H)">${minimizeIcon}</button>
        </div>
      </div>
      
      <div class="wa-toolbar-row">
        <button class="wa-tool-btn active" data-tool="pen" title="Pen">${penIcon}</button>
        <button class="wa-tool-btn" data-tool="highlighter" title="Highlighter">${highlighterIcon}</button>
        <button class="wa-tool-btn" data-tool="rectangle" title="Rectangle">${rectangleIcon}</button>
        <button class="wa-tool-btn" data-tool="circle" title="Circle">${circleIcon}</button>
        <button class="wa-tool-btn" data-tool="arrow" title="Arrow">${arrowIcon}</button>
        <button class="wa-tool-btn" data-tool="text" title="Text">${textIcon}</button>
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
          <button class="wa-tool-btn" id="wa-undo" title="Undo (Ctrl+Z)" disabled>${undoIcon}</button>
          <button class="wa-tool-btn" id="wa-redo" title="Redo (Ctrl+Y)" disabled>${redoIcon}</button>
          <button class="wa-tool-btn" id="wa-clear" title="Clear All">${clearIcon}</button>
        </div>
      </div>
      
      <div class="wa-control-group">
        <button class="wa-tool-btn" id="wa-close" title="Close" style="width: 100%; background: #ea4335; color: white;">${closeIconSvg}</button>
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
    // Tool selection - using the working approach from your version
    this.toolbar.addEventListener('click', (e) => {
      // Find the button element (in case we clicked on SVG inside)
      let button = e.target;
      while (button && !button.hasAttribute('data-tool')) {
        button = button.parentElement;
        if (button === this.toolbar) break; // Prevent infinite loop
      }
      
      if (button && button.hasAttribute('data-tool')) {
        this.setTool(button.getAttribute('data-tool'));
        this.updateToolButtons();
      }
    });

    // Color picker
    const colorPicker = this.toolbar.querySelector('.wa-color-picker');
    colorPicker.addEventListener('change', (e) => {
      this.currentColor = e.target.value;
    });

    // Size slider
    const sizeSlider = this.toolbar.querySelector('.wa-slider');
    const sizeDisplay = this.toolbar.querySelector('#wa-size-display');
    sizeSlider.addEventListener('input', (e) => {
      this.currentSize = parseInt(e.target.value);
      sizeDisplay.textContent = this.currentSize;
    });

    // Control buttons - use event delegation like in your working version
    this.toolbar.addEventListener('click', (e) => {
      // Find the actual button element
      let button = e.target;
      while (button && !button.id) {
        button = button.parentElement;
        if (button === this.toolbar) break;
      }

      if (button.id === 'wa-minimize') {
        this.hideToolbar();
      } else if (button.id === 'wa-undo') {
        this.undo();
      } else if (button.id === 'wa-redo') {
        this.redo();
      } else if (button.id === 'wa-clear') {
        this.clear();
      } else if (button.id === 'wa-close') {
        this.toggle();
      }
    });

    // Toolbar dragging - only on header
    const toolbarHeader = this.toolbar.querySelector('.wa-toolbar-header');
    toolbarHeader.addEventListener('mousedown', (e) => {
      // Only drag if clicking on the header itself, not buttons
      if (e.target === toolbarHeader || e.target.classList.contains('wa-toolbar-title')) {
        this.startDragging(e);
      }
    });

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