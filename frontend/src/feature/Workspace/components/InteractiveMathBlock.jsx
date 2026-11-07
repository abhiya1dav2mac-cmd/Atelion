import React, { useState, useMemo } from 'react';
import KatexEquation, { cleanMathDelimiters } from './KatexEquation';
import { Sparkles, Trash, Copy, Check } from './WorkspaceIcons';

/**
 * Common formula templates with mathematical evaluator models
 */
const FORMULA_PRESETS = [
  {
    name: 'Schrödinger Equation',
    latex: 'i \\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)',
    variables: { hbar: 1.054, energy: 5.0, psi: 1.0 },
    evaluator: (v) => `E\\Psi = ${(v.energy * v.psi).toFixed(2)} \\text{ eV}`,
  },
  {
    name: 'Gaussian Integral',
    latex: '\\int_{-\\infty}^{\\infty} e^{-a x^2} dx = \\sqrt{\\frac{\\pi}{a}}',
    variables: { a: 1.0 },
    evaluator: (v) => `\\sqrt{\\pi / ${v.a}} = ${(Math.sqrt(Math.PI / Math.max(0.01, v.a))).toFixed(4)}`,
  },
  {
    name: 'Mass-Energy Equivalence',
    latex: 'E = m c^2',
    variables: { m: 1.0, c: 3.0 },
    evaluator: (v) => `E = ${(v.m * Math.pow(v.c * 1e8, 2)).toExponential(3)} \\text{ Joules}`,
  },
  {
    name: 'Kinetic Energy',
    latex: 'K = \\frac{1}{2} m v^2',
    variables: { m: 2.0, v: 10.0 },
    evaluator: (v) => `K = ${(0.5 * v.m * Math.pow(v.v, 2)).toFixed(2)} \\text{ Joules}`,
  },
  {
    name: 'De Broglie Wavelength',
    latex: '\\lambda = \\frac{h}{p} = \\frac{h}{m v}',
    variables: { m: 9.1, v: 2.2 },
    evaluator: (v) => `\\lambda = ${(6.626 / (Math.max(0.1, v.m * v.v))).toFixed(3)} \\times 10^{-10} \\text{ m}`,
  },
];

/**
 * 🧮 Interactive Math Equation Block with Live KaTeX & Variable Sliders
 */
export default function InteractiveMathBlock({
  block,
  onChangeContent,
  onDeleteBlock,
}) {
  const [showSliders, setShowSliders] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic variable state for interactive sliders
  const [vars, setVars] = useState({
    m: 2.5,
    v: 12.0,
    a: 1.5,
    t: 1.0,
    c: 3.0,
  });

  const handleCopy = () => {
    navigator.clipboard?.writeText(block.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSliderChange = (key, val) => {
    setVars((prev) => ({ ...prev, [key]: parseFloat(val) }));
  };

  // Determine active preset or compute general expression if matching
  const activePreset = useMemo(() => {
    const raw = (block.content || '').toLowerCase();
    if (raw.includes('\\psi') || raw.includes('hbar') || raw.includes('schrodinger')) {
      return FORMULA_PRESETS[0];
    }
    if (raw.includes('\\int') || raw.includes('sqrt{\\pi') || raw.includes('gaussian')) {
      return FORMULA_PRESETS[1];
    }
    if (raw.includes('m c^2') || raw.includes('mc^2')) {
      return FORMULA_PRESETS[2];
    }
    if (raw.includes('1}{2} m v^2') || raw.includes('1/2 m v^2')) {
      return FORMULA_PRESETS[3];
    }
    return null;
  }, [block.content]);

  // Evaluated result string in LaTeX
  const evaluatedResult = useMemo(() => {
    if (activePreset && activePreset.evaluator) {
      try {
        return activePreset.evaluator(vars);
      } catch {
        return null;
      }
    }
    // Default dynamic formula preview
    return `Evaluated: m \\cdot v = ${(vars.m * vars.v).toFixed(2)}`;
  }, [activePreset, vars]);

  return (
    <div className="my-3 p-4 bg-white border border-gray-200 rounded-xl shadow-2xs group/math transition-all hover:border-gray-300">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wider">
          <span>🧮</span>
          <span>LaTeX Math Equation (KaTeX Engine)</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Interactive Sliders */}
          <button
            onClick={() => setShowSliders(!showSliders)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer border ${
              showSliders
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'
            }`}
            title="Toggle Live Variable Sliders"
          >
            <span>🎛️</span>
            <span>{showSliders ? 'Hide Sliders' : 'Interactive Sliders'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100 cursor-pointer transition-colors"
            title="Copy LaTeX"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          </button>

          {onDeleteBlock && (
            <button
              onClick={onDeleteBlock}
              className="p-1 text-gray-400 hover:text-rose-600 rounded hover:bg-gray-100 cursor-pointer transition-colors"
              title="Delete Equation"
            >
              <Trash className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* KaTeX Rendered Mathematical Formula Display */}
      <div className="py-4 px-3 text-center bg-gray-50/60 rounded-lg border border-gray-200 shadow-2xs overflow-x-auto min-h-[58px] flex items-center justify-center select-text">
        <KatexEquation math={block.content || ''} displayMode={true} />
      </div>

      {/* Interactive Variable Sliders Panel */}
      {showSliders && (
        <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
              <span>⚡</span> Dynamic Physics Parameters
            </span>
            {evaluatedResult && (
              <div className="px-2 py-0.5 bg-white border border-blue-200 rounded-md text-xs font-mono text-blue-800">
                <KatexEquation math={evaluatedResult} displayMode={false} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Mass (m) Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-gray-600 mb-1">
                <span>Mass (m):</span>
                <span className="font-bold text-gray-900">{vars.m} kg</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={vars.m}
                onChange={(e) => handleSliderChange('m', e.target.value)}
                className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Velocity (v) Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-gray-600 mb-1">
                <span>Velocity (v):</span>
                <span className="font-bold text-gray-900">{vars.v} m/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={vars.v}
                onChange={(e) => handleSliderChange('v', e.target.value)}
                className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Scale / Factor (a) Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-gray-600 mb-1">
                <span>Decay factor (a):</span>
                <span className="font-bold text-gray-900">{vars.a}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={vars.a}
                onChange={(e) => handleSliderChange('a', e.target.value)}
                className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Time (t) Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-gray-600 mb-1">
                <span>Time (t):</span>
                <span className="font-bold text-gray-900">{vars.t} s</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="0.5"
                value={vars.t}
                onChange={(e) => handleSliderChange('t', e.target.value)}
                className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Formula Source Editor Input */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-[10px] font-mono text-gray-400 select-none pl-1">LaTeX:</span>
        <input
          type="text"
          value={block.content || ''}
          onChange={(e) => onChangeContent(e.target.value)}
          placeholder="Type LaTeX formula (e.g. E = m c^2)..."
          className="flex-1 text-xs font-mono text-gray-800 bg-gray-50/70 hover:bg-white focus:bg-white px-3 py-1.5 rounded-md border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 shadow-2xs transition-colors"
        />

        {/* Quick Presets Dropdown */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              onChangeContent(e.target.value);
              e.target.value = '';
            }
          }}
          className="text-[10px] font-mono text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-md px-2 py-1.5 cursor-pointer focus:outline-none"
          defaultValue=""
        >
          <option value="" disabled>
            ⚡ Insert Preset...
          </option>
          {FORMULA_PRESETS.map((p, i) => (
            <option key={i} value={p.latex}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
