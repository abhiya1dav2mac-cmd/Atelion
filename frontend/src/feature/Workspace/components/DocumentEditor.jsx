import React, { useState, useRef } from 'react';
import { Plus, Trash, Sparkles } from './WorkspaceIcons';
import SlashCommandMenu from './SlashCommandMenu';
import DatabaseView from './DatabaseView';

export default function DocumentEditor({
  page,
  onUpdatePage,
  databaseItems,
  onUpdateDatabaseItems,
  onOpenAi,
}) {
  const [slashMenu, setSlashMenu] = useState({ isOpen: false, x: 0, y: 0, targetIndex: null });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const EMOJI_OPTIONS = ['🚀', '⚡', '💡', '📐', '🧪', '🔐', '🗄️', '📊', '🎯', '📝', '🧠', '🛡️'];
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

  return (
    <div className="flex-1 overflow-y-auto bg-white min-h-screen">
      {/* 1. Cover Image Banner */}
      <div
        className="w-full h-40 sm:h-52 relative group transition-all"
        style={{ background: page.cover || COVER_PRESETS[0] }}
      >
        <div className="absolute right-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          {COVER_PRESETS.map((grad, i) => (
            <button
              key={i}
              onClick={() => onUpdatePage(page.id, { cover: grad })}
              className="w-5 h-5 rounded-full border border-white/60 shadow-sm cursor-pointer hover:scale-110 transition-transform"
              style={{ background: grad }}
              title="Change banner color"
            />
          ))}
        </div>
      </div>

      {/* 2. Page Content Container */}
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-6 relative">
        {/* Page Icon Picker */}
        <div className="-mt-16 mb-4 relative inline-block">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-16 h-16 rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center text-3xl hover:scale-105 transition-transform cursor-pointer"
            title="Change icon"
          >
            {page.icon || '📄'}
          </button>

          {showEmojiPicker && (
            <div className="absolute top-20 left-0 bg-white p-2.5 rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-wrap gap-2 w-56 animate-in fade-in duration-100">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onUpdatePage(page.id, { icon: emoji });
                    setShowEmojiPicker(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Page Title Input */}
        <div className="mb-6">
          <input
            type="text"
            value={page.title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
            className="w-full text-2xl sm:text-4xl font-extrabold text-gray-950 border-none focus:outline-none placeholder-gray-300 tracking-tight"
          />
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 font-mono">
            <span>Last edited: {page.updatedAt || 'Just now'}</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Turso Edge Synced (0ms)
            </span>
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
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                  title="Add block below"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteBlock(idx)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"
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
                    className="w-full text-xl sm:text-2xl font-bold text-gray-900 border-none focus:outline-none tracking-tight pt-2"
                  />
                )}

                {block.type === 'heading_2' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockChange(idx, e.target.value)}
                    onKeyDown={(e) => handleBlockKeyDown(e, idx)}
                    className="w-full text-base sm:text-lg font-semibold text-gray-800 border-none focus:outline-none tracking-tight pt-1.5"
                  />
                )}

                {block.type === 'paragraph' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => handleBlockChange(idx, e.target.value)}
                    onKeyDown={(e) => handleBlockKeyDown(e, idx)}
                    rows={Math.max(1, Math.ceil(block.content.length / 80))}
                    className="w-full text-sm text-gray-800 border-none focus:outline-none leading-relaxed resize-none py-1"
                  />
                )}

                {block.type === 'todo' && (
                  <div className="flex items-center gap-2.5 py-1">
                    <input
                      type="checkbox"
                      checked={Boolean(block.checked)}
                      onChange={() => toggleTodo(idx)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      onKeyDown={(e) => handleBlockKeyDown(e, idx)}
                      className={`w-full text-sm border-none focus:outline-none ${
                        block.checked ? 'line-through text-gray-400' : 'text-gray-900 font-medium'
                      }`}
                    />
                  </div>
                )}

                {block.type === 'callout' && (
                  <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl my-2">
                    <span className="text-lg">{block.icon || '💡'}</span>
                    <textarea
                      value={block.content}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      onKeyDown={(e) => handleBlockKeyDown(e, idx)}
                      rows={2}
                      className="w-full text-xs sm:text-sm text-blue-950 bg-transparent border-none focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}

                {block.type === 'code' && (
                  <div className="my-3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs">
                    <div className="px-3 py-1.5 bg-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{block.language || 'code'}</span>
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
                      className="w-full p-3 bg-transparent border-none focus:outline-none text-emerald-400 resize-none leading-relaxed"
                    />
                  </div>
                )}

                {block.type === 'math' && (
                  <div className="my-3 p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                    <div className="text-[10px] font-mono text-amber-700 font-bold mb-1 uppercase tracking-wider">
                      LaTeX Math Equation (KaTeX Engine)
                    </div>
                    <div className="text-base sm:text-lg font-serif text-gray-950 py-2 text-center bg-white rounded-lg border border-amber-100 shadow-xs">
                      $${block.content}$$
                    </div>
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      placeholder="Type LaTeX formula (e.g. E = mc^2)..."
                      className="w-full mt-2 text-xs font-mono text-gray-700 bg-white/80 p-2 rounded border border-amber-200/60 focus:outline-none"
                    />
                  </div>
                )}

                {block.type === 'database' && (
                  <DatabaseView items={databaseItems} onUpdateItems={onUpdateDatabaseItems} />
                )}
              </div>
            </div>
          ))}

          {/* Bottom Add Block Trigger */}
          <button
            onClick={() => handleSlashSelect('paragraph')}
            className="w-full py-2.5 border border-dashed border-gray-200 hover:border-gray-400 rounded-xl text-xs text-gray-400 hover:text-gray-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

