import React from 'react';
import {
  BookOpen,
  Mic,
  TrendingUp,
  CheckSquare,
  Layout,
  Trash,
  Settings,
} from './WorkspaceIcons';

export default function AppsMenuModal({
  isOpen,
  onClose,
  onSelectAction,
}) {
  if (!isOpen) return null;

  const items = [
    { id: 'library', label: 'Library', icon: BookOpen, desc: 'Knowledge repositories & docs' },
    { id: 'meeting_notes', label: 'AI Meeting Notes', icon: Mic, desc: 'Voice transcriptions & summaries' },
    { id: 'skills', label: 'Skills', icon: TrendingUp, desc: 'AI agent tools & automations' },
    { id: 'my_tasks', label: 'My Tasks', icon: CheckSquare, desc: 'Assigned sprint items & todos' },
    { id: 'marketplace', label: 'Marketplace', icon: Layout, desc: 'Plugins, MCP servers & templates' },
    { id: 'trash', label: 'Trash', icon: Trash, desc: 'Archived and deleted pages' },
  ];

  return (
    <>
      {/* Invisible backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Floating Apps & Skills Popover (Matching Screenshot 3) */}
      <div
        className="fixed bottom-14 left-44 z-50 w-56 bg-[#202020] border border-[#2f2f2f] rounded-xl shadow-2xl text-[#d4d4d4] text-xs font-sans p-1.5 select-none animate-in fade-in zoom-in-95 duration-100 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-0.5">
          {items.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onClose();
                  if (onSelectAction) onSelectAction(item.id);
                  else alert(`${item.label} opened: ${item.desc}`);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#2a2a2a] text-[#cccccc] hover:text-white transition-colors cursor-pointer text-left group"
              >
                <IconComponent className="w-4 h-4 text-[#888888] group-hover:text-white transition-colors flex-shrink-0" />
                <span className="font-medium text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2a2a2a] my-1.5" />

        <button
          onClick={() => {
            onClose();
            alert('Customize Sidebar: Pin/unpin sections and reorder tabs.');
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#2a2a2a] text-[#888888] hover:text-[#cccccc] transition-colors cursor-pointer text-left text-xs"
        >
          <Settings className="w-4 h-4 text-[#777777]" />
          <span>Customize sidebar</span>
        </button>
      </div>
    </>
  );
}
