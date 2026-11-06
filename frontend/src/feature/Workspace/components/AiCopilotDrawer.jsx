import React, { useState } from 'react';
import { Sparkles, X, Plus } from './WorkspaceIcons';

export default function AiCopilotDrawer({ isOpen, onClose, onInsertText }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAskAi = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:5000/api/ai/circle-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryText: prompt.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI query failed');

      setResponse(data);
    } catch (err) {
      setError(err.message || 'AI generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Drawer Top Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 tracking-tight">AI Copilot & Circle Search</h3>
            <p className="text-[10px] text-gray-500 font-mono">Groq LPU • Gemini Flash-Lite • Turso DB</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Middle Content Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5">
          {['Explain Quantum Entanglement', 'Derive Navier-Stokes', 'Write Python QuickSort', 'What is CRDT sync?'].map(
            (chip) => (
              <button
                key={chip}
                onClick={() => setPrompt(chip)}
                className="text-[11px] bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            )
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="p-6 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500 animate-pulse">Consulting Groq LPU & Turso Edge Cache...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* AI Result Card */}
        {response && response.result && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {response.cached ? `⚡ Turso Edge Cache (${response.hitCount}x hits)` : `✨ ${response.aiEngine || 'Groq LPU'}`}
              </span>
              <span className="text-gray-400">{response.processingTimeMs}ms</span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-900">{response.result.title}</h4>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap">{response.result.explanation}</p>
            </div>

            {response.result.keyPoints && response.result.keyPoints.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-gray-200/60">
                {response.result.keyPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                    <span className="text-blue-500 font-bold">✓</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                onInsertText(`### ${response.result.title}\n${response.result.explanation}`);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert into Current Document</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleAskAi} className="p-3 border-t border-gray-200 bg-white">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI or paste LaTeX / math equation..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-3 pr-10 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

