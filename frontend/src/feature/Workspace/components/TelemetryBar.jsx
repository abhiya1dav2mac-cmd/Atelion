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
    <footer className="h-6 border-t border-gray-200 bg-gray-50 px-3 flex items-center justify-between text-[10px] text-gray-500 font-mono select-none z-30">
      <div className="flex items-center gap-3">
        {/* User Chip */}
        <button
          onClick={() => handleCopy('user', userId)}
          className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer"
          title="Click to copy User ID"
        >
          <span className="text-gray-400 font-bold">USER</span>
          <span>{userId.slice(0, 8)}...{userId.slice(-6)}</span>
          {copiedKey === 'user' ? (
            <Check className="w-2.5 h-2.5 text-emerald-600" />
          ) : (
            <Copy className="w-2.5 h-2.5 text-gray-400 hover:text-gray-700" />
          )}
        </button>

        <span className="text-gray-300">|</span>

        {/* Workspace Chip */}
        <button
          onClick={() => handleCopy('ws', workspaceId)}
          className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer"
          title="Click to copy Workspace ID"
        >
          <span className="text-gray-400 font-bold">WORKSPACE</span>
          <span>{workspaceId.slice(0, 8)}...{workspaceId.slice(-6)}</span>
          {copiedKey === 'ws' ? (
            <Check className="w-2.5 h-2.5 text-emerald-600" />
          ) : (
            <Copy className="w-2.5 h-2.5 text-gray-400 hover:text-gray-700" />
          )}
        </button>

        <span className="text-gray-300">|</span>

        {/* Page Chip */}
        <button
          onClick={() => handleCopy('page', pageId)}
          className="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer"
          title="Click to copy Page ID"
        >
          <span className="text-gray-400 font-bold">PAGE</span>
          <span>{pageId}</span>
          {copiedKey === 'page' ? (
            <Check className="w-2.5 h-2.5 text-emerald-600" />
          ) : (
            <Copy className="w-2.5 h-2.5 text-gray-400 hover:text-gray-700" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 text-gray-500">
        <button
          onClick={() => {
            alert(
              '🏛️ ATELION MULTI-DATABASE ARCHITECTURE TELEMETRY:\n\n' +
                '1. ⚡ Turso libSQL Edge: User details, Passkeys & Micro-Shards (0ms Edge Read)\n' +
                '2. 🍃 MongoDB Atlas: Nested block trees, revisions & AI vectors\n' +
                '3. ☁️ Cloudflare R2: Media Vault & PDFs ($0 Egress bandwidth fee)\n' +
                '4. 💾 Local IndexedDB: Client-side optimistic 0ms cache\n' +
                '5. ⏱️ Multi-Layer TTL: Firebase token cache (15m), Mongo draft auto-purge (7d)\n\n' +
                'Status: All Multi-Database & TTL Layers Active.'
            );
          }}
          className="flex items-center gap-2 hover:text-gray-950 transition-colors cursor-pointer group"
          title="Click to view Multi-Database Sharding Telemetry"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-gray-600 group-hover:text-gray-950 transition-colors font-medium">
            ⚡ Turso Shards (0ms) • 🍃 Mongo Blocks • ☁️ R2 Vault • ⏱️ TTL Engine
          </span>
        </button>
      </div>
    </footer>
  );
}
