import React, { useState } from 'react';
import { X, Sparkles, Database, FileText } from './WorkspaceIcons';
import { passkeyService } from '../../Auth/service/passkeyService';

/**
 * 👑 REUSABLE PREMIUM CORNER BADGE
 */
export function PremiumBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm border border-amber-300/40 select-none ${className}`}
    >
      <span className="text-[11px]">👑</span>
      <span>PREMIUM</span>
    </span>
  );
}

/**
 * 👑 VERSION HISTORY & TIME MACHINE MODAL
 */
export function VersionHistoryModal({ isOpen, onClose, page, onRestoreVersion }) {
  const [selectedVersionId, setSelectedVersionId] = useState('v_now');
  const [restoredNotice, setRestoredNotice] = useState(false);

  if (!isOpen || !page) return null;

  const mockVersions = [
    {
      id: 'v_now',
      label: 'Current Revision',
      time: 'Just now (Live Autosave)',
      blocksCount: page.blocks?.length || 0,
      author: 'You',
      tag: 'Head',
    },
    {
      id: 'v_1',
      label: 'Sprint Planning Update',
      time: '25 mins ago',
      blocksCount: Math.max(1, (page.blocks?.length || 2) - 1),
      author: 'AI Copilot (Autosave)',
      tag: 'Snapshot',
    },
    {
      id: 'v_2',
      label: 'Formula & LaTeX Equations Sync',
      time: '2 hours ago',
      blocksCount: Math.max(1, (page.blocks?.length || 3) - 2),
      author: 'You',
      tag: 'Milestone',
    },
    {
      id: 'v_3',
      label: 'Original Document Baseline',
      time: 'Yesterday at 04:30 PM',
      blocksCount: 4,
      author: 'System Initializer',
      tag: 'Baseline',
    },
  ];

  const handleRestore = (ver) => {
    onRestoreVersion(ver);
    setRestoredNotice(true);
    setTimeout(() => {
      setRestoredNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#202020] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#333333] relative text-left text-white animate-in zoom-in-95 duration-150 no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Upper Right Corner PREMIUM Badge */}
        <div className="absolute top-5 right-12">
          <PremiumBadge />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2c2c2c] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🕒</span>
          <h3 className="text-lg font-bold">Document Version History</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Time-travel snapshot engine. View and restore any previous state with zero data loss.
        </p>

        {restoredNotice && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <span>✅</span>
            <span>Document restored successfully to snapshot!</span>
          </div>
        )}

        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto no-scrollbar">
          {mockVersions.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVersionId(v.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedVersionId === v.id
                  ? 'border-amber-500/80 bg-amber-500/10'
                  : 'border-[#2d2d2d] bg-[#1a1a1a] hover:border-[#444444]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white">{v.label}</p>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#333333] text-gray-300 font-mono">
                    {v.tag}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {v.time} • by {v.author} • {v.blocksCount} blocks
                </p>
              </div>

              {selectedVersionId === v.id && v.id !== 'v_now' && (
                <button
                  type="button"
                  onClick={() => handleRestore(v)}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Restore
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-[#333333] pt-3">
          <span>Enterprise Unlimited Retention</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 👑 PUBLIC WEB SHARE & GUEST COLLABORATION MODAL
 */
export function SharePublishModal({ isOpen, onClose, page }) {
  const [copied, setCopied] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [allowEditing, setAllowEditing] = useState(false);

  if (!isOpen || !page) return null;

  const publicUrl = `https://atelion.ai/p/${page.id}_${encodeURIComponent(
    page.title?.slice(0, 16).replace(/\s+/g, '-').toLowerCase() || 'note'
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#202020] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#333333] relative text-left text-white animate-in zoom-in-95 duration-150 no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Upper Right Corner PREMIUM Badge */}
        <div className="absolute top-5 right-12">
          <PremiumBadge />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2c2c2c] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🌐</span>
          <h3 className="text-lg font-bold">Publish to Web & Share Link</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Instantly publish this document to the edge with custom SEO metadata and sub-millisecond Turso replication.
        </p>

        {/* Live Link Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">Public Edge URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="flex-1 px-3 py-2 text-xs bg-[#151515] border border-[#333333] rounded-xl text-gray-200 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-black'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Permissions Toggles */}
        <div className="space-y-3 mb-6 bg-[#161616] p-4 rounded-xl border border-[#2b2b2b]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Live Public Edge CDN</p>
              <p className="text-[11px] text-gray-400">Anyone with the URL can view without signing in</p>
            </div>
            <button
              onClick={() => setIsPublished(!isPublished)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                isPublished ? 'bg-amber-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                  isPublished ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
            <div>
              <p className="text-xs font-bold text-white">Allow Public Guest Edits</p>
              <p className="text-[11px] text-gray-400">Collaborative live typing for link recipients</p>
            </div>
            <button
              onClick={() => setAllowEditing(!allowEditing)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                allowEditing ? 'bg-amber-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                  allowEditing ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-900 font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 👑 MULTI-FORMAT WORKSPACE EXPORT ENGINE
 */
export function ExportModal({ isOpen, onClose, page }) {
  const [downloading, setDownloading] = useState(null);

  if (!isOpen || !page) return null;

  const downloadFile = (filename, content, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    setDownloading('md');
    let md = `# ${page.title}\n\n`;
    page.blocks?.forEach((b) => {
      if (b.type === 'heading_1') md += `## ${b.content}\n\n`;
      else if (b.type === 'heading_2') md += `### ${b.content}\n\n`;
      else if (b.type === 'todo') md += `- [${b.checked ? 'x' : ' '}] ${b.content}\n`;
      else if (b.type === 'code') md += `\`\`\`${b.language || 'text'}\n${b.content}\n\`\`\`\n\n`;
      else if (b.type === 'math') md += `$$\n${b.content}\n$$\n\n`;
      else if (b.type === 'callout') md += `> 💡 ${b.content}\n\n`;
      else md += `${b.content}\n\n`;
    });
    downloadFile(`${page.title.replace(/\s+/g, '_')}.md`, md, 'text/markdown');
    setTimeout(() => {
      setDownloading(null);
      onClose();
    }, 500);
  };

  const handleExportHtml = () => {
    setDownloading('html');
    let body = `<h1>${page.title}</h1>`;
    page.blocks?.forEach((b) => {
      if (b.type === 'heading_1') body += `<h2>${b.content}</h2>`;
      else if (b.type === 'heading_2') body += `<h3>${b.content}</h3>`;
      else if (b.type === 'todo')
        body += `<div><input type="checkbox" ${b.checked ? 'checked' : ''} disabled /> ${b.content}</div>`;
      else if (b.type === 'code') body += `<pre><code>${b.content}</code></pre>`;
      else if (b.type === 'math') body += `<div style="font-family: monospace;">[LaTeX] ${b.content}</div>`;
      else if (b.type === 'callout')
        body += `<div style="padding: 12px; background: #f0fdf4; border-left: 4px solid #22c55e;">${b.content}</div>`;
      else body += `<p>${b.content}</p>`;
    });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${page.title}</title><style>body{font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #111;} pre{background: #f4f4f4; padding: 12px; border-radius: 8px;}</style></head><body>${body}</body></html>`;
    downloadFile(`${page.title.replace(/\s+/g, '_')}.html`, html, 'text/html');
    setTimeout(() => {
      setDownloading(null);
      onClose();
    }, 500);
  };

  const handleExportJson = () => {
    setDownloading('json');
    downloadFile(
      `${page.title.replace(/\s+/g, '_')}_ast.json`,
      JSON.stringify(page, null, 2),
      'application/json'
    );
    setTimeout(() => {
      setDownloading(null);
      onClose();
    }, 500);
  };

  const handlePrintPdf = () => {
    window.print();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#202020] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#333333] relative text-left text-white animate-in zoom-in-95 duration-150 no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Upper Right Corner PREMIUM Badge */}
        <div className="absolute top-5 right-12">
          <PremiumBadge />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2c2c2c] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">📥</span>
          <h3 className="text-lg font-bold">Export Document</h3>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Enterprise multi-format export. Download your notes with full LaTeX and block preservation.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleExportMarkdown}
            className="p-3.5 bg-[#181818] hover:bg-[#262626] border border-[#333333] rounded-xl text-left transition-colors cursor-pointer"
          >
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>📄</span> Markdown (.md)
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Obsidian & GitHub standard</p>
          </button>

          <button
            onClick={handleExportHtml}
            className="p-3.5 bg-[#181818] hover:bg-[#262626] border border-[#333333] rounded-xl text-left transition-colors cursor-pointer"
          >
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>🌐</span> Web HTML (.html)
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Standalone web package</p>
          </button>

          <button
            onClick={handlePrintPdf}
            className="p-3.5 bg-[#181818] hover:bg-[#262626] border border-[#333333] rounded-xl text-left transition-colors cursor-pointer"
          >
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>🖨️</span> Printable PDF
            </p>
            <p className="text-[10px] text-gray-400 mt-1">High-res vector print format</p>
          </button>

          <button
            onClick={handleExportJson}
            className="p-3.5 bg-[#181818] hover:bg-[#262626] border border-[#333333] rounded-xl text-left transition-colors cursor-pointer"
          >
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>🗄️</span> Raw AST (.json)
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Full database blocks tree</p>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2c2c2c] hover:bg-[#383838] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 👑 BI-DIRECTIONAL KNOWLEDGE GRAPH VISUALIZER MODAL
 */
export function KnowledgeGraphModal({ isOpen, onClose, pages, onSelectPage }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1c1c1c] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#333333] relative text-left text-white animate-in zoom-in-95 duration-150 no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Upper Right Corner PREMIUM Badge */}
        <div className="absolute top-5 right-12">
          <PremiumBadge />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2c2c2c] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🕸️</span>
          <h3 className="text-lg font-bold">Interactive 3D Knowledge Graph</h3>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Visualizing bi-directional links, relational databases, and cross-document references.
        </p>

        {/* Visual Graph Nodes Mesh */}
        <div className="h-72 bg-[#121212] rounded-xl border border-[#2b2b2b] relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#amber-500_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="flex flex-wrap items-center justify-center gap-4 p-6 z-10">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPage(p.id);
                  onClose();
                }}
                className="group p-3 rounded-2xl bg-[#222222] border-2 border-amber-500/40 hover:border-amber-400 shadow-lg cursor-pointer hover:scale-105 transition-all text-center flex flex-col items-center max-w-[130px]"
              >
                <span className="text-2xl mb-1">{p.icon || '📄'}</span>
                <p className="text-[11px] font-bold text-white truncate w-full group-hover:text-amber-400">
                  {p.title}
                </p>
                <span className="text-[9px] text-amber-500/80 mt-0.5 font-mono">
                  {p.blocks?.length || 0} blocks
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-4">
          <span>Click any node to navigate instantly</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-lg cursor-pointer"
          >
            Close Graph
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 👑 BIOMETRIC PASSKEY ENROLLMENT MODAL
 */
