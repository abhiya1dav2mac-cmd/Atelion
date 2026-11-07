import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  PENCIL_CURSOR_STYLE,
  MULTI_STROKE_GRACE_MS,
  computeFreehandBounds,
  drawSmoothStroke,
  renderFreehandStrokesToCanvas,
  extractDomTextInBounds,
} from '../services/circleSearchEngine';
import { X } from './WorkspaceIcons';

/**
 * ==============================================================================
 * HOME / WORKSPACE FREEHAND PENCIL OVERLAY (FreehandCircleOverlay.jsx)
 * - Immediate ✏️ Freehand Pencil on activation (PENCIL_CURSOR_STYLE)
 * - No circle required: underline, line, bracket, diagram, circuit, chemical ring,
 *   or handwritten math structure -> ~650ms multi-stroke grace -> Direct AI Result!
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
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    const allStrokes = activeStrokeRef.current
      ? [...strokesRef.current, activeStrokeRef.current]
      : strokesRef.current;

    if (allStrokes.length === 0) return;

    // Soft outer glow + crisp blue pencil ink
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.lineWidth = 9;
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

    // 1. Extract underlying DOM text, <input>/<textarea> blocks & KaTeX equations
    const extractedText = extractDomTextInBounds(captureBounds, 'main');
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

    if (onCompleteCapture) {
      onCompleteCapture({
        queryText: extractedText,
        imageBase64: rendered?.dataUrl || null,
        gestureType: captureBounds.gestureType || 'freehand-structure',
        bounds: captureBounds,
        source: 'home',
      });
    }
  }, [onCompleteCapture]);

  // Resize canvas to full viewport & handle Escape key
  useEffect(() => {
    if (!isOpen) {
      clearGraceTimer();
      strokesRef.current = [];
      activeStrokeRef.current = null;
      setStrokeCount(0);
      return;
    }

    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
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
    clearGraceTimer();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    activeStrokeRef.current = [{ x: e.clientX, y: e.clientY }];
    redrawCanvas();
  };

  const handlePointerMove = (e) => {
    if (!activeStrokeRef.current) return;
    const pts = activeStrokeRef.current;
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(e.clientX - last.x, e.clientY - last.y) >= 2) {
      pts.push({ x: e.clientX, y: e.clientY });
      redrawCanvas();
    }
  };

  const handlePointerUp = () => {
    if (!activeStrokeRef.current) return;
    const finished = activeStrokeRef.current;
    activeStrokeRef.current = null;

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

  const handleClear = (e) => {
    e.stopPropagation();
    clearGraceTimer();
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokeCount(0);
    redrawCanvas();
  };

  return (
    <div
      className="fixed inset-0 z-50 select-none"
      style={{
        cursor: PENCIL_CURSOR_STYLE,
        backgroundColor: 'rgba(15, 23, 42, 0.06)',
        touchAction: 'none',
      }}
    >
      {/* Full-Viewport Freehand Pencil Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: PENCIL_CURSOR_STYLE, touchAction: 'none' }}
      />

      {/* Clean White Floating Instruction & Control Pill */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 bg-white/95 backdrop-blur-md border border-gray-200 rounded-full shadow-xl text-xs text-gray-800 font-sans"
        style={{ cursor: 'default' }}
      >
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
          <span>✏️</span>
          <span>Freehand Pencil</span>
        </span>

        <span className="text-gray-600 hidden sm:inline">
          {isWaitingGrace
            ? '⚡ Multi-stroke ready — releasing to AI...'
            : 'Underline, bracket, sketch math, circuit or chemical ring — auto-searches on release!'}
        </span>

        {strokeCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium cursor-pointer transition-colors"
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
