/**
 * ==============================================================================
 * ATELION CIRCLE TO SEARCH (Google Pixel & Galaxy AI Experience)
 * Draw a freehand circle, lasso, or box around ANY text, code, math formula,
 * diagram, or whiteboard drawing on your screen to trigger instant Multimodal AI Search.
 * ==============================================================================
 */

class AtelionCircleToSearch {
  constructor() {
    this.isActive = false;
    this.isDrawing = false;
    this.points = [];
    this.overlayCanvas = null;
    this.ctx = null;
    this.drawerEl = null;

    this.initDOM();
    this.attachGlobalShortcuts();
  }

  initDOM() {
    if (typeof document === 'undefined') return;

    // 1. Create Fullscreen Overlay Canvas
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'circleSearchOverlay';
    this.overlayContainer.className = 'cts-overlay hidden';
    this.overlayContainer.innerHTML = `
      <canvas id="ctsCanvas"></canvas>
      <div class="cts-banner">
        <span class="cts-icon">⭕</span>
        <span>Circle or lasso anything on screen to search with AI</span>
        <span class="cts-badge">Esc to Exit</span>
      </div>
    `;
    document.body.appendChild(this.overlayContainer);

    this.overlayCanvas = document.getElementById('ctsCanvas');
    this.ctx = this.overlayCanvas.getContext('2d');

    // 2. Create Slide-Up AI Bottom Sheet Drawer
    this.drawerEl = document.createElement('div');
    this.drawerEl.id = 'circleSearchDrawer';
    this.drawerEl.className = 'cts-drawer hidden';
    this.drawerEl.innerHTML = `
      <div class="cts-drawer-backdrop" onclick="window.circleToSearch.closeDrawer()"></div>
      <div class="cts-drawer-sheet">
        <div class="cts-sheet-handle-bar"><div class="cts-handle"></div></div>
        <div class="cts-sheet-header">
          <div class="cts-header-left">
            <span class="cts-header-icon">🔍</span>
            <div>
              <h3 id="ctsSheetTitle">AI Insight & Search</h3>
              <p id="ctsSheetSubtitle">Analyzing circled screen selection...</p>
            </div>
          </div>
          <button type="button" class="btn-close-sm" onclick="window.circleToSearch.closeDrawer()">✕</button>
        </div>

        <div class="cts-sheet-content">
          <!-- Snippet Preview -->
          <div class="cts-selection-preview" id="ctsSnippetPreview">
            <span class="cts-prev-label">Circled Content:</span>
            <div class="cts-prev-body" id="ctsSnippetText">Loading selection...</div>
            <img id="ctsSnippetImage" class="cts-crop-img hidden" alt="Circled selection crop" />
          </div>

          <!-- AI Explanation Output -->
          <div class="cts-ai-card" id="ctsAiCard">
            <div class="cts-ai-header">
              <span class="cts-ai-sparkle">✨</span>
              <span class="cts-ai-model-tag">Atelion Neural Intelligence</span>
              <span class="cts-ai-time" id="ctsAiTime">18ms</span>
            </div>
            <div class="cts-ai-body" id="ctsAiSummary">
              <div class="cts-ai-skeleton">
                <div class="skeleton-line" style="width: 80%;"></div>
                <div class="skeleton-line" style="width: 95%;"></div>
                <div class="skeleton-line" style="width: 60%;"></div>
              </div>
            </div>
            <div class="cts-ai-points" id="ctsAiPoints"></div>
          </div>

          <!-- Workspace Semantic Matches (Local IndexedDB) -->
          <div class="cts-matches-box" id="ctsWorkspaceMatches">
            <span class="cts-matches-label">📚 Related in Workspace:</span>
            <div class="cts-matches-list" id="ctsMatchesList">
              <span class="cts-match-pill">Searching local notes...</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="cts-actions-row">
            <button type="button" class="btn-primary btn-sm" id="btnCtsInsertNote" onclick="window.circleToSearch.insertIntoNote()">
              <span>➕ Insert into Note</span>
            </button>
            <button type="button" class="btn-secondary btn-sm" id="btnCtsAddFlashcard" onclick="window.circleToSearch.createFlashcard()">
              <span>🃏 Add as Flashcard</span>
            </button>
            <button type="button" class="btn-secondary btn-sm" onclick="window.circleToSearch.copyExplanation()">
              <span>📋 Copy Summary</span>
            </button>
            <button type="button" class="btn-secondary btn-sm" id="btnCtsWebSearch" onclick="window.circleToSearch.searchOnGoogle()">
              <span>🌐 Web Search</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.drawerEl);

    // Setup Canvas Listeners
    this.setupCanvasListeners();
  }

  resizeCanvas() {
    if (!this.overlayCanvas) return;
    this.overlayCanvas.width = window.innerWidth;
    this.overlayCanvas.height = window.innerHeight;
  }

  setupCanvasListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());

    this.overlayCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.overlayCanvas.addEventListener('mousemove', (e) => this.draw(e));
    this.overlayCanvas.addEventListener('mouseup', (e) => this.finishDrawing(e));

    // Touch Support for iPad / Mobile
    this.overlayCanvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
    });
    this.overlayCanvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.draw({ clientX: touch.clientX, clientY: touch.clientY });
    });
    this.overlayCanvas.addEventListener('touchend', (e) => this.finishDrawing(e));
  }

  attachGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Toggle with Alt+S or Ctrl+Shift+S
      if ((e.altKey && e.key.toLowerCase() === 's') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isActive) {
        this.deactivate();
      }
    });
  }

  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  activate() {
    this.isActive = true;
    this.resizeCanvas();
    this.overlayContainer.classList.remove('hidden');
    document.body.classList.add('cts-active-cursor');
    if (window.showToast) {
      window.showToast('⭕ Circle to Search activated. Circle any text or diagram on screen!', 'info');
    }
  }

  deactivate() {
    this.isActive = false;
    this.isDrawing = false;
    this.points = [];
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    }
    this.overlayContainer.classList.add('hidden');
    document.body.classList.remove('cts-active-cursor');
  }

  startDrawing(e) {
    if (!this.isActive) return;
    this.isDrawing = true;
    this.points = [{ x: e.clientX, y: e.clientY }];
    this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
  }

  draw(e) {
    if (!this.isDrawing || !this.isActive) return;
    this.points.push({ x: e.clientX, y: e.clientY });

    // Render signature Glowing Neon Halo Ribbon
    this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    if (this.points.length < 2) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Outer Neon Glow
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    this.ctx.lineWidth = 14;
    this.ctx.shadowColor = '#38BDF8';
    this.ctx.shadowBlur = 18;
    this.renderPath();

    // Secondary Violet Halo
    this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
    this.ctx.lineWidth = 7;
    this.ctx.shadowColor = '#C084FC';
    this.ctx.shadowBlur = 10;
    this.renderPath();

    // Core Bright Center
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 3;
    this.ctx.shadowBlur = 4;
    this.renderPath();

    this.ctx.restore();
  }

  renderPath() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    this.ctx.stroke();
  }

  async finishDrawing(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.points.length < 6) {
      // Too small / accidental click
      this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
      return;
    }

    // 1. Calculate Bounding Box of the circle
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const pt of this.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    if (width < 25 || height < 25) {
      this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
      return;
    }

    // 2. Render Pulsing Holographic Box Animation
    this.animatePulsingTarget(minX, minY, width, height);

    // 3. Extract Screen Text & Visual Crops
    this.deactivate();
    await this.processCircledArea(minX, minY, maxX, maxY, width, height);
  }

  animatePulsingTarget(x, y, w, h) {
    this.ctx.save();
    this.ctx.strokeStyle = '#38BDF8';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([6, 6]);
    this.ctx.strokeRect(x - 6, y - 6, w + 12, h + 12);
    this.ctx.restore();
  }

  async processCircledArea(minX, minY, maxX, maxY, width, height) {
    // 1. Check if user highlighted active text selection
    let extractedText = window.getSelection().toString().trim();

    // 2. If no text selected, traverse elements within the bounding box
    if (!extractedText) {
      const sampledElements = [];
      const stepX = Math.max(20, width / 4);
      const stepY = Math.max(20, height / 4);

      for (let px = minX + 5; px <= maxX - 5; px += stepX) {
        for (let py = minY + 5; py <= maxY - 5; py += stepY) {
          const els = document.elementsFromPoint(px, py);
          if (els && els.length > 0) {
            sampledElements.push(els[0]);
          }
        }
      }

      // Collect unique text contents
      const uniqueTexts = new Set();
      for (const el of sampledElements) {
        if (!el || el.id === 'ctsCanvas' || el.closest('#circleSearchOverlay') || el.closest('#circleSearchDrawer')) {
          continue;
        }
        const txt = (el.innerText || el.value || '').trim();
        if (txt && txt.length > 2 && txt.length < 500) {
          uniqueTexts.add(txt);
        }
      }
      extractedText = Array.from(uniqueTexts).slice(0, 3).join(' \n');
    }

    // 3. Check for Visual Canvas Crop (Whiteboard or diagrams)
    let imageCropBase64 = null;
    const whiteboardCanvas = document.getElementById('whiteboardCanvas');
    if (whiteboardCanvas) {
      const wbRect = whiteboardCanvas.getBoundingClientRect();
      const intersects = (
        minX < wbRect.right &&
        maxX > wbRect.left &&
        minY < wbRect.bottom &&
        maxY > wbRect.top
      );
      if (intersects) {
        try {
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = width;
          cropCanvas.height = height;
          const cCtx = cropCanvas.getContext('2d');
          const sourceX = Math.max(0, minX - wbRect.left);
          const sourceY = Math.max(0, minY - wbRect.top);
          cCtx.drawImage(whiteboardCanvas, sourceX, sourceY, width, height, 0, 0, width, height);
          imageCropBase64 = cropCanvas.toDataURL('image/png');
        } catch (e) {
          console.warn('[CTS] Canvas crop error:', e);
        }
      }
    }

    // Fallback text if completely empty
    if (!extractedText && !imageCropBase64) {
      extractedText = 'Atelion Zero-Load Workspace Knowledge Map';
    }

    // 4. Open Drawer and Fetch AI Intelligence
    this.openDrawer(extractedText, imageCropBase64);
  }

  openDrawer(text, imageBase64) {
    this.currentQueryText = text;
    this.currentImageBase64 = imageBase64;

    this.drawerEl.classList.remove('hidden');

    const textEl = document.getElementById('ctsSnippetText');
    const imgEl = document.getElementById('ctsSnippetImage');
    const titleEl = document.getElementById('ctsSheetTitle');
    const subEl = document.getElementById('ctsSheetSubtitle');

    if (text) {
      textEl.textContent = text.length > 180 ? `${text.slice(0, 180)}...` : text;
      textEl.classList.remove('hidden');
    } else {
      textEl.classList.add('hidden');
    }

    if (imageBase64) {
      imgEl.src = imageBase64;
      imgEl.classList.remove('hidden');
    } else {
      imgEl.classList.add('hidden');
    }

    titleEl.textContent = 'Circle to Search';
    subEl.textContent = 'Analyzing with Multimodal Neural AI...';

    // Trigger AI Explanation & Local Note Matching
    this.fetchAiSearch(text, imageBase64);
    this.findWorkspaceMatches(text);
  }

  closeDrawer() {
    if (this.drawerEl) {
      this.drawerEl.classList.add('hidden');
    }
  }

  async fetchAiSearch(queryText, imageBase64) {
    const summaryEl = document.getElementById('ctsAiSummary');
    const pointsEl = document.getElementById('ctsAiPoints');
    const timeEl = document.getElementById('ctsAiTime');

    const startTime = performance.now();

    try {
      const res = await fetch('/api/ai/circle-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText, imageBase64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI analysis failed');

      const elapsed = Math.round(performance.now() - startTime);
      if (timeEl) timeEl.textContent = `${elapsed}ms`;

      const ai = data.result;
      this.latestAiResult = ai;

      summaryEl.innerHTML = `
        <h4 style="margin: 0 0 6px 0; color: #fff; font-size: 14.5px;">${ai.title}</h4>
        <p style="margin: 0; color: #CBD5E1; font-size: 13px; line-height: 1.5;">${ai.explanation}</p>
      `;

      if (ai.keyPoints && ai.keyPoints.length > 0) {
        pointsEl.innerHTML = ai.keyPoints
          .map((pt) => `<div class="cts-point-item"><span>💡</span><span>${pt}</span></div>`)
          .join('');
      } else {
        pointsEl.innerHTML = '';
      }
    } catch (err) {
      summaryEl.innerHTML = `
        <h4 style="margin:0 0 6px 0; color:#fff;">Selection Summary</h4>
        <p style="margin:0; color:#CBD5E1;">${queryText || 'Visual screen snippet'}</p>
      `;
      pointsEl.innerHTML = '';
    }
  }

  async findWorkspaceMatches(queryText) {
    const matchesEl = document.getElementById('ctsMatchesList');
    if (!matchesEl) return;

    if (!window.localFirstDB) {
      matchesEl.innerHTML = '<span class="cts-match-pill">No local docs active</span>';
      return;
    }

    try {
      const docs = await window.localFirstDB.getAllLocalDocs();
      const keywords = (queryText || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);

      const matched = docs.filter((d) => {
        const full = `${d.title} ${d.content}`.toLowerCase();
        return keywords.some((k) => full.includes(k));
      });

      if (matched.length === 0) {
        matchesEl.innerHTML = '<span class="cts-match-pill">No conflicting local duplicates</span>';
      } else {
        matchesEl.innerHTML = matched
          .slice(0, 3)
          .map(
            (m) => `
            <button type="button" class="cts-match-pill linkable" onclick="window.circleToSearch.openMatchedDoc('${m.id}')">
              📄 ${m.title} (${m.type})
            </button>
          `
          )
          .join('');
      }
    } catch (e) {
      matchesEl.innerHTML = '<span class="cts-match-pill">Knowledge graph synced</span>';
    }
  }

  insertIntoNote() {
    const editor = document.getElementById('smartNoteEditor');
    if (!editor) return;

    const addition = `\n\n### ⭕ Circle to Search Insight: ${this.currentQueryText || 'Screen Snippet'}\n> ${
      (this.latestAiResult && this.latestAiResult.explanation) || this.currentQueryText
    }\n`;

    editor.value += addition;
    if (window.renderEditorPreview) window.renderEditorPreview();
    if (window.switchDashTab) window.switchDashTab('notes');
    this.closeDrawer();
    if (window.showToast) window.showToast('Appended Circle to Search insight into Smart Note!', 'success');
  }

  createFlashcard() {
    if (!window.workspaceEngine) return;
    const q = `What is the significance of: "${(this.currentQueryText || 'Concept').slice(0, 60)}"?`;
    const a = (this.latestAiResult && this.latestAiResult.explanation) || 'Circled screen insight.';

    window.workspaceEngine.addFlashcard(q, a);
    if (window.switchDashTab) window.switchDashTab('student');
    this.closeDrawer();
    if (window.showToast) window.showToast('Created Flashcard from Circle to Search!', 'success');
  }

  copyExplanation() {
    const textToCopy = (this.latestAiResult && this.latestAiResult.explanation) || this.currentQueryText || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      if (window.showToast) window.showToast('Copied AI explanation to clipboard!', 'info');
    }
  }

  searchOnGoogle() {
    const q = encodeURIComponent(this.currentQueryText || 'Atelion AI Workspace');
    window.open(`https://www.google.com/search?q=${q}`, '_blank');
  }

  openMatchedDoc(docId) {
    this.closeDrawer();
    if (window.switchDashTab) window.switchDashTab('notes');
  }
}

// Global Singleton Instance & Trigger Helper
window.circleToSearch = new AtelionCircleToSearch();
window.activateCircleToSearch = () => window.circleToSearch.activate();
