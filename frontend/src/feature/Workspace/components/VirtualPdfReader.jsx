import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  PENCIL_CURSOR_STYLE,
  MULTI_STROKE_GRACE_MS,
  computeFreehandBounds,
  drawSmoothStroke,
  renderFreehandStrokesToCanvas,
  safeSetPointerCapture,
  safeReleasePointerCapture,
  getSafeCanvasDpr,
} from '../services/circleSearchEngine';
import { X, ChevronRight, Plus } from './WorkspaceIcons';

const PAGE_WIDTH = 760;
const PAGE_HEIGHT = 980;

/**
 * Built-in Academic Lecture PDF Pages (Rendered directly onto high-DPI <canvas>
 * with real vector diagrams, chemical rings, RLC circuits, equations & text regions
 * so pixel cropping + text extraction work 100% natively offline and online!)
 */
const BUILTIN_PDF_PAGES = [
  {
    pageNumber: 1,
    heading: 'Lecture 01 — Quantum Wave Mechanics & Potential Barriers',
    subtitle: 'Department of Physics • Advanced Quantum Notes',
    textRegions: [
      {
        yMin: 60,
        yMax: 155,
        text: 'Time-Dependent Schrödinger Wave Equation: i \\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)',
      },
      {
        yMin: 160,
        yMax: 310,
        text: 'Wavefunction Normalization & Born Probability Density: \\int_{-\\infty}^{\\infty} |\\Psi(x,t)|^2 dx = 1. Physical observables correspond to Hermitian operators.',
      },
      {
        yMin: 320,
        yMax: 580,
        text: 'Quantum Tunneling Across Finite Potential Barrier V_0 > E: Transmission coefficient T \\approx e^{-2 \\kappa L} where \\kappa = \\frac{\\sqrt{2m(V_0 - E)}}{\\hbar}.',
      },
      {
        yMin: 590,
        yMax: 880,
        text: 'Gaussian Integral Identity in Wave Packet Normalization: \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi} and Heisenberg Uncertainty \\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}.',
      },
    ],
    drawCustomDiagram: (ctx) => {
      // Potential Barrier + Tunneling Wave Diagram
      ctx.save();
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.fillRect(60, 340, 640, 210);
      ctx.strokeRect(60, 340, 640, 210);

      // Barrier block V0
      ctx.fillStyle = '#DBEAFE';
      ctx.strokeStyle = '#2563EB';
      ctx.fillRect(340, 370, 90, 155);
      ctx.strokeRect(340, 370, 90, 155);
      ctx.fillStyle = '#1E40AF';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('Barrier V₀ > E', 343, 362);

      // Incident oscillating wave (left), exponential decay (inside), small transmitted wave (right)
      ctx.beginPath();
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2.5;
      for (let x = 85; x <= 340; x += 2) {
        const y = 450 + 42 * Math.sin((x - 85) * 0.09);
        if (x === 85) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let x = 340; x <= 430; x += 2) {
        const startY = 450 + 42 * Math.sin((340 - 85) * 0.09);
        const decay = Math.exp(-(x - 340) * 0.022);
        ctx.lineTo(x, 450 + (startY - 450) * decay);
      }
      for (let x = 430; x <= 670; x += 2) {
        const y = 450 + 11 * Math.sin((x - 430) * 0.09);
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.font = '12px monospace';
      ctx.fillText('Incident Wave Ψ_inc', 100, 520);
      ctx.fillText('Tunneling Decay e^(-κx)', 325, 542);
      ctx.fillText('Transmitted Ψ_trans', 495, 520);
      ctx.restore();
    },
    paragraphs: [
      { y: 125, title: '1.1 Fundamental Postulate & Hamiltonian Operator', body: 'i ħ ∂Ψ(r,t)/∂t = Ĥ Ψ(r,t)   where   Ĥ = -(ħ² / 2m)∇² + V(r)' },
      { y: 225, title: '1.2 Born Probability Interpretation', body: 'The quantity |Ψ(x,t)|² dx represents the probability of detecting the particle between x and x + dx.' },
      { y: 615, title: '1.3 Gaussian Wave Packet & Uncertainty Relation', body: '∫ e^(-x²) dx = √π     and     Δx · Δp ≥ ħ / 2' },
      { y: 725, title: '1.4 Eigenvalue Quantization in Bound Potentials', body: 'For an infinite square well of width L, allowed energy levels are Eₙ = (n² π² ħ²) / (2 m L²).' },
    ],
  },
  {
    pageNumber: 2,
    heading: 'Lecture 02 — Aromaticity, Benzene Ring & Electrophilic Substitution',
    subtitle: 'Organic Chemistry • Structure & Reactivity Series',
    textRegions: [
      {
        yMin: 60,
        yMax: 240,
        text: 'Benzene (C6H6) Aromaticity & Hückel 4n+2 Rule: Planar cyclic sp2 ring with 6 delocalized pi electrons (n=1), resonance energy ~150 kJ/mol.',
      },
      {
        yMin: 250,
        yMax: 580,
        text: 'Benzene Chemical Ring Structure & Electrophilic Aromatic Substitution (EAS): C6H6 + E+ -> Arenium Sigma Complex (Wheland Intermediate) -> C6H5-E + H+.',
      },
      {
        yMin: 590,
        yMax: 880,
        text: 'Friedel-Crafts Acylation & Nitration Reagents: HNO3 + H2SO4 generates nitronium electrophile NO2+; RCOCl + AlCl3 generates acylium ion RCO+.',
      },
    ],
    drawCustomDiagram: (ctx) => {
      ctx.save();
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.fillRect(60, 290, 640, 250);
      ctx.strokeRect(60, 290, 640, 250);

      // Draw Hexagon Benzene Ring 1
      const drawHexagon = (cx, cy, r, innerCircle = true) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.6;
        ctx.stroke();

        if (innerCircle) {
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 2.2;
          ctx.stroke();
        }
      };

      drawHexagon(175, 415, 62, true);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText('+   E⁺', 268, 420);

      // Reaction arrow
      ctx.beginPath();
      ctx.moveTo(335, 415);
      ctx.lineTo(435, 415);
      ctx.lineTo(423, 408);
      ctx.moveTo(435, 415);
      ctx.lineTo(423, 422);
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('EAS (-H⁺)', 352, 402);

      // Substituted Benzene Ring 2
      drawHexagon(535, 415, 62, true);
      ctx.beginPath();
      ctx.moveTo(535, 353);
      ctx.lineTo(535, 320);
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText('E', 530, 314);

      ctx.fillStyle = '#475569';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('Benzene (6π Aromatic Ring)', 105, 512);
      ctx.fillText('Substituted Aromatic Product', 455, 512);
      ctx.restore();
    },
    paragraphs: [
      { y: 125, title: '2.1 Hückel’s (4n + 2) π-Electron Criterion', body: 'A cyclic, planar, fully conjugated ring is aromatic if it possesses (4n + 2) delocalized π electrons.' },
      { y: 210, title: '2.2 Carbon–Carbon Bond Equivalence', body: 'X-ray diffraction confirms all six C–C bonds in benzene have identical length 1.39 Å.' },
      { y: 615, title: '2.3 Nitration & Friedel–Crafts Mechanisms', body: 'HNO₃ + H₂SO₄ ⟶ NO₂⁺ (Nitronium Electrophile) + HSO₄⁻ + H₂O' },
      { y: 725, title: '2.4 Ortho/Para vs Meta Directing Groups', body: 'Electron-donating groups (-OH, -NH₂, -OR) activate the ring toward ortho and para substitution.' },
    ],
  },
  {
    pageNumber: 3,
    heading: 'Lecture 03 — Series RLC AC Circuit & Resonance Impedance',
    subtitle: 'Electrical Engineering • Network Analysis & Phasors',
    textRegions: [
      {
        yMin: 60,
        yMax: 240,
        text: 'Series RLC Circuit Impedance: Z = R + j(\\omega L - \\frac{1}{\\omega C}) and Magnitude |Z| = \\sqrt{R^2 + (X_L - X_C)^2}.',
      },
      {
        yMin: 250,
        yMax: 580,
        text: 'Series RLC Electrical Circuit Diagram & Resonance Condition: X_L = X_C => f_0 = \\frac{1}{2\\pi\\sqrt{LC}}. Quality factor Q = \\frac{\\omega_0 L}{R}.',
      },
      {
        yMin: 590,
        yMax: 880,
        text: 'Kirchhoff Voltage Law (KVL) in Phasor Form: V_S = V_R + j(V_L - V_C), phase angle \\phi = \\arctan(\\frac{X_L - X_C}{R}).',
      },
    ],
    drawCustomDiagram: (ctx) => {
      ctx.save();
      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.fillRect(60, 285, 640, 250);
      ctx.strokeRect(60, 285, 640, 250);

      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.4;

      // Top wire + Resistor R
      ctx.beginPath();
      ctx.moveTo(140, 355);
      ctx.lineTo(220, 355);
      // Zigzag resistor
      const rx = 220;
      for (let i = 0; i < 6; i++) {
        ctx.lineTo(rx + i * 14 + 7, i % 2 === 0 ? 341 : 369);
      }
      ctx.lineTo(310, 355);
      ctx.lineTo(360, 355);
      ctx.stroke();

      // Inductor L coils
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.arc(380 + i * 24, 355, 12, Math.PI, 0, false);
      }
      ctx.lineTo(525, 355);
      ctx.stroke();

      // Capacitor C plates on right vertical branch
      ctx.beginPath();
      ctx.moveTo(525, 355);
      ctx.lineTo(590, 355);
      ctx.lineTo(590, 412);
      ctx.moveTo(570, 412);
      ctx.lineTo(610, 412);
      ctx.moveTo(570, 428);
      ctx.lineTo(610, 428);
      ctx.moveTo(590, 428);
      ctx.lineTo(590, 485);
      ctx.lineTo(140, 485);
      ctx.lineTo(140, 442);
      ctx.stroke();

      // AC Source circle on left branch
      ctx.beginPath();
      ctx.arc(140, 418, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#2563EB';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(140, 394);
      ctx.lineTo(140, 355);
      ctx.strokeStyle = '#0F172A';
      ctx.stroke();

      ctx.fillStyle = '#1D4ED8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('V(t) ~', 120, 423);
      ctx.fillStyle = '#0F172A';
      ctx.fillText('R (Ω)', 242, 330);
      ctx.fillText('L (mH)', 395, 330);
      ctx.fillText('C (µF)', 618, 425);
      ctx.fillText('Resonance: f₀ = 1 / (2π√LC)', 265, 515);
      ctx.restore();
    },
    paragraphs: [
      { y: 125, title: '3.1 Complex Phasor Impedance', body: 'Z = R + j(ωL − 1/ωC)     |Z| = √[ R² + (X_L − X_C)² ]' },
      { y: 210, title: '3.2 Resonant Frequency & Bandwidth', body: 'At X_L = X_C, impedance is purely resistive (Z = R) and current reaches I_max = V / R.' },
      { y: 615, title: '3.3 Quality Factor (Selectivity)', body: 'Q = (ω₀ L) / R = (1 / R) √(L / C)     Bandwidth Δf = f₀ / Q' },
      { y: 725, title: '3.4 Average Active Power Dissipation', body: 'P_avg = V_rms · I_rms · cos(φ), where cos(φ) = R / |Z| is the circuit power factor.' },
    ],
  },
];

