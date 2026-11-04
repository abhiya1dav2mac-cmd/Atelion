/**
 * ==============================================================================
 * ATELION INTERACTIVE WHITEBOARD & VISUAL CANVAS
 * Freehand sketch, Highlighter, Sticky Notes & PNG Export
 * ==============================================================================
 */

class AtelionWhiteboard {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.isDrawing = false;
    this.currentTool = 'pen'; // 'pen', 'highlighter', 'eraser'
    this.currentColor = '#38BDF8'; // Neon Cyan
    this.lineWidth = 3;
    this.lastX = 0;
    this.lastY = 0;

    this.resizeCanvas();
    this.setupListeners();
    window.whiteboardInstance = this;
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 800;
    this.canvas.height = 460;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  setupListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // Touch support for tablets & iPads
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.canvas.dispatchEvent(mouseEvent);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.canvas.dispatchEvent(mouseEvent);
    });
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
  }

  getCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  startDrawing(e) {
    this.isDrawing = true;
    const { x, y } = this.getCoords(e);
    this.lastX = x;
    this.lastY = y;
  }

  draw(e) {
    if (!this.isDrawing) return;
    const { x, y } = this.getCoords(e);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);

    if (this.currentTool === 'eraser') {
      this.ctx.strokeStyle = '#020617'; // Canvas background color
      this.ctx.lineWidth = 24;
      this.ctx.globalAlpha = 1.0;
    } else if (this.currentTool === 'highlighter') {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = 18;
      this.ctx.globalAlpha = 0.35;
    } else {
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.globalAlpha = 1.0;
    }

    this.ctx.stroke();

    // Broadcast stroke to peers via WebRTC / Local Broadcast (0 server load)
    if (window.p2pSync) {
      window.p2pSync.broadcast('WHITEBOARD_STROKE', {
        lastX: this.lastX,
        lastY: this.lastY,
        x,
        y,
        tool: this.currentTool,
        color: this.currentColor,
        lineWidth: this.lineWidth,
      });
    }

    this.lastX = x;
    this.lastY = y;
  }

  drawRemoteStroke(stroke) {
    if (!this.ctx || !stroke) return;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(stroke.lastX, stroke.lastY);
    this.ctx.lineTo(stroke.x, stroke.y);

    if (stroke.tool === 'eraser') {
      this.ctx.strokeStyle = '#020617';
      this.ctx.lineWidth = 24;
      this.ctx.globalAlpha = 1.0;
    } else if (stroke.tool === 'highlighter') {
      this.ctx.strokeStyle = stroke.color || '#38BDF8';
      this.ctx.lineWidth = 18;
      this.ctx.globalAlpha = 0.35;
    } else {
      this.ctx.strokeStyle = stroke.color || '#38BDF8';
      this.ctx.lineWidth = stroke.lineWidth || 3;
      this.ctx.globalAlpha = 1.0;
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      // Register coalesced snapshot locally in IndexedDB & sync engine
      if (window.syncEngine && this.canvas) {
        window.syncEngine.registerEdit(
          'active_whiteboard',
          'Collaborative Whiteboard',
          this.canvas.toDataURL('image/webp', 0.5),
          'whiteboard'
        );
      }
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    document.querySelectorAll('.wb-tool-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
  }

  setColor(color) {
    this.currentColor = color;
    document.querySelectorAll('.wb-color-dot').forEach((dot) => {
      dot.classList.toggle('active', dot.dataset.color === color);
    });
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (window.p2pSync) {
      window.p2pSync.broadcast('WHITEBOARD_CLEAR', {});
    }
    if (window.syncEngine) {
      window.syncEngine.registerEdit(
        'active_whiteboard',
        'Collaborative Whiteboard',
        '',
        'whiteboard'
      );
    }
    showToast('Whiteboard cleared', 'info');
  }

  exportImage() {
    const link = document.createElement('a');
    link.download = `atelion-whiteboard-${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
    showToast('Whiteboard exported as PNG!', 'success');
  }

  addStickyNote(text = 'Idea / Task') {
    const container = document.getElementById('whiteboardContainer');
    if (!container) return;

    const sticky = document.createElement('div');
    sticky.className = 'wb-sticky-note';
    sticky.style.left = `${60 + Math.random() * 200}px`;
    sticky.style.top = `${60 + Math.random() * 150}px`;
    sticky.innerHTML = `
      <div class="sticky-header">
        <span>📌 Note</span>
        <button type="button" class="btn-close-sticky" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      <textarea rows="3" placeholder="Type thoughts...">${text}</textarea>
    `;

    // Make Draggable
    let isDraggingSticky = false;
    let startX, startY;

    sticky.querySelector('.sticky-header').addEventListener('mousedown', (e) => {
      isDraggingSticky = true;
      startX = e.clientX - sticky.offsetLeft;
      startY = e.clientY - sticky.offsetTop;
      sticky.style.zIndex = '100';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDraggingSticky) return;
      sticky.style.left = `${e.clientX - startX}px`;
      sticky.style.top = `${e.clientY - startY}px`;
    });

    window.addEventListener('mouseup', () => {
      isDraggingSticky = false;
    });

    container.appendChild(sticky);
    showToast('Sticky Note added to Whiteboard!', 'success');
  }
}

window.AtelionWhiteboard = AtelionWhiteboard;

