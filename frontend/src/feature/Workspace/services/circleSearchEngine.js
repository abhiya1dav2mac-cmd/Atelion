/**
 * ==============================================================================
 * ATELION FREEHAND PENCIL CIRCLE SEARCH ENGINE (circleSearchEngine.js)
 * Shared Core Engine for:
 *   1. Home / Workspace Circle Search (FreehandCircleOverlay.jsx)
 *   2. Read PDF Circle Search (VirtualPdfReader.jsx — Continuous & Single Page)
 *   3. Inline Modal Pencil Pad (CircleSearchModal.jsx)
 *
 * Key Capabilities:
 *   - PENCIL_CURSOR_STYLE: Immediate ✏️ Pencil cursor on click
 *   - computeFreehandBounds: Bounding box + gesture classification for ANY shape
 *     (underline, line, bracket, diagram, circuit, chemical ring, handwritten math)
 *   - renderFreehandStrokesToCanvas: High-DPI stroke + underlying PDF/DOM composite
 *   - extractDomTextInBounds: Reads <input>, <textarea>, KaTeX LaTeX annotations,
 *     and text elements intersecting the drawn freehand bounds
 * ==============================================================================
 */

// Crisp SVG Pencil Cursor (hotspot at pencil tip: x=2, y=22) — Base64 encoded for universal Windows Chrome & Safari support
const PENCIL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17.5 2.5L21.5 6.5L8 20L2.5 21.5L4 16L17.5 2.5Z" fill="#2563EB" stroke="#FFFFFF" stroke-width="1.5" stroke-linejoin="round"/><path d="M15 5L19 9" stroke="#FFFFFF" stroke-width="1.4"/><path d="M2.5 21.5L5.5 20.7L3.3 18.5L2.5 21.5Z" fill="#0F172A"/></svg>`;

const PENCIL_BASE64 = typeof btoa !== 'undefined' ? btoa(PENCIL_SVG) : encodeURIComponent(PENCIL_SVG);

export const PENCIL_CURSOR_STYLE = `url('data:image/svg+xml;base64,${PENCIL_BASE64}') 2 22, url('data:image/svg+xml,${encodeURIComponent(PENCIL_SVG)}') 2 22, crosshair`;

export const MULTI_STROKE_GRACE_MS = 650;

/**
 * Safari-safe API URL resolver:
 * Uses VITE_API_URL if configured, otherwise same-origin `/api/...` (proxied by Vite/reverse-proxy)
 * so macOS/iOS Safari never blocks `http://localhost:5000` via Mixed Content / ITP / LAN IP mismatch.
 */
export function resolveCircleApiUrl(path = '/api/ai/circle-search') {
  const envBase = (import.meta.env?.VITE_API_URL || '').trim().replace(/\/$/, '');
  if (envBase) return `${envBase}${path}`;
  return path;
}

/**
 * Safari-safe API fetch with automatic LAN/port-5000 fallback:
 * 1. First tries same-origin `/api/...` (works on macOS Safari, iPhone/iPad Safari over Wi-Fi, & HTTPS via proxy)
 * 2. If not proxied (e.g. static preview on HTTP), falls back to `http://<current-hostname>:5000`
 */
export async function fetchCircleApi(path, fetchOptions = {}) {
  const primaryUrl = resolveCircleApiUrl(path);
  try {
    const res = await fetch(primaryUrl, fetchOptions);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return res;
    }
    // If Vite proxy isn't active and we're on HTTP, try current hostname:5000
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'http:' &&
      !primaryUrl.startsWith('http')
    ) {
      const host = window.location.hostname || 'localhost';
      return await fetch(`http://${host}:5000${path}`, fetchOptions);
    }
    return res;
  } catch (err) {
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'http:' &&
      !primaryUrl.startsWith('http')
    ) {
      const host = window.location.hostname || 'localhost';
      return await fetch(`http://${host}:5000${path}`, fetchOptions);
    }
    throw err;
  }
}

/**
 * Safari WebKit safe pointer capture:
 * Safari throws DOMException (NotFoundError / InvalidStateError) on touch/Apple Pencil pointerIds
 * if setPointerCapture is not wrapped in try/catch.
 */