/**
 * Draw a crisp academic PDF page onto a target <canvas>
 */
function renderAcademicPdfPageToCanvas(canvas, pageSpec, customImageObj = null) {
  if (!canvas) return;
  const dpr = getSafeCanvasDpr();
  canvas.width = PAGE_WIDTH * dpr;
  canvas.height = PAGE_HEIGHT * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Page paper background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  if (customImageObj) {
    // Render user-uploaded image/sheet centered on page
    const scale = Math.min((PAGE_WIDTH - 60) / customImageObj.width, (PAGE_HEIGHT - 90) / customImageObj.height);
    const dw = customImageObj.width * scale;
    const dh = customImageObj.height * scale;
    ctx.drawImage(customImageObj, (PAGE_WIDTH - dw) / 2, 55, dw, dh);
    ctx.fillStyle = '#64748B';
    ctx.font = '11px monospace';
    ctx.fillText(`Uploaded Sheet • Circle or underline any structure with Circle Search`, 40, 32);
    return;
  }

  if (!pageSpec) return;

  // Top running header
  ctx.fillStyle = '#64748B';
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.fillText(pageSpec.subtitle, 56, 44);
  ctx.fillText(`Page ${pageSpec.pageNumber}`, PAGE_WIDTH - 96, 44);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(56, 56);
  ctx.lineTo(PAGE_WIDTH - 56, 56);
  ctx.stroke();

  // Main Title
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(pageSpec.heading, 56, 90);

  // Paragraphs & Equations
  for (const p of pageSpec.paragraphs || []) {
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(p.title, 56, p.y);

    ctx.fillStyle = '#334155';
    ctx.font = '13.5px Georgia, serif';
    const words = p.body.split(' ');
    let line = '';
    let ly = p.y + 24;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > PAGE_WIDTH - 116) {
        ctx.fillText(line, 56, ly);
        line = w;
        ly += 21;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 56, ly);
  }

  // Custom Vector Diagram (Quantum Barrier / Benzene Ring / RLC Circuit)
  if (typeof pageSpec.drawCustomDiagram === 'function') {
    pageSpec.drawCustomDiagram(ctx);
  }

  // Footer
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px monospace';
  ctx.fillText('Atelion Academic PDF Vault • Use ✏️ Circle Search to underline or draw over any diagram/equation', 56, PAGE_HEIGHT - 30);
}

