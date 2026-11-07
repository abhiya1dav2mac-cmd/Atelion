import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  PENCIL_CURSOR_STYLE,
  MULTI_STROKE_GRACE_MS,
  computeFreehandBounds,
  drawSmoothStroke,
  renderFreehandStrokesToCanvas,
  fetchCircleApi,
  safeSetPointerCapture,
  getSafeCanvasDpr,
} from '../services/circleSearchEngine';
import RichMathMarkdown from './RichMathMarkdown';
import { X, ArrowUp, Sparkles, Plus } from './WorkspaceIcons';

const QUICK_FOLLOWUP_CHIPS = [
  {
    id: 'hinglish',
    label: '💡 Hinglish me samjhao',
    prompt: 'Is result ko bilkul aasaan Hinglish me real-life example aur formula ke saath samjhao.',
  },
  {
    id: 'exam',
    label: '📝 Short exam points',
    prompt: 'Give crisp, high-scoring short exam revision bullet points with key formulas for this concept.',
  },
  {
    id: 'numerical',
    label: '🧮 Numerical example',
    prompt: 'Give a step-by-step solved numerical example with Given, Formula, Substitution, and Final Answer.',
  },
  {
    id: 'viva',
    label: '❓ Viva questions',
    prompt: 'Give top 4 Viva-Voce questions with short, crisp answers based on this concept.',
  },
];

/**
 * Local resilient fallback if backend server is unreachable
 */
function buildClientOfflineFallback(text, isFollowUp = false) {
  const clean = (text || 'Selected Structure').trim();
  if (isFollowUp && clean.toLowerCase().includes('hinglish')) {
    return (
      `### 💡 Hinglish Explanation\n\n` +
      `- **Simple Idea:** Yeh concept batata hai ki system ke parameters ek-doosre ke saath kaise relate karte hain.\n` +
      `- **Key Formula:** $$E = h\\nu = \\frac{hc}{\\lambda}$$\n` +
      `- **Exam Tip:** Hamesha SI units aur boundary conditions dhyan me rakhein.`
    );
  }
  return (
    `### ✨ AI Analysis: ${clean.slice(0, 60)}\n\n` +
    `- **Core Relationship:** Quantitative structure analyzed with real-time KaTeX math support.\n` +
    `- **Mathematical Expression:** $$\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}$$\n` +
    `- Ask any related follow-up or any other question below!`
  );
}

/**
 * ==============================================================================
 * UNIFIED CIRCLE SEARCH RESULT & MULTI-TURN CHAT MODAL (CircleSearchModal.jsx)
 * Shared by BOTH Home Circle Search & Read PDF Circle Search
 * Pure Clean White Notion Theme + KaTeX + Quick Chips + Built-in ✏️ Pencil Pad
 * ==============================================================================
 */
