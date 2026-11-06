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
    { type: 'ai_draft', label: 'Ask AI Copilot', desc: 'Generate with Groq LPU & Gemini', icon: '✨' },
  ];

  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-64 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.y, left: position.x }}
    >
      <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        Slash Commands
      </div>
      <div className="max-h-64 overflow-y-auto py-1">
        {commands.map((cmd) => (
          <button
            key={cmd.type}
            onClick={() => onSelect(cmd.type)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100/80 transition-colors cursor-pointer group"
          >
            <span className="w-6 h-6 rounded flex items-center justify-center bg-gray-100 group-hover:bg-white text-xs font-mono shadow-xs">
              {cmd.icon}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{cmd.label}</p>
              <p className="text-[10px] text-gray-400 truncate">{cmd.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