/**
 * Individual PDF Page Surface with Direct Freehand Pencil Overlay
 * Used identically by BOTH Continuous Mode AND Single Page Mode!
 */
function PdfPageCanvasWithPencil({
  pageSpec,
  customImageObj,
  documentTitle,
  isPencilActive,
  onTriggerCircleSearch,
}) {
  const pdfCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const strokesRef = useRef([]);
  const activeStrokeRef = useRef(null);
  const graceTimerRef = useRef(null);

  useEffect(() => {
    renderAcademicPdfPageToCanvas(pdfCanvasRef.current, pageSpec, customImageObj);
  }, [pageSpec, customImageObj]);

  const clearGrace = () => {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
  };

  const redrawOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = overlay.getBoundingClientRect();
    const w = rect.width || PAGE_WIDTH;
    const h = rect.height || PAGE_HEIGHT;
    if (overlay.width !== Math.round(w * dpr) || overlay.height !== Math.round(h * dpr)) {
      overlay.width = Math.round(w * dpr);
      overlay.height = Math.round(h * dpr);
    }
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const all = activeStrokeRef.current
      ? [...strokesRef.current, activeStrokeRef.current]
      : strokesRef.current;

    if (all.length === 0) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.24)';
    ctx.lineWidth = 8;
    for (const pts of all) drawSmoothStroke(ctx, pts, 0, 0, 1);

    ctx.strokeStyle = '#2563EB';
    ctx.fillStyle = '#2563EB';
    ctx.lineWidth = 3;
    for (const pts of all) drawSmoothStroke(ctx, pts, 0, 0, 1);

    const bounds = computeFreehandBounds(all, {
      padding: 14,
      expandUnderlineUpward: true,
      maxWidth: w,
      maxHeight: h,
    });
    if (bounds) {
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.6)';
      ctx.strokeRect(bounds.minX, bounds.minY, bounds.width, bounds.height);
    }
    ctx.restore();
  }, []);

  useEffect(() => {
    if (!isPencilActive) {
      clearGrace();
      strokesRef.current = [];
      activeStrokeRef.current = null;
      redrawOverlay();
      return;
    }

    // Safari iOS/iPadOS passive:false touch guard on PDF Pencil overlay
    const el = overlayCanvasRef.current;
    const preventSafariScroll = (ev) => {
      if (ev.cancelable) ev.preventDefault();
    };
    if (el) {
      el.addEventListener('touchstart', preventSafariScroll, { passive: false });
      el.addEventListener('touchmove', preventSafariScroll, { passive: false });
    }
    return () => {
      if (el) {
        el.removeEventListener('touchstart', preventSafariScroll);
        el.removeEventListener('touchmove', preventSafariScroll);
      }
    };
  }, [isPencilActive, redrawOverlay]);

  const completePdfCapture = useCallback(() => {
    clearGrace();
    const strokes = strokesRef.current;
    const overlay = overlayCanvasRef.current;
    const pdfCanvas = pdfCanvasRef.current;
    if (!strokes.length || !overlay || !pdfCanvas) return;

    const rect = overlay.getBoundingClientRect();
    const displayW = rect.width || PAGE_WIDTH;
    const displayH = rect.height || PAGE_HEIGHT;

    const bounds = computeFreehandBounds(strokes, {
      padding: 18,
      expandUnderlineUpward: true,
      maxWidth: displayW,
      maxHeight: displayH,
    });
    if (!bounds) return;

    // Map bounds to page logical coordinates (PAGE_HEIGHT) to extract intersecting PDF text
    const scaleToLogicalY = PAGE_HEIGHT / displayH;
    const logicalMinY = bounds.minY * scaleToLogicalY;
    const logicalMaxY = bounds.maxY * scaleToLogicalY;

    let extractedPdfText = '';
    if (pageSpec?.textRegions) {
      const matched = pageSpec.textRegions
        .filter((r) => !(r.yMax < logicalMinY || r.yMin > logicalMaxY))
        .map((r) => r.text);
      extractedPdfText = matched.join('\n');
    }

    // Composite exact PDF page <canvas> pixels + user's freehand strokes!
    const rendered = renderFreehandStrokesToCanvas(strokes, bounds, {
      sourceCanvas: pdfCanvas,
      sourceScaleX: pdfCanvas.width / displayW,
      sourceScaleY: pdfCanvas.height / displayH,
      strokeColor: '#2563EB',
      strokeWidth: 2.8,
      drawStrokesOnCrop: true,
    });

    strokesRef.current = [];
    activeStrokeRef.current = null;
    redrawOverlay();

    onTriggerCircleSearch?.({
      queryText: extractedPdfText,
      imageBase64: rendered?.dataUrl || null,
      gestureType: bounds.gestureType || 'freehand-structure',
      source: 'pdf',
      pageTitle: `${documentTitle} (Page ${pageSpec?.pageNumber || 1})`,
    });
  }, [pageSpec, documentTitle, onTriggerCircleSearch, redrawOverlay]);

  const handlePointerDown = (e) => {
    if (!isPencilActive) return;
    if (e.button !== undefined && e.button !== 0) return;
    if (e.cancelable) e.preventDefault();
    clearGrace();
    const rect = e.currentTarget.getBoundingClientRect();
    activeStrokeRef.current = [{ x: e.clientX - rect.left, y: e.clientY - rect.top }];
    safeSetPointerCapture(e.currentTarget, e.pointerId);
    redrawOverlay();
  };

  const handlePointerMove = (e) => {
    if (!isPencilActive || !activeStrokeRef.current) return;
    if (e.cancelable) e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const pts = activeStrokeRef.current;
    const last = pts[pts.length - 1];
    if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 1.8) {
      pts.push(pt);
      redrawOverlay();
    }
  };

  const handlePointerUp = (e) => {
    safeReleasePointerCapture(e?.currentTarget, e?.pointerId);
    if (!isPencilActive || !activeStrokeRef.current) return;
    const finished = activeStrokeRef.current;
    activeStrokeRef.current = null;

    if (finished.length === 1) {
      finished.push({ x: finished[0].x + 3, y: finished[0].y + 3 });
    }

    if (finished.length >= 2 || strokesRef.current.length > 0) {
      strokesRef.current = [...strokesRef.current, finished];
      redrawOverlay();
      graceTimerRef.current = setTimeout(() => {
        completePdfCapture();
      }, MULTI_STROKE_GRACE_MS);
    }
  };

  const handlePointerCancel = (e) => {
    safeReleasePointerCapture(e?.currentTarget, e?.pointerId);
    if (activeStrokeRef.current && activeStrokeRef.current.length >= 2) {
      strokesRef.current = [...strokesRef.current, activeStrokeRef.current];
      redrawOverlay();
      graceTimerRef.current = setTimeout(() => {
        completePdfCapture();
      }, MULTI_STROKE_GRACE_MS);
    }
    activeStrokeRef.current = null;
    redrawOverlay();
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[760px] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden select-none"
      style={{ touchAction: isPencilActive ? 'none' : 'auto' }}
    >
      <canvas
        ref={pdfCanvasRef}
        className="block w-full h-auto bg-white"
      />
      {isPencilActive && (
        <canvas
          ref={overlayCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="absolute inset-0 w-full h-full z-10"
          style={{
            cursor: PENCIL_CURSOR_STYLE,
            touchAction: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
          }}
        />
      )}
    </div>
  );
}

