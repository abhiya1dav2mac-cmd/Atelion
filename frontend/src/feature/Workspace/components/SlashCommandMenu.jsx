import React from 'react';
import {
  FileText,
  CheckSquare,
  Code,
  Sparkles,
  Database,
} from './WorkspaceIcons';

export default function SlashCommandMenu({ position, onSelect, onClose }) {
  const commands = [
    { type: 'paragraph', label: 'Text', desc: 'Plain writing block', icon: '📝' },
    { type: 'heading_1', label: 'Heading 1', desc: 'Large section heading', icon: 'H1' },
    { type: 'heading_2', label: 'Heading 2', desc: 'Medium subsection heading', icon: 'H2' },
    { type: 'todo', label: 'To-do List', desc: 'Interactive task checkbox', icon: '☑️' },
    { type: 'code', label: 'Live Code Runner', desc: 'Executable JS, Python, SQL sandbox', icon: '▶️' },
    { type: 'math', label: 'LaTeX Math Equation', desc: 'KaTeX formula with dynamic sliders', icon: '🧮' },
    { type: 'callout', label: 'Callout Box', desc: 'Highlighted visual tip or note', icon: '💡' },
    { type: 'database', label: 'Multi-View Database', desc: 'Table, Kanban and Gallery grid', icon: '🗄️' },
    { type: 'ai_draft', label: 'Ask AI Copilot', desc: 'Generate with Groq LPU & Gemini', icon: '✨', premium: true },
    { type: 'pdf_embed', label: 'PDF & Media Vault', desc: 'Embed PDF, Figma or media file', icon: '📎', premium: true },
    { type: 'backlink', label: 'Wiki Page Backlink', desc: 'Link to another workspace page [[', icon: '🔗', premium: true },
    { type: 'formula_calc', label: 'Formulas 2.0 Calculation', desc: 'Compute dynamic formulas & rollups', icon: '⚡', premium: true },
  ];

  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-64 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100 text-gray-800 font-sans no-scrollbar"
      style={{ top: position.y, left: position.x, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        Slash Commands
      </div>
      <div className="max-h-64 overflow-y-auto no-scrollbar py-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {commands.map((cmd) => (
          <button
            key={cmd.type}
            onClick={() => onSelect(cmd.type)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 transition-colors cursor-pointer group"
          >
            <span className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 border border-gray-200 text-xs font-mono shadow-2xs text-gray-800">
              {cmd.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-900 leading-tight">{cmd.label}</p>
                {cmd.premium && (
                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded font-mono shadow-xs">
                    👑 PREMIUM
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 truncate">{cmd.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