export default function CircleSearchModal({
  isOpen,
  captureData,
  onClose,
  onInsertToPage,
  user,
}) {
  const [initialLoading, setInitialLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [initialContextSummary, setInitialContextSummary] = useState('');
  const [aiEngineBadge, setAiEngineBadge] = useState('Atelion AI Cascade');
  const [thread, setThread] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Built-in ✏️ Pencil Pad state
  const [isPencilPadOpen, setIsPencilPadOpen] = useState(false);
  const [autoSendSketch, setAutoSendSketch] = useState(true);
  const [padStrokeCount, setPadStrokeCount] = useState(0);

  const padCanvasRef = useRef(null);
  const padStrokesRef = useRef([]);
  const padActiveStrokeRef = useRef(null);
  const padGraceTimerRef = useRef(null);
  const threadEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Run initial Circle Search query whenever new captureData arrives
  useEffect(() => {
    if (!isOpen || !captureData) return;

    let cancelled = false;
    setThread([]);
    setInputValue('');
    setIsPencilPadOpen(false);
    padStrokesRef.current = [];
    setPadStrokeCount(0);
    setInitialLoading(true);

    const runInitialLookup = async () => {
      const { queryText = '', imageBase64 = null, gestureType = 'freehand-structure', source = 'home', pageTitle = '' } =
        captureData;

      try {
        const res = await fetchCircleApi('/api/ai/circle-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queryText,
            imageBase64,
            gestureType,
            source,
            pageTitle,
            userId: user?.id || 'guest_scholar',
          }),
        });
        const data = await res.json();
        if (cancelled) return;

        const explanation =
          data?.result?.explanation ||
          data?.result?.summary ||
          buildClientOfflineFallback(queryText || 'Freehand Pencil Selection');
        const title = data?.result?.title || 'Circle Search Analysis';
        const engine = data?.aiEngine || data?.result?.provider || 'Atelion Multi-Provider Cascade';

        setAiEngineBadge(data?.cached ? `⚡ Turso 0ms Cache • ${engine}` : engine);
        setInitialContextSummary(`${queryText ? `Selected: ${queryText}\n` : ''}${title}\n${explanation}`);
        setThread([
          {
            id: 'init_' + Date.now(),
            role: 'assistant',
            title,
            content: explanation,
            keyPoints: data?.result?.keyPoints || [],
            provider: engine,
            elapsedMs: data?.processingTimeMs,
          },
        ]);
      } catch {
        if (cancelled) return;
        const fallback = buildClientOfflineFallback(captureData.queryText || 'Freehand Pencil Structure');
        setAiEngineBadge('Atelion Local Guard');
        setInitialContextSummary(`${captureData.queryText || ''}\n${fallback}`);
        setThread([
          {
            id: 'init_fb_' + Date.now(),
            role: 'assistant',
            title: 'Freehand Pencil Analysis',
            content: fallback,
            provider: 'Atelion Local Guard',
          },
        ]);
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
          scrollToBottom();
        }
      }
    };

    runInitialLookup();
    return () => {
      cancelled = true;
    };
  }, [isOpen, captureData, user?.id]);

  // Built-in ✏️ Pencil Pad canvas redraw
  const redrawPencilPad = useCallback(() => {
    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    // Subtle light dot grid on white pad
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#E5E7EB';
    for (let gx = 16; gx < w; gx += 20) {
      for (let gy = 16; gy < h; gy += 20) {
        ctx.fillRect(gx, gy, 1.2, 1.2);
      }
    }

    const all = padActiveStrokeRef.current
      ? [...padStrokesRef.current, padActiveStrokeRef.current]
      : padStrokesRef.current;

    if (all.length === 0) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1D4ED8';
    ctx.fillStyle = '#1D4ED8';
    ctx.lineWidth = 2.8;
    for (const pts of all) {
      drawSmoothStroke(ctx, pts, 0, 0, 1);
    }
    ctx.restore();
  }, []);

  useEffect(() => {
    if (!isPencilPadOpen) return;
    const canvas = padCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = getSafeCanvasDpr();
    const width = Math.max(280, Math.floor(rect.width || 560));
    const height = 150;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redrawPencilPad();

    const preventSafariScroll = (ev) => {
      if (ev.cancelable) ev.preventDefault();
    };
    canvas.addEventListener('touchstart', preventSafariScroll, { passive: false });
    canvas.addEventListener('touchmove', preventSafariScroll, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', preventSafariScroll);
      canvas.removeEventListener('touchmove', preventSafariScroll);
    };
  }, [isPencilPadOpen, redrawPencilPad]);

  const exportPadSketchDataUrl = useCallback(() => {
    if (padStrokesRef.current.length === 0) return null;
    const bounds = computeFreehandBounds(padStrokesRef.current, {
      padding: 18,
      minWidth: 160,
      minHeight: 90,
      expandUnderlineUpward: false,
    });
    const rendered = renderFreehandStrokesToCanvas(padStrokesRef.current, bounds, {
      strokeColor: '#1D4ED8',
      strokeWidth: 3,
      backgroundColor: '#FFFFFF',
    });
    return rendered?.dataUrl || null;
  }, []);

  const clearPadGraceTimer = () => {
    if (padGraceTimerRef.current) {
      clearTimeout(padGraceTimerRef.current);
      padGraceTimerRef.current = null;
    }
  };

  /**
   * Send multi-turn follow-up OR any other question (with optional Pencil Pad sketch)
   */
  const handleSendFollowUp = useCallback(
    async (overridePrompt = null, overrideSketchUrl = null) => {
      clearPadGraceTimer();
      const textToSend = (overridePrompt !== null ? overridePrompt : inputValue).trim();
      const sketchUrl = overrideSketchUrl || exportPadSketchDataUrl();

      if ((!textToSend && !sketchUrl) || chatLoading) return;

      const userTurn = {
        id: 'u_' + Date.now(),
        role: 'user',
        content: textToSend || '✏️ Analyze this drawn structure / formula',
        sketchUrl,
      };

      const priorHistory = thread.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setThread((prev) => [...prev, userTurn]);
      if (overridePrompt === null) setInputValue('');
      if (sketchUrl) {
        padStrokesRef.current = [];
        padActiveStrokeRef.current = null;
        setPadStrokeCount(0);
        redrawPencilPad();
      }
      setChatLoading(true);
      scrollToBottom();

      try {
        const res = await fetchCircleApi('/api/ai/circle-search/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            imageBase64: sketchUrl,
            initialContext: initialContextSummary,
            history: priorHistory,
            source: captureData?.source || 'home',
            userId: user?.id || 'guest_scholar',
          }),
        });
        const data = await res.json();
        const replyText =
          data?.reply ||
          data?.result?.explanation ||
          buildClientOfflineFallback(textToSend || 'Pencil Sketch', true);

        setThread((prev) => [
          ...prev,
          {
            id: 'ai_' + Date.now(),
            role: 'assistant',
            content: replyText,
            provider: data?.aiEngine || 'Atelion AI',
            elapsedMs: data?.processingTimeMs,
          },
        ]);
      } catch {
        setThread((prev) => [
          ...prev,
          {
            id: 'ai_fb_' + Date.now(),
            role: 'assistant',
            content: buildClientOfflineFallback(textToSend || 'Pencil Sketch', true),
            provider: 'Atelion Local Guard',
          },
        ]);
      } finally {
        setChatLoading(false);
        scrollToBottom();
      }
    },
    [
      inputValue,
      exportPadSketchDataUrl,
      chatLoading,
      thread,
      initialContextSummary,
      captureData?.source,
      user?.id,
      redrawPencilPad,
    ]
  );

  // Pencil Pad pointer handlers (Safari WebKit safe)
  const onPadPointerDown = (e) => {
    if (e.cancelable) e.preventDefault();
    clearPadGraceTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    padActiveStrokeRef.current = [{ x: e.clientX - rect.left, y: e.clientY - rect.top }];
    safeSetPointerCapture(e.currentTarget, e.pointerId);
    redrawPencilPad();
  };

  const onPadPointerMove = (e) => {
    if (!padActiveStrokeRef.current) return;
    if (e.cancelable) e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const pts = padActiveStrokeRef.current;
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 1.8) {
      pts.push(pt);
      redrawPencilPad();
    }
  };

  const onPadPointerUp = () => {
    if (!padActiveStrokeRef.current) return;
    const finished = padActiveStrokeRef.current;
    padActiveStrokeRef.current = null;

    if (finished.length >= 2 || padStrokesRef.current.length > 0) {
      padStrokesRef.current = [...padStrokesRef.current, finished];
      setPadStrokeCount(padStrokesRef.current.length);
      redrawPencilPad();

      // If auto-send is active and user hasn't typed a partial prompt, auto-analyze after ~650ms!
      if (autoSendSketch && !inputValue.trim()) {
        padGraceTimerRef.current = setTimeout(() => {
          const url = exportPadSketchDataUrl();
          if (url) {
            handleSendFollowUp('', url);
          }
        }, MULTI_STROKE_GRACE_MS);
      }
    }
  };

  if (!isOpen || !captureData) return null;

  const isPdfSource = captureData.source === 'pdf';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[90vh] h-[680px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-900 font-sans"
      >
        {/* 1. Top Header Bar (Clean White) */}
        <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-sm flex-shrink-0 shadow-2xs">
              ✏️
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-gray-950 truncate">
                  {isPdfSource ? 'Read PDF Circle Search' : 'Home Circle Search'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                  {captureData.gestureType || 'freehand-structure'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 truncate max-w-[220px]">
                  {aiEngineBadge}
                </span>
              </div>
              {captureData.pageTitle && (
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  Source: {captureData.pageTitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Scrollable Multi-Turn Conversation Thread */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 bg-white"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Captured Freehand Region / Text Preview Card */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {captureData.imageBase64 && (
              <img
                src={captureData.imageBase64}
                alt="Freehand Selection"
                className="h-16 max-w-[180px] object-contain rounded-lg bg-white border border-gray-200 p-1 shadow-2xs flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                Captured Pencil Selection
              </p>
              <p className="text-xs text-gray-800 font-medium line-clamp-2 break-words">
                {captureData.queryText || 'Freehand drawn structure / diagram / math stroke'}
              </p>
            </div>
          </div>

          {/* Initial Loading State */}
          {initialLoading && (
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3 text-xs text-gray-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              <span>Analyzing freehand pencil selection with Vision + KaTeX AI...</span>
            </div>
          )}

          {/* Multi-Turn Messages */}
          {thread.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-left ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-50/90 border border-gray-200 text-gray-800 shadow-2xs w-full'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="space-y-2">
                    {msg.sketchUrl && (
                      <img
                        src={msg.sketchUrl}
                        alt="Pencil Pad Sketch"
                        className="max-h-28 rounded-lg bg-white p-1 border border-blue-400"
                      />
                    )}
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ) : (
                  <div>
                    <RichMathMarkdown content={msg.content} />
                  </div>
                )}
              </div>

              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2.5 mt-1.5 px-1 text-[10px] text-gray-400">
                  <span>{msg.provider || 'Atelion AI'}</span>
                  {typeof msg.elapsedMs === 'number' && <span>• {msg.elapsedMs}ms</span>}
                  {onInsertToPage && (
                    <>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => onInsertToPage(msg.content)}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        + Insert into Note
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}

          {chatLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-600 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl w-fit">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Generating answer...</span>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* 3. Built-in ✏️ Pencil Pad (Collapsible Freehand Sketchpad inside Modal) */}
        {isPencilPadOpen && (
          <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50/90 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">✏️ Built-in Pencil Pad</span>
                <span className="text-gray-500 hidden sm:inline">
                  Draw any formula, chemical ring, or circuit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[10px] text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSendSketch}
                    onChange={(e) => setAutoSendSketch(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span>Auto-solve (0.65s)</span>
                </label>

                {padStrokeCount > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        clearPadGraceTimer();
                        padStrokesRef.current = padStrokesRef.current.slice(0, -1);
                        setPadStrokeCount(padStrokesRef.current.length);
                        redrawPencilPad();
                      }}
                      className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Undo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearPadGraceTimer();
                        padStrokesRef.current = [];
                        setPadStrokeCount(0);
                        redrawPencilPad();
                      }}
                      className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendFollowUp()}
                      className="px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                    >
                      Ask Sketch ↵
                    </button>
                  </>
                )}
              </div>
            </div>

            <canvas
              ref={padCanvasRef}
              onPointerDown={onPadPointerDown}
              onPointerMove={onPadPointerMove}
              onPointerUp={onPadPointerUp}
              onPointerCancel={onPadPointerUp}
              className="w-full h-[150px] rounded-xl bg-white border border-gray-200 shadow-inner"
              style={{
                cursor: PENCIL_CURSOR_STYLE,
                touchAction: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
              }}
            />
          </div>
        )}

        {/* 4. Quick Follow-Up Chips + Pinned Bottom Chatbox */}
        <div className="p-3 border-t border-gray-200 bg-white space-y-2.5 flex-shrink-0">
          {/* Quick Follow-up Chips + Built-in Pencil Pad Toggle */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {QUICK_FOLLOWUP_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                disabled={initialLoading || chatLoading}
                onClick={() => handleSendFollowUp(chip.label + ': ' + chip.prompt)}
                className="px-2.5 py-1 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200 hover:border-blue-200 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer disabled:opacity-40 shadow-2xs"
              >
                {chip.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsPencilPadOpen((prev) => !prev)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shadow-2xs ${
                isPencilPadOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              ✏️ Pencil Pad
            </button>
          </div>

          {/* Pinned Multi-Turn Input Box */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus-within:bg-white focus-within:border-blue-500 transition-all shadow-2xs">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendFollowUp();
                }
              }}
              placeholder="Ask anything related to this result OR ask any other question..."
              className="flex-1 bg-transparent text-xs text-gray-900 placeholder-gray-400 outline-none font-sans"
            />
            <button
              type="button"
              disabled={chatLoading || (!inputValue.trim() && padStrokeCount === 0)}
              onClick={() => handleSendFollowUp()}
              className="w-7 h-7 rounded-lg bg-gray-900 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              title="Send question"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