export function safeSetPointerCapture(target, pointerId) {
  if (!target || pointerId === undefined || pointerId === null) return;
  try {
    if (typeof target.setPointerCapture === 'function') {
      target.setPointerCapture(pointerId);
    }
  } catch {
    // Ignore Safari WebKit synthetic/touch pointerId exception
  }
}

/**
 * Safe pointer release helper
 */
export function safeReleasePointerCapture(target, pointerId) {
  if (!target || pointerId === undefined || pointerId === null) return;
  try {
    if (typeof target.releasePointerCapture === 'function' && target.hasPointerCapture?.(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  } catch {
    // Ignore release errors
  }
}

/**
 * Cap devicePixelRatio at 2 so iOS/iPadOS Safari never exceeds WebKit's 16MP canvas memory ceiling.
 */
export function getSafeCanvasDpr() {
  if (typeof window === 'undefined') return 1;
  return Math.min(2, window.devicePixelRatio || 1);
}

/**
 * Normalize strokes input into an array of point arrays: [[{x, y}, ...], ...]
 */
export function normalizeStrokes(strokes) {
  if (!Array.isArray(strokes) || strokes.length === 0) return [];
  // Single flat array of points [{x, y}, ...]
  if (strokes[0] && typeof strokes[0].x === 'number' && typeof strokes[0].y === 'number') {
    return [strokes];
  }
  return strokes
    .map((s) => (Array.isArray(s) ? s : Array.isArray(s?.points) ? s.points : []))
    .filter((pts) => pts.length > 0);
}

/**
 * Compute intelligent bounding box & gesture type for ANY freehand pencil structure:
 * - Underline / straight line -> expands upward to capture underlined text/formula
 * - Bracket -> expands horizontally to capture bracketed lines
 * - Circle / Box / Diagram / Circuit / Chemical Ring / Handwritten Math -> padded bounds
 */
export function computeFreehandBounds(strokes, options = {}) {
  const {
    padding = 18,
    minWidth = 64,
    minHeight = 44,
    expandUnderlineUpward = true,
    maxWidth = Infinity,
    maxHeight = Infinity,
  } = options;

  const normalized = normalizeStrokes(strokes);
  if (normalized.length === 0) return null;

  let rawMinX = Infinity;
  let rawMinY = Infinity;
  let rawMaxX = -Infinity;
  let rawMaxY = -Infinity;
  let pointCount = 0;

  for (const pts of normalized) {
    for (const p of pts) {
      if (typeof p.x !== 'number' || typeof p.y !== 'number') continue;
      if (p.x < rawMinX) rawMinX = p.x;
      if (p.y < rawMinY) rawMinY = p.y;
      if (p.x > rawMaxX) rawMaxX = p.x;
      if (p.y > rawMaxY) rawMaxY = p.y;
      pointCount++;
    }
  }

  if (pointCount < 2 || !Number.isFinite(rawMinX)) return null;

  const rawWidth = Math.max(1, rawMaxX - rawMinX);
  const rawHeight = Math.max(1, rawMaxY - rawMinY);

  // Classify freehand gesture shape
  let gestureType = 'freehand-structure';
  if (normalized.length === 1 && rawWidth > 36 && rawHeight < Math.max(22, rawWidth * 0.22)) {
    gestureType = 'underline';
  } else if (normalized.length === 1 && rawHeight > 36 && rawWidth < Math.max(24, rawHeight * 0.3)) {
    gestureType = 'bracket';
  } else if (normalized.length === 1 && pointCount >= 12) {
    const first = normalized[0][0];
    const last = normalized[0][normalized[0].length - 1];
    const closeDist = Math.hypot(last.x - first.x, last.y - first.y);
    if (closeDist < Math.max(rawWidth, rawHeight) * 0.42) {
      gestureType = 'enclosure';
    }
  }

  let minX = rawMinX - padding;
  let maxX = rawMaxX + padding;
  let minY = rawMinY - padding;
  let maxY = rawMaxY + padding;

  // If user drew an underline, expand upward so the underlined line/equation is captured!
  if (gestureType === 'underline' && expandUnderlineUpward) {
    minY = rawMinY - 48;
    maxY = rawMaxY + 16;
  } else if (gestureType === 'bracket') {
    maxX = rawMaxX + 220;
    minX = rawMinX - 24;
  }

  // Enforce minimum dimensions centered on stroke bounds
  const curW = maxX - minX;
  if (curW < minWidth) {
    const extra = (minWidth - curW) / 2;
    minX -= extra;
    maxX += extra;
  }
  const curH = maxY - minY;
  if (curH < minHeight) {
    const extra = (minHeight - curH) / 2;
    minY -= extra;
    maxY += extra;
  }

  minX = Math.max(0, minX);
  minY = Math.max(0, minY);
  if (Number.isFinite(maxWidth)) maxX = Math.min(maxWidth, maxX);
  if (Number.isFinite(maxHeight)) maxY = Math.min(maxHeight, maxY);

  return {
    minX,
    minY,
    maxX,
    maxY,
    x: minX,
    y: minY,
    width: Math.max(16, maxX - minX),
    height: Math.max(16, maxY - minY),
    rawMinX,
    rawMinY,
    rawMaxX,
    rawMaxY,
    rawWidth,
    rawHeight,
    pointCount,
    strokeCount: normalized.length,
    gestureType,
  };
}

/**
 * Hardware Palm & Non-Primary Touch Rejection for Apple Pencil & Stylus
 * Discards palm resting on iPad / tablet screens (contact radius > 28px)
 */
export function isStylusPalmTouch(e, isPenActive = false) {
  if (!e) return false;
  if (e.pointerType === 'touch') {
    if (isPenActive) return true;
    // Palm detection heuristic: large contact area or non-primary touch
    if ((e.width && e.width > 28) || (e.height && e.height > 28)) return true;
  }
  return false;
}

/**
 * Draw smooth quadratic curve with pressure-sensitive ink tapering for stylus/Apple Pencil
 */
export function drawSmoothStroke(ctx, points, offsetX = 0, offsetY = 0, scale = 1, baseLineWidth = null) {
  if (!points || points.length === 0) return;

  const hasPressure = points.some((p) => p.pressure && Math.abs(p.pressure - 0.5) > 0.08);

  if (!hasPressure || points.length < 3) {
    ctx.beginPath();
    if (points.length === 1) {
      const p = points[0];
      const r = 2.2 * (p.pressure ? 0.6 + 0.8 * p.pressure : 1);
      ctx.arc((p.x - offsetX) * scale, (p.y - offsetY) * scale, r, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.moveTo((points[0].x - offsetX) * scale, (points[0].y - offsetY) * scale);
    for (let i = 1; i < points.length - 1; i++) {
      const midX = ((points[i].x + points[i + 1].x) / 2 - offsetX) * scale;
      const midY = ((points[i].y + points[i + 1].y) / 2 - offsetY) * scale;
      ctx.quadraticCurveTo(
        (points[i].x - offsetX) * scale,
        (points[i].y - offsetY) * scale,
        midX,
        midY
      );
    }
    const last = points[points.length - 1];
    ctx.lineTo((last.x - offsetX) * scale, (last.y - offsetY) * scale);
    ctx.stroke();
    return;
  }

  // Pressure-sensitive dynamic stroke tapering (Native zero-load canvas)
  const nominalWidth = baseLineWidth || ctx.lineWidth || 3.2;
  const originalWidth = ctx.lineWidth;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const avgPressure = ((p1.pressure || 0.5) + (p2.pressure || 0.5)) / 2;
    const dynamicWidth = nominalWidth * (0.35 + 1.15 * avgPressure);

    ctx.beginPath();
    ctx.lineWidth = dynamicWidth;
    ctx.moveTo((p1.x - offsetX) * scale, (p1.y - offsetY) * scale);
    ctx.lineTo((p2.x - offsetX) * scale, (p2.y - offsetY) * scale);
    ctx.stroke();
  }

  ctx.lineWidth = originalWidth;
}

/**
 * Render freehand strokes (and optional underlying PDF/DOM canvas crop + text)
 * into a clean offscreen canvas and export PNG data URL for Vision AI.
 */
export function renderFreehandStrokesToCanvas(strokes, bounds, options = {}) {
  const {
    sourceCanvas = null,
    sourceScaleX = 1,
    sourceScaleY = 1,
    strokeColor = '#1D4ED8',
    strokeWidth = 3,
    backgroundColor = '#FFFFFF',
    overlayTextLines = [],
    drawStrokesOnCrop = true,
  } = options;

  const normalized = normalizeStrokes(strokes);
  const b = bounds || computeFreehandBounds(normalized, { expandUnderlineUpward: false });
  if (!b) return null;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const outWidth = Math.min(900, Math.max(120, Math.round(b.width)));
  const outHeight = Math.min(700, Math.max(80, Math.round(b.height)));
  const renderScaleX = outWidth / b.width;
  const renderScaleY = outHeight / b.height;
  const uniformScale = Math.min(renderScaleX, renderScaleY);

  const offscreen = document.createElement('canvas');
  offscreen.width = Math.round(outWidth * dpr);
  offscreen.height = Math.round(outHeight * dpr);

  const ctx = offscreen.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);

  // 1. Clean white background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, outWidth, outHeight);

  // 2. If cropping from a PDF/diagram <canvas>, composite exact pixels
  if (sourceCanvas) {
    try {
      const sx = Math.max(0, b.minX * sourceScaleX);
      const sy = Math.max(0, b.minY * sourceScaleY);
      const sw = Math.min(sourceCanvas.width - sx, b.width * sourceScaleX);
      const sh = Math.min(sourceCanvas.height - sy, b.height * sourceScaleY);
      if (sw > 2 && sh > 2) {
        ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, outWidth, outHeight);
      }
    } catch (e) {
      // Ignore cross-origin taint if any
    }
  } else if (Array.isArray(overlayTextLines) && overlayTextLines.length > 0) {
    // Render subtle underlying text context onto crop for Vision + thumbnail clarity
    ctx.fillStyle = '#111827';
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    let ty = 22;
    for (const line of overlayTextLines.slice(0, 5)) {
      ctx.fillText(String(line).slice(0, 85), 12, ty);
      ty += 19;
    }
  }

  // 3. Render user's freehand pencil strokes smoothly
  if (drawStrokesOnCrop && normalized.length > 0) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    for (const pts of normalized) {
      drawSmoothStroke(ctx, pts, b.minX, b.minY, uniformScale);
    }
    ctx.restore();
  }

  let dataUrl = '';
  try {
    dataUrl = offscreen.toDataURL('image/png', 0.92);
  } catch (e) {
    dataUrl = '';
  }

  return {
    canvas: offscreen,
    dataUrl,
    width: outWidth,
    height: outHeight,
    gestureType: b.gestureType,
    bounds: b,
  };
}

