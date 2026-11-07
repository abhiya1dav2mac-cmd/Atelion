import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  PENCIL_CURSOR_STYLE,
  MULTI_STROKE_GRACE_MS,
  computeFreehandBounds,
  drawSmoothStroke,
  renderFreehandStrokesToCanvas,
  extractDomTextInBounds,
  safeSetPointerCapture,
  safeReleasePointerCapture,
  getSafeCanvasDpr,
} from '../services/circleSearchEngine';
import { X } from './WorkspaceIcons';

/**
 * ==============================================================================
 * HOME / WORKSPACE FREEHAND PENCIL OVERLAY (FreehandCircleOverlay.jsx)
 * - Immediate ✏️ Freehand Pencil on activation (PENCIL_CURSOR_STYLE)
 * - Live floating ✏️ Pencil Follower at cursor position for 100% visual feedback
 * - 1-Tap Toggle: 🖥️ Screen Draw (over notes/math) vs 📝 Clean Pad (blank board)
 * - No circle required: underline, line, bracket, diagram, circuit, or math structure
 *   -> ~650ms multi-stroke grace -> Direct AI Result!
 * ==============================================================================
 */
export default function FreehandCircleOverlay({
  isOpen,
  onCancel,
  onCompleteCapture,
}) {
  const canvasRef = useRef(null);
  const strokesRef = useRef([]);
  const activeStrokeRef = useRef(null);
  const graceTimerRef = useRef(null);

  const [strokeCount, setStrokeCount] = useState(0);
  const [isWaitingGrace, setIsWaitingGrace] = useState(false);
  const [canvasMode, setCanvasMode] = useState('screen'); // 'screen' | 'pad'
  const [pointerPos, setPointerPos] = useState({ x: -100, y: -100, visible: false, isDrawing: false });

  const clearGraceTimer = () => {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    setIsWaitingGrace(false);
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = getSafeCanvasDpr();
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Reset transform to safe DPR before clearing and drawing
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const allStrokes = activeStrokeRef.current
      ? [...strokesRef.current, activeStrokeRef.current]
      : strokesRef.current;

    if (allStrokes.length === 0) return;

    // Soft outer glow + crisp blue pencil ink
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.28)';
    ctx.fillStyle = 'rgba(59, 130, 246, 0.28)';
    ctx.lineWidth = 8;
    for (const pts of allStrokes) {
      drawSmoothStroke(ctx, pts, 0, 0, 1);
    }

    ctx.strokeStyle = '#2563EB';
    ctx.fillStyle = '#2563EB';
    ctx.lineWidth = 3.2;
    for (const pts of allStrokes) {
      drawSmoothStroke(ctx, pts, 0, 0, 1);
    }

    // Subtle live bounding preview box
    const bounds = computeFreehandBounds(allStrokes, {
      padding: 14,
      expandUnderlineUpward: true,
      maxWidth: window.innerWidth,
      maxHeight: window.innerHeight,
    });
    if (bounds) {
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.55)';
      ctx.fillStyle = 'rgba(59, 130, 246, 0.04)';
      ctx.fillRect(bounds.minX, bounds.minY, bounds.width, bounds.height);
      ctx.strokeRect(bounds.minX, bounds.minY, bounds.width, bounds.height);
    }

    ctx.restore();
  }, []);

  const finalizeFreehandSearch = useCallback(() => {
    clearGraceTimer();
    const strokes = strokesRef.current;
    if (!strokes || strokes.length === 0) return;

    const captureBounds = computeFreehandBounds(strokes, {
      padding: 18,
      expandUnderlineUpward: true,
      maxWidth: window.innerWidth,
      maxHeight: window.innerHeight,
    });

    if (!captureBounds) return;

    // 1. Extract underlying DOM text, <input>/<textarea> blocks & KaTeX equations (if in Screen mode)
    const isScreenMode = canvasMode === 'screen';
    const extractedText = isScreenMode ? extractDomTextInBounds(captureBounds, 'main') : '';
    const textLines = extractedText
      ? extractedText.split('\n').filter(Boolean)
      : [];

    // 2. Render strokes + context onto clean white canvas for Vision OCR + thumbnail
    const strokeVisualBounds = computeFreehandBounds(strokes, {
      padding: 22,
      minWidth: 160,
      minHeight: 90,
      expandUnderlineUpward: textLines.length > 0,
      maxWidth: window.innerWidth,
      maxHeight: window.innerHeight,
    });

    const rendered = renderFreehandStrokesToCanvas(strokes, strokeVisualBounds, {
      strokeColor: '#1D4ED8',
      strokeWidth: 3.2,
      backgroundColor: '#FFFFFF',
      overlayTextLines: textLines,
      drawStrokesOnCrop: true,
    });

    // Reset internal strokes before handing off to modal
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokeCount(0);
    setPointerPos((prev) => ({ ...prev, isDrawing: false }));

    if (onCompleteCapture) {
      onCompleteCapture({
        queryText: extractedText,
        imageBase64: rendered?.dataUrl || null,
        gestureType: isScreenMode
          ? captureBounds.gestureType || 'freehand-structure'
          : 'freehand-pad-sketch',
        bounds: captureBounds,
        source: isScreenMode ? 'home' : 'home-pad',
      });
    }
  }, [onCompleteCapture, canvasMode]);

  // Resize canvas to full viewport & handle Escape key
  useEffect(() => {
    if (!isOpen) {
      clearGraceTimer();
      strokesRef.current = [];
      activeStrokeRef.current = null;
      setStrokeCount(0);
      setPointerPos({ x: -100, y: -100, visible: false, isDrawing: false });
      return;
    }

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = getSafeCanvasDpr();
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearGraceTimer();
        onCancel?.();
      } else if (e.key === 'Enter' && strokesRef.current.length > 0) {
        finalizeFreehandSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('keydown', handleKeyDown);
      clearGraceTimer();
    };
  }, [isOpen, onCancel, redrawCanvas, finalizeFreehandSearch]);

  if (!isOpen) return null;

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.cancelable) e.preventDefault();
    clearGraceTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    activeStrokeRef.current = [{ x, y }];
    safeSetPointerCapture(e.currentTarget, e.pointerId);
    setPointerPos({ x: e.clientX, y: e.clientY, visible: true, isDrawing: true });
    redrawCanvas();
  };

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPointerPos({
      x: e.clientX,
      y: e.clientY,
      visible: true,
      isDrawing: Boolean(activeStrokeRef.current),
    });

    if (!activeStrokeRef.current) return;
    if (e.cancelable) e.preventDefault();
    const pts = activeStrokeRef.current;
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(x - last.x, y - last.y) >= 1.5) {
      pts.push({ x, y });
      redrawCanvas();
    }
  };

  const handlePointerUp = (e) => {
    safeReleasePointerCapture(e?.currentTarget || canvasRef.current, e?.pointerId);
    setPointerPos((prev) => ({ ...prev, isDrawing: false }));

    if (!activeStrokeRef.current) return;
    const finished = activeStrokeRef.current;
    activeStrokeRef.current = null;

    // If single point (quick click/tap on formula), synthesize a small vector so it triggers search
    if (finished.length === 1) {
      finished.push({ x: finished[0].x + 3, y: finished[0].y + 3 });
    }

    if (finished.length >= 2 || strokesRef.current.length > 0) {
      strokesRef.current = [...strokesRef.current, finished];
      setStrokeCount(strokesRef.current.length);
      redrawCanvas();

      // Start ~650ms multi-stroke grace timer -> automatic AI result!
      setIsWaitingGrace(true);
      graceTimerRef.current = setTimeout(() => {
        finalizeFreehandSearch();
      }, MULTI_STROKE_GRACE_MS);
    }
  };

  const handlePointerCancel = (e) => {
    safeReleasePointerCapture(e?.currentTarget || canvasRef.current, e?.pointerId);
    setPointerPos((prev) => ({ ...prev, isDrawing: false }));

    if (activeStrokeRef.current && activeStrokeRef.current.length >= 2) {
      strokesRef.current = [...strokesRef.current, activeStrokeRef.current];
      setStrokeCount(strokesRef.current.length);
      setIsWaitingGrace(true);
      graceTimerRef.current = setTimeout(() => {
        finalizeFreehandSearch();
      }, MULTI_STROKE_GRACE_MS);
    }
    activeStrokeRef.current = null;
    redrawCanvas();
  };

  const handleClear = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    clearGraceTimer();
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokeCount(0);
    redrawCanvas();
  };

  return (
    <div
      className="fixed inset-0 z-50 select-none transition-colors duration-150"
      style={{
        cursor: PENCIL_CURSOR_STYLE,
        backgroundColor:
          canvasMode === 'pad'
            ? 'rgba(255, 255, 255, 0.98)'
            : 'rgba(15, 23, 42, 0.06)',
        backgroundImage:
          canvasMode === 'pad'
            ? 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)'
            : 'none',
        backgroundSize: '24px 24px',
        touchAction: 'none',
      }}
      onPointerLeave={() => setPointerPos((prev) => ({ ...prev, visible: false }))}
    >
      {/* Full-Viewport Freehand Pencil Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        className="absolute inset-0 w-full h-full"
        style={{
          cursor: PENCIL_CURSOR_STYLE,
          touchAction: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      />

      {/* Live Floating ✏️ Pencil Follower Badge right at cursor position */}
      {pointerPos.visible && (
        <div
          className="fixed pointer-events-none z-50 flex items-center gap-1 select-none transition-transform duration-75"
          style={{
            left: `${pointerPos.x}px`,
            top: `${pointerPos.y}px`,
            transform: 'translate(-3px, -24px)',
          }}
        >
          <span
            className={`text-xl transition-transform drop-shadow-md ${
              pointerPos.isDrawing ? 'scale-125 rotate-12' : 'scale-100 -rotate-12'
            }`}
          >
            ✏️
          </span>
          {pointerPos.isDrawing && (
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shadow-xs" />
          )}
        </div>
      )}

      {/* Clean White Floating Instruction & Control Pill */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md border border-gray-200 rounded-full shadow-xl text-xs text-gray-800 font-sans"
        style={{ cursor: 'default' }}
      >
        {/* 1-Tap Clean Pad vs Screen Draw Toggle */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-full border border-gray-200 text-[11px]">
          <button
            type="button"
            onClick={() => {
              handleClear();
              setCanvasMode('screen');
            }}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
              canvasMode === 'screen'
                ? 'bg-white text-blue-700 shadow-2xs border border-gray-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Draw directly over screen text, formulas & note blocks"
          >
            <span>🖥️</span>
            <span>Screen Draw</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleClear();
              setCanvasMode('pad');
            }}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
              canvasMode === 'pad'
                ? 'bg-white text-blue-700 shadow-2xs border border-gray-200'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Pure white clean drawing pad for freehand formulas & diagrams"
          >
            <span>📝</span>
            <span>Clean Pad</span>
          </button>
        </div>

        <span className="text-gray-500 hidden md:inline text-[11px]">
          {isWaitingGrace
            ? '⚡ Releasing to AI...'
            : canvasMode === 'screen'
            ? 'Underline, bracket, or circle any note — auto-solves on release!'
            : 'Sketch any math formula, circuit or chemical reaction!'}
        </span>

        {strokeCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium cursor-pointer transition-colors text-[11px]"
          >
            Clear
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            clearGraceTimer();
            onCancel?.();
          }}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
          title="Exit Freehand Pencil (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
