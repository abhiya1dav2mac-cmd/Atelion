import React, { useState, useRef } from 'react';
import { Plus, Trash, Sparkles } from './WorkspaceIcons';
import SlashCommandMenu from './SlashCommandMenu';
import DatabaseView from './DatabaseView';
import { PremiumBadge } from './PremiumModals';

export default function DocumentEditor({
  page,
  onUpdatePage,
  databaseItems,
  onUpdateDatabaseItems,
  onOpenAi,
  onOpenPremium,
}) {
  const [slashMenu, setSlashMenu] = useState({ isOpen: false, x: 0, y: 0, targetIndex: null });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAiBusy, setIsAiBusy] = useState(false);

  const EMOJI_OPTIONS = ['📈', '🚀', '⚡', '💡', '🎙️', '🎯', '💬', '🪙', '🗄️', '🧪', '🔐', '📊'];
  const COVER_PRESETS = [
    'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #3B82F6 100%)',
    'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)',
    'linear-gradient(135deg, #042F2E 0%, #0F766E 50%, #14B8A6 100%)',
    'linear-gradient(135deg, #450A0A 0%, #991B1B 50%, #DC2626 100%)',
    'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
  ];

  const handleTitleChange = (e) => {
    onUpdatePage(page.id, { title: e.target.value });
  };

  const handleBlockChange = (index, content) => {
    const updatedBlocks = [...page.blocks];
    updatedBlocks[index].content = content;
    onUpdatePage(page.id, { blocks: updatedBlocks });
  };

  const toggleTodo = (index) => {
    const updatedBlocks = [...page.blocks];
    updatedBlocks[index].checked = !updatedBlocks[index].checked;
    onUpdatePage(page.id, { blocks: updatedBlocks });
  };

  const deleteBlock = (index) => {
    const updatedBlocks = page.blocks.filter((_, i) => i !== index);
    onUpdatePage(page.id, { blocks: updatedBlocks });
  };

  const handleBlockKeyDown = (e, index) => {
    if (e.key === '/') {
      const rect = e.target.getBoundingClientRect();
      setSlashMenu({
        isOpen: true,
        x: Math.min(rect.left, window.innerWidth - 270),
        y: rect.bottom + 8,
        targetIndex: index,
      });
    }
  };

  const handleSlashSelect = (commandType) => {
    setSlashMenu({ isOpen: false, x: 0, y: 0, targetIndex: null });
    const targetIdx = slashMenu.targetIndex ?? page.blocks.length;

    let newBlock;
    switch (commandType) {
      case 'heading_1':
        newBlock = { id: 'b_' + Date.now(), type: 'heading_1', content: 'Section Heading' };
        break;
      case 'heading_2':
        newBlock = { id: 'b_' + Date.now(), type: 'heading_2', content: 'Subsection Heading' };
        break;
      case 'todo':
        newBlock = { id: 'b_' + Date.now(), type: 'todo', content: 'New checklist task', checked: false };
        break;
      case 'code':
        newBlock = { id: 'b_' + Date.now(), type: 'code', content: '// Write source code here\nconsole.log("Atelion Running");', language: 'javascript' };
        break;
      case 'math':
        newBlock = { id: 'b_' + Date.now(), type: 'math', content: 'E = mc^2' };
        break;
      case 'callout':
        newBlock = { id: 'b_' + Date.now(), type: 'callout', content: 'Important note or executive insight...', icon: '💡' };
        break;
      case 'database':
        newBlock = { id: 'b_' + Date.now(), type: 'database' };
        break;
      case 'pdf_embed':
        newBlock = {
          id: 'b_' + Date.now(),
          type: 'pdf_embed',
          title: 'Quantum_Field_Theory_Lecture_Notes.pdf',
        };
        break;
      case 'backlink':
        newBlock = {
          id: 'b_' + Date.now(),
          type: 'backlink',
          content: 'Master Sprint & Project Database',
        };
        break;
      case 'formula_calc':
        newBlock = {
          id: 'b_' + Date.now(),
          type: 'formula_calc',
          content: 'format(round(prop("SprintProgress") * 100), "0%") + " [COMPLETED]"',
        };
        break;
      case 'ai_draft':
        onOpenAi();
        return;
      case 'paragraph':
      default:
        newBlock = { id: 'b_' + Date.now(), type: 'paragraph', content: 'New paragraph block...' };
        break;
    }

    const updatedBlocks = [...page.blocks];
    updatedBlocks.splice(targetIdx + 1, 0, newBlock);
    onUpdatePage(page.id, { blocks: updatedBlocks });
  };

  const handleAiAction = (actionType) => {
    setIsAiBusy(true);
    let newBlocks = [...page.blocks];

    if (actionType === 'summarize') {
      const summaryBlock = {
        id: 'b_sum_' + Date.now(),
        type: 'callout',
        icon: '✨',
        content: `👑 AI Executive Summary (${page.title}):\n• Core Architecture: Zero-egress local-first CRDT synchronization\n• Security: WebAuthn Level 3 FIDO2 Biometric Passkeys (ES256)\n• Edge Performance: <2ms latency via Turso Edge multi-region replica`,
      };
      newBlocks.unshift(summaryBlock);
    } else if (actionType === 'improve') {
      newBlocks = newBlocks.map((b) => {
        if (b.type === 'paragraph') {
          return {
            ...b,
            content: `[Polished by Notion AI] ${b.content.replace(/^\[Polished by Notion AI\]\s*/, '')}`,
          };
        }
        return b;
      });
    } else if (actionType === 'action_items') {
      const todos = [
        { id: 'b_t1_' + Date.now(), type: 'todo', content: 'Audit production FIDO2 biometric passkey challenge lifecycle', checked: true },
        { id: 'b_t2_' + Date.now(), type: 'todo', content: 'Verify strict disposable email blocking regex and domain lists', checked: true },
        { id: 'b_t3_' + Date.now(), type: 'todo', content: 'Synchronize 3D Knowledge Graph with relational database blocks', checked: false },
      ];
      newBlocks = [...newBlocks, ...todos];
    } else if (actionType === 'translate') {
      const translatedBlock = {
        id: 'b_trans_' + Date.now(),
        type: 'callout',
        icon: '🌐',
        content: `👑 बहुभाषी अनुवाद (Multilingual AI Engine):\nयह दस्तावेज़ "${page.title}" के सभी तकनीकी पहलुओं को सुरक्षित, तेज़ और प्रामाणिक रूप से प्रस्तुत करता है। बायोमेट्रिक पासकी और शून्य-विलंबता डेटाबेस सक्रिय हैं।`,
      };
      newBlocks.push(translatedBlock);
    }

    onUpdatePage(page.id, { blocks: newBlocks });
    setTimeout(() => setIsAiBusy(false), 400);
  };

  return (
    <div
      className="flex-1 overflow-y-auto no-scrollbar bg-[#191919] text-[#e6e6e6] min-h-screen"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* 1. Cover Image Banner */}
      <div
        className="w-full h-36 sm:h-48 relative group transition-all"
        style={{ background: page.cover || COVER_PRESETS[0] }}
      >
        <div className="absolute right-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          {COVER_PRESETS.map((grad, i) => (
            <button
              key={i}
              onClick={() => onUpdatePage(page.id, { cover: grad })}
              className="w-5 h-5 rounded-full border border-white/40 shadow-sm cursor-pointer hover:scale-110 transition-transform"
              style={{ background: grad }}
              title="Change banner color"
            />
          ))}
        </div>
      </div>

      {/* 2. Page Content Container */}
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-6 relative">
        {/* Upper Right Corner PREMIUM Controls */}
        <div className="absolute top-4 right-6 sm:right-12 flex items-center gap-2 z-10">
          <PremiumBadge />
          <div className="flex items-center gap-1 bg-[#222222] p-1 rounded-xl border border-[#333333] shadow-md">
            <button
              onClick={() => onOpenPremium && onOpenPremium('history')}
              className="p-1.5 hover:bg-[#2e2e2e] text-gray-300 hover:text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Time Machine Version History"
            >
              <span>🕒</span>
              <span className="hidden md:inline">History</span>
            </button>
            <button
              onClick={() => onOpenPremium && onOpenPremium('share')}
              className="p-1.5 hover:bg-[#2e2e2e] text-gray-300 hover:text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Public Web Share Link"
            >
              <span>🌐</span>
              <span className="hidden md:inline">Share</span>
            </button>
            <button
              onClick={() => onOpenPremium && onOpenPremium('export')}
              className="p-1.5 hover:bg-[#2e2e2e] text-gray-300 hover:text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Export Markdown/HTML/PDF"
            >
              <span>📥</span>
              <span className="hidden md:inline">Export</span>
            </button>
            <button
              onClick={() => onOpenPremium && onOpenPremium('graph')}
              className="p-1.5 hover:bg-[#2e2e2e] text-gray-300 hover:text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="3D Knowledge Graph"
            >
              <span>🕸️</span>
              <span className="hidden md:inline">Graph</span>
            </button>
            <button
              onClick={() => onOpenPremium && onOpenPremium('passkey')}
              className="p-1.5 hover:bg-[#2e2e2e] text-gray-300 hover:text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Enroll Biometric Passkey"
            >
              <span>🔐</span>
              <span className="hidden md:inline">Passkey</span>
            </button>
          </div>
        </div>

        {/* Page Icon Picker */}
        <div className="-mt-14 mb-4 relative inline-block">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-14 h-14 rounded-2xl bg-[#222222] shadow-xl border border-[#333333] flex items-center justify-center text-2xl hover:scale-105 transition-transform cursor-pointer"
            title="Change icon"
          >
            {page.icon || '📄'}
          </button>

          {showEmojiPicker && (
            <div className="absolute top-16 left-0 bg-[#222222] p-2.5 rounded-2xl shadow-2xl border border-[#333333] z-40 flex flex-wrap gap-2 w-56 animate-in fade-in duration-100">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onUpdatePage(page.id, { icon: emoji });
                    setShowEmojiPicker(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-[#2c2c2c] rounded-lg cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Page Title Input */}
        <div className="mb-4">
          <input
            type="text"
            value={page.title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
            className="w-full text-2xl sm:text-4xl font-extrabold text-white bg-transparent border-none focus:outline-none placeholder-[#555555] tracking-tight"
          />
          <div className="flex items-center gap-3 mt-2 text-xs text-[#666666] font-mono">
            <span>Last edited: {page.updatedAt || 'Just now'}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Turso Edge Synced (0ms)
            </span>
          </div>
        </div>

        {/* 👑 Notion AI Premium Power Bar */}
        <div className="mb-6 p-2.5 bg-[#202020] border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">✨</span>
            <span className="text-xs font-bold text-white tracking-wide">Notion AI Premium</span>
            <PremiumBadge className="scale-90" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleAiAction('summarize')}
              disabled={isAiBusy}
              className="px-2.5 py-1 bg-[#2c2c2c] hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/50 text-gray-300 border border-[#3a3a3a] rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              📝 1-Click Summary
            </button>
            <button
              onClick={() => handleAiAction('improve')}
              disabled={isAiBusy}
              className="px-2.5 py-1 bg-[#2c2c2c] hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/50 text-gray-300 border border-[#3a3a3a] rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              ✍️ Polish & Grammar
            </button>
            <button
              onClick={() => handleAiAction('action_items')}
              disabled={isAiBusy}
              className="px-2.5 py-1 bg-[#2c2c2c] hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/50 text-gray-300 border border-[#3a3a3a] rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              ☑️ Extract Todos
            </button>
            <button
              onClick={() => handleAiAction('translate')}
              disabled={isAiBusy}
              className="px-2.5 py-1 bg-[#2c2c2c] hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/50 text-gray-300 border border-[#3a3a3a] rounded-lg text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              🌐 Translate (Hindi / Multi)
            </button>
          </div>
        </div>

        {/* Blocks List */}
        <div className="space-y-3 pb-32">
          {page.blocks.map((block, idx) => (
            <div key={block.id} className="group relative flex items-start gap-2">
              {/* Drag / Plus handle on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 pt-1 -ml-7 select-none">
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setSlashMenu({
                      isOpen: true,
                      x: rect.right + 8,
                      y: rect.top,
                      targetIndex: idx,
                    });
                  }}
                  className="p-1 text-[#666666] hover:text-white hover:bg-[#282828] rounded cursor-pointer"
                  title="Add block below"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteBlock(idx)}
                  className="p-1 text-[#666666] hover:text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                  title="Delete block"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Render Block based on Type */}
              <div className="flex-1 min-w-0">
                {block.type === 'heading_1' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockChange(idx, e.target.value)}
                    onKeyDown={(e) => handleBlockKeyDown(e, idx)}
                    className="w-full text-xl sm:text-2xl font-bold text-white bg-transparent border-none focus:outline-none tracking-tight pt-2"
                  />
                )}

                {block.type === 'heading_2' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockChange(idx, e.target.value)}
                    onKeyDown={(e) => handleBlockKeyDown(e, idx)}
                    className="w-full text-base sm:text-lg font-semibold text-[#eeeeee] bg-transparent border-none focus:outline-none tracking-tight pt-1.5"
                  />
                )}

                {block.type === 'paragraph' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => handleBlockChange(idx, e.target.value)}
                    onKeyDown={(e) => handleBlockKeyDown(e, idx)}
                    rows={Math.max(1, Math.ceil(block.content.length / 80))}
                    className="w-full text-sm text-[#cccccc] bg-transparent border-none focus:outline-none leading-relaxed resize-none py-1"
                  />
                )}

                {block.type === 'todo' && (
                  <div className="flex items-center gap-2.5 py-1">
                    <input
                      type="checkbox"
                      checked={Boolean(block.checked)}
                      onChange={() => toggleTodo(idx)}
                      className="w-4 h-4 rounded bg-[#262626] border-[#3a3a3a] text-blue-500 focus:ring-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      onKeyDown={(e) => handleBlockKeyDown(e, idx)}
                      className={`w-full text-sm bg-transparent border-none focus:outline-none ${
                        block.checked ? 'line-through text-[#666666]' : 'text-[#dddddd] font-medium'
                      }`}
                    />
                  </div>
                )}

                {block.type === 'callout' && (
                  <div className="flex items-start gap-3 p-3.5 bg-[#202020] border border-[#2e2e2e] rounded-xl my-2">
                    <span className="text-lg">{block.icon || '💡'}</span>
                    <textarea
                      value={block.content}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      onKeyDown={(e) => handleBlockKeyDown(e, idx)}
                      rows={Math.max(2, block.content.split('\n').length)}
                      className="w-full text-xs sm:text-sm text-[#e0e0e0] bg-transparent border-none focus:outline-none resize-none leading-relaxed font-mono"
                    />
                  </div>
                )}

                {block.type === 'code' && (
                  <div className="my-3 rounded-xl overflow-hidden bg-[#141414] border border-[#262626] text-slate-100 font-mono text-xs">
                    <div className="px-3 py-1.5 bg-[#1e1e1e] text-[10px] text-[#777777] flex items-center justify-between border-b border-[#262626]">
                      <span>{block.language || 'javascript'}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(block.content)}
                        className="hover:text-white cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <textarea
                      value={block.content}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      rows={Math.max(3, block.content.split('\n').length)}
                      className="w-full p-3 bg-transparent border-none focus:outline-none text-[#4ade80] resize-none leading-relaxed"
                    />
                  </div>
                )}

                {block.type === 'math' && (
                  <div className="my-3 p-4 bg-[#202020] border border-[#2d2d2d] rounded-xl">
                    <div className="text-[10px] font-mono text-[#fde047] font-bold mb-1 uppercase tracking-wider">
                      LaTeX Math Equation (KaTeX Engine)
                    </div>
                    <div className="text-base sm:text-lg font-serif text-white py-2 text-center bg-[#171717] rounded-lg border border-[#262626] shadow-xs">
                      $${block.content}$$
                    </div>
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      placeholder="Type LaTeX formula (e.g. E = mc^2)..."
                      className="w-full mt-2 text-xs font-mono text-[#cccccc] bg-[#1a1a1a] p-2 rounded border border-[#2e2e2e] focus:outline-none"
                    />
                  </div>
                )}

                {block.type === 'database' && (
                  <DatabaseView items={databaseItems} onUpdateItems={onUpdateDatabaseItems} />
                )}

                {block.type === 'pdf_embed' && (
                  <div className="my-3 p-4 bg-[#202020] border border-amber-500/40 rounded-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📎</span>
                        <div>
                          <p className="text-xs font-bold text-white">{block.title || 'PDF Document & Research Vault'}</p>
                          <p className="text-[10px] text-gray-400">Embedded Edge File Storage • 2.4 MB</p>
                        </div>
                      </div>
                      <PremiumBadge />
                    </div>
                    <div className="bg-[#141414] p-3 rounded-lg border border-[#2a2a2a] text-xs text-gray-300 font-mono flex items-center justify-between">
                      <span>📄 {block.title || 'Quantum_Physics_Lecture_Notes.pdf'}</span>
                      <button
                        onClick={() => alert(`Opening PDF Document: ${block.title || 'Quantum_Physics_Lecture_Notes.pdf'}`)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-[11px] rounded cursor-pointer"
                      >
                        View PDF
                      </button>
                    </div>
                  </div>
                )}

                {block.type === 'backlink' && (
                  <div className="my-2.5 p-3 bg-[#1e1e1e] border-l-4 border-amber-500 rounded-r-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-amber-400">🔗</span>
                      <span className="text-gray-400">Wiki Backlink:</span>
                      <span className="font-bold text-white hover:underline cursor-pointer">
                        [[{block.content || 'Master Sprint & Project Database'}]]
                      </span>
                    </div>
                    <PremiumBadge />
                  </div>
                )}

                {block.type === 'formula_calc' && (
                  <div className="my-3 p-3.5 bg-[#1b1b1b] border border-amber-500/40 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-mono text-sm">⚡</span>
                        <span className="text-xs font-bold text-white">Formulas 2.0 Dynamic Calculation</span>
                      </div>
                      <PremiumBadge />
                    </div>
                    <div className="p-2.5 bg-[#121212] rounded-lg border border-[#282828] font-mono text-xs text-emerald-400 flex items-center justify-between">
                      <span>{block.content || 'format(round(prop("SprintProgress") * 100), "0%") + " [COMPLETED]"'}</span>
                      <span className="text-amber-300 font-bold">➔ 94% [COMPLETED]</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Bottom Add Block Trigger */}
          <button
            onClick={() => handleSlashSelect('paragraph')}
            className="w-full py-2.5 border border-dashed border-[#2a2a2a] hover:border-[#444444] rounded-xl text-xs text-[#666666] hover:text-[#aaaaaa] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Click to add a block, or type "/" for commands</span>
          </button>
        </div>
      </div>

      {/* Floating Slash Commands Menu */}
      {slashMenu.isOpen && (
        <SlashCommandMenu
          position={{ x: slashMenu.x, y: slashMenu.y }}
          onSelect={handleSlashSelect}
          onClose={() => setSlashMenu({ isOpen: false, x: 0, y: 0, targetIndex: null })}
        />
      )}
    </div>
  );
}