/**
 * Extract visible DOM text, <input>/<textarea> block content, and KaTeX LaTeX formulas
 * intersecting viewport bounds { minX, minY, maxX, maxY }
 */
export function extractDomTextInBounds(bounds, rootSelector = 'main') {
  if (!bounds || typeof document === 'undefined') return '';

  const root = document.querySelector(rootSelector) || document.body;
  const collected = [];
  const seen = new Set();

  const intersects = (rect) => {
    if (!rect || rect.width <= 0 || rect.height <= 0) return false;
    return !(
      rect.right < bounds.minX ||
      rect.left > bounds.maxX ||
      rect.bottom < bounds.minY ||
      rect.top > bounds.maxY
    );
  };

  // 1. Capture exact KaTeX LaTeX formulas first
  const katexBlocks = root.querySelectorAll('.katex');
  katexBlocks.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (intersects(rect)) {
      const annotation = el.querySelector('annotation[encoding="application/x-tex"]');
      const tex = annotation?.textContent?.trim();
      if (tex && !seen.has(tex)) {
        seen.add(tex);
        collected.push(`$$${tex}$$`);
      }
    }
  });

  // 2. Capture DocumentEditor <input> and <textarea> block values
  const inputs = root.querySelectorAll('input[type="text"], textarea');
  inputs.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (intersects(rect)) {
      const val = (el.value || '').trim();
      if (val && !seen.has(val)) {
        seen.add(val);
        collected.push(val);
      }
    }
  });

  // 3. Capture standard headings, table cells, callouts, and text paragraphs
  const textEls = root.querySelectorAll('h1, h2, h3, h4, p, li, td, th, code, [data-pdf-text]');
  textEls.forEach((el) => {
    if (el.closest('.katex')) return;
    const rect = el.getBoundingClientRect();
    if (intersects(rect)) {
      const txt = (el.innerText || el.textContent || '').trim();
      if (txt && txt.length > 1 && txt.length < 400 && !seen.has(txt)) {
        seen.add(txt);
        collected.push(txt);
      }
    }
  });

  return collected.slice(0, 8).join('\n').trim();
}