export function PasskeyEnrollModal({ isOpen, onClose, user }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  if (!isOpen) return null;

  const handleEnroll = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const email = user?.email || 'user@workspace.io';
      await passkeyService.registerPasskey(email, 'Hardware Biometric Token');
      setStatus({ type: 'success', msg: 'Biometric passkey enrolled successfully! You can now log in with Face ID or Touch ID.' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Enrollment cancelled or failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#202020] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#333333] relative text-left text-white animate-in zoom-in-95 duration-150 no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Upper Right Corner PREMIUM Badge */}
        <div className="absolute top-5 right-12">
          <PremiumBadge />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2c2c2c] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🔐</span>
          <h3 className="text-lg font-bold">FIDO2 Biometric Passkey</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Replace passwords with native Apple Face ID, Touch ID, or Windows Hello. Zero phishing risk.
        </p>

        {status && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
              status.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/80 border border-red-500/50 text-red-300'
            }`}
          >
            {status.msg}
          </div>
        )}

        <div className="bg-[#151515] p-4 rounded-xl border border-[#2c2c2c] mb-6 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Account:</span>
            <span className="font-semibold text-white">{user?.email || 'current_user'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Security Standard:</span>
            <span className="font-mono text-amber-400">WebAuthn Level 3 (ES256)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Device Hardware:</span>
            <span className="text-gray-200">Secure Enclave / TPM 2.0</span>
          </div>
        </div>

        <button
          onClick={handleEnroll}
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Initiating Sensor...' : '⚡ Enroll This Device with Touch ID / Face ID'}
        </button>
      </div>
    </div>
  );
}
