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
    { type: 'code', label: 'Code Snippet', desc: 'Syntax highlighted code container', icon: '💻' },
    { type: 'math', label: 'LaTeX Math Formula', desc: 'Mathematical equation with KaTeX', icon: '🧮' },
    { type: 'callout', label: 'Callout Box', desc: 'Highlighted visual tip or note', icon: '💡' },
    { type: 'database', label: 'Multi-View Database', desc: 'Table, Kanban and Gallery grid', icon: '🗄️' },
    { type: 'ai_draft', label: 'Ask AI Copilot', desc: 'Generate with Groq LPU & Gemini', icon: '✨', premium: true },
    { type: 'pdf_embed', label: 'PDF & Media Vault', desc: 'Embed PDF, Figma or media file', icon: '📎', premium: true },
    { type: 'backlink', label: 'Wiki Page Backlink', desc: 'Link to another workspace page [[', icon: '🔗', premium: true },
    { type: 'formula_calc', label: 'Formulas 2.0 Calculation', desc: 'Compute dynamic formulas & rollups', icon: '⚡', premium: true },
  ];

  return (
    <div
      className="fixed z-50 bg-[#202020] rounded-xl shadow-2xl border border-[#333333] w-64 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100 text-[#d4d4d4] font-sans no-scrollbar"
      style={{ top: position.y, left: position.x, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div className="px-3 py-1.5 border-b border-[#2c2c2c] text-[10px] font-bold text-[#777777] uppercase tracking-wider">
        Slash Commands
      </div>
      <div className="max-h-64 overflow-y-auto no-scrollbar py-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {commands.map((cmd) => (
          <button
            key={cmd.type}
            onClick={() => onSelect(cmd.type)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#2c2c2c] transition-colors cursor-pointer group"
          >
            <span className="w-6 h-6 rounded flex items-center justify-center bg-[#292929] group-hover:bg-[#333333] text-xs font-mono shadow-xs text-white">
              {cmd.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white leading-tight">{cmd.label}</p>
                {cmd.premium && (
                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded font-mono shadow-xs">
                    👑 PREMIUM
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#777777] truncate">{cmd.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