/**
 * ==============================================================================
 * VIRTUAL PDF READER WITH DIRECT FREEHAND PENCIL CIRCLE SEARCH
 * Supports BOTH:
 *   - Continuous Mode (Vertical multi-page scroll + Freehand Pencil on every page)
 *   - Single Page Mode (Focused single page + Prev/Next + Freehand Pencil)
 * ==============================================================================
 */
export default function VirtualPdfReader({
  isOpen,
  title = 'Quantum_Physics_Lecture_Notes.pdf',
  initialPencilActive = true,
  onClose,
  onTriggerCircleSearch,
}) {
  const [viewMode, setViewMode] = useState('continuous'); // 'continuous' | 'single'
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [isPencilActive, setIsPencilActive] = useState(initialPencilActive);
  const [uploadedSheets, setUploadedSheets] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsPencilActive(true); // Click karte hi seedha Pencil active!
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allPages = [
    ...uploadedSheets.map((imgObj, idx) => ({
      id: `up_${idx}`,
      pageSpec: { pageNumber: idx + 1, heading: imgObj.name, textRegions: [] },
      customImageObj: imgObj.image,
    })),
    ...BUILTIN_PDF_PAGES.map((p, idx) => ({
      id: `builtin_${p.pageNumber}`,
      pageSpec: { ...p, pageNumber: uploadedSheets.length + idx + 1 },
      customImageObj: null,
    })),
  ];

  const safeIdx = Math.min(allPages.length - 1, Math.max(0, currentPageIdx));

  const handleUploadSheet = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setUploadedSheets((prev) => [{ name: file.name, image: img }, ...prev]);
        setCurrentPageIdx(0);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-100/95 flex flex-col overflow-hidden font-sans text-gray-900 animate-in fade-in duration-150">
      {/* Clean White PDF Reader Header Toolbar */}
      <header className="h-13 px-4 bg-white border-b border-gray-200 flex items-center justify-between gap-3 flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg">📄</span>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-gray-950 truncate">{title}</h2>
            <p className="text-[10px] text-gray-500 hidden sm:block">
              Read PDF Circle Search • {allPages.length} Pages
            </p>
          </div>
        </div>

        {/* Center Controls: Continuous vs Single Page Mode + Freehand Pencil Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher: Continuous Mode | Single Page Mode */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('continuous')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'continuous'
                  ? 'bg-white text-gray-950 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Continuous Mode
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-white text-gray-950 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single Page Mode
            </button>
          </div>

          {/* Single Page Navigation */}
          {viewMode === 'single' && (
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs">
              <button
                type="button"
                disabled={safeIdx === 0}
                onClick={() => setCurrentPageIdx((p) => Math.max(0, p - 1))}
                className="px-1.5 font-bold text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                ◀
              </button>
              <span className="font-mono text-[11px] text-gray-600">
                {safeIdx + 1} / {allPages.length}
              </span>
              <button
                type="button"
                disabled={safeIdx >= allPages.length - 1}
                onClick={() => setCurrentPageIdx((p) => Math.min(allPages.length - 1, p + 1))}
                className="px-1.5 font-bold text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                ▶
              </button>
            </div>
          )}

          {/* Direct Circle Search Button */}
          <button
            type="button"
            onClick={() => setIsPencilActive((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
              isPencilActive
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
            }`}
            title="Toggle Circle Search"
          >
            <span>✏️</span>
            <span>Circle Search</span>
          </button>

          {/* Upload Custom Diagram / Exam Sheet */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadSheet}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium cursor-pointer"
            title="Load diagram or note image onto PDF reader canvas"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sheet</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-950 cursor-pointer transition-colors"
          title="Close PDF Reader"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Subtle Helper Banner when Circle Search is Active */}
      {isPencilActive && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-1.5 text-center text-[11px] text-blue-800 font-medium flex-shrink-0">
          <strong>Circle to Search Active ({viewMode === 'continuous' ? 'Continuous Mode' : 'Single Page Mode'})</strong> — Underline text, bracket equations, or draw over any circuit / chemical ring for instant AI result!
        </div>
      )}

      {/* PDF Viewport: Continuous Mode vs Single Page Mode */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {viewMode === 'continuous' ? (
          allPages.map((item) => (
            <PdfPageCanvasWithPencil
              key={item.id}
              pageSpec={item.pageSpec}
              customImageObj={item.customImageObj}
              documentTitle={title}
              isPencilActive={isPencilActive}
              onTriggerCircleSearch={onTriggerCircleSearch}
            />
          ))
        ) : (
          <PdfPageCanvasWithPencil
            key={allPages[safeIdx].id}
            pageSpec={allPages[safeIdx].pageSpec}
            customImageObj={allPages[safeIdx].customImageObj}
            documentTitle={title}
            isPencilActive={isPencilActive}
            onTriggerCircleSearch={onTriggerCircleSearch}
          />
        )}
      </div>
    </div>
  );
}
