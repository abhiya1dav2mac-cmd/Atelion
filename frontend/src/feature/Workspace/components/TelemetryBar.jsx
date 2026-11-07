import React, { useState } from 'react';
import { Copy, Check } from './WorkspaceIcons';

export default function TelemetryBar({ user, activePageId }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const userId = user?.id || '31bd872ba9043c2805';
  const workspaceId = 'eb159cff712b476005';
  const pageId = activePageId ? `40759cff${activePageId.replace('page_', '')}`.slice(0, 18) : '40759cff23ded4f8';

  const handleCopy = (key, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <footer className="h-6 border-t border-[#262626] bg-[#161616] px-3 flex items-center justify-between text-[10px] text-[#666666] font-mono select-none z-30">
      <div className="flex items-center gap-3">
        {/* User Chip */}
        <button
          onClick={() => handleCopy('user', userId)}
          className="flex items-center gap-1 hover:text-[#aaaaaa] transition-colors cursor-pointer"
          title="Click to copy User ID"
        >
          <span className="text-[#888888] font-bold">USER</span>
          <span>{userId.slice(0, 10)}...{userId.slice(-6)}</span>
          {copiedKey === 'user' ? (
            <Check className="w-2.5 h-2.5 text-emerald-400" />
          ) : (
            <Copy className="w-2.5 h-2.5 text-[#555555] hover:text-[#888888]" />
          )}
        </button>

        <span className="text-[#333333]">|</span>

        {/* Workspace Chip */}
        <button
          onClick={() => handleCopy('ws', workspaceId)}
          className="flex items-center gap-1 hover:text-[#aaaaaa] transition-colors cursor-pointer"
          title="Click to copy Workspace ID"
        >
          <span className="text-[#888888] font-bold">WORKSPACE</span>
          <span>{workspaceId.slice(0, 8)}...{workspaceId.slice(-6)}</span>
          {copiedKey === 'ws' ? (
            <Check className="w-2.5 h-2.5 text-emerald-400" />
          ) : (
            <Copy className="w-2.5 h-2.5 text-[#555555] hover:text-[#888888]" />
          )}
        </button>

        <span className="text-[#333333]">|</span>

        {/* Page Chip */}
        <button
          onClick={() => handleCopy('page', pageId)}
          className="flex items-center gap-1 hover:text-[#aaaaaa] transition-colors cursor-pointer"
          title="Click to copy Page ID"
        >
          <span className="text-[#888888] font-bold">PAGE</span>
          <span>{pageId}</span>
          {copiedKey === 'page' ? (
            <Check className="w-2.5 h-2.5 text-emerald-400" />
          ) : (
            <Copy className="w-2.5 h-2.5 text-[#555555] hover:text-[#888888]" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-[#555555]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Turso LibSQL Edge • 0ms</span>
      </div>
    </footer>
  );
}
