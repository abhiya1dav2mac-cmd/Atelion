import React, { useState, useRef, useEffect } from 'react';
import DocumentEditor from './DocumentEditor';
import { X, Sparkles, ChevronRight, Pin } from './WorkspaceIcons';

/**
 * 🪟 SplitEditorPane
 * Side-by-Side Dual Document & Scratchpad Editor with Smooth Draggable Divider
 */
export default function SplitEditorPane({
  pages,
  primaryPage,
  onUpdatePrimaryPage,
  databaseItems,
  onUpdateDatabaseItems,
  onOpenAi,
  onOpenPremium,
  onOpenPdfReader,
  onOpenCircleSearch,
  onCloseSplit,
}) {
  const [secondaryPageId, setSecondaryPageId] = useState(() => {
    const other = pages.find((p) => p.id !== primaryPage?.id);
    return other ? other.id : (pages[0]?.id || null);
  });
  const [splitRatio, setSplitRatio] = useState(50); // percentage (e.g. 50%)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Scratchpad state if user chooses to view a live scratchpad instead of another note
  const [scratchpadText, setScratchpadText] = useState(
    '# 📝 Live Scratchpad & Working Memo\n\n- Jot temporary equations, references or copy snippets here.\n- Syncs live across split view.'
  );

  const secondaryPage = pages.find((p) => p.id === secondaryPageId);

  // Drag divider logic
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const newRatio = Math.max(25, Math.min(75, (relativeX / rect.width) * 100));
      setSplitRatio(newRatio);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const handleSwapPanes = () => {
    if (!secondaryPageId || secondaryPageId === 'scratchpad') return;
    const oldPrimaryId = primaryPage?.id;
    // Swap IDs
    onUpdatePrimaryPage(secondaryPageId, {});
    setSecondaryPageId(oldPrimaryId);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex w-full h-full overflow-hidden select-none relative bg-white"
    >
      {/* LEFT PANE (Primary Page) */}
      <div
        style={{ width: `${splitRatio}%` }}
        className="h-full flex flex-col border-r border-gray-200 overflow-hidden relative"
      >
        <div className="h-9 px-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-1.5 font-semibold text-gray-800 truncate">
            <span>{primaryPage?.icon || '📄'}</span>
            <span className="truncate">{primaryPage?.title || 'Left Document'}</span>
            <span className="px-1.5 py-0.2 text-[9px] bg-blue-100 text-blue-700 rounded font-mono">
              Primary
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Pane 1</span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          <DocumentEditor
            page={primaryPage}
            onUpdatePage={onUpdatePrimaryPage}
            databaseItems={databaseItems}
            onUpdateDatabaseItems={onUpdateDatabaseItems}
            onOpenAi={onOpenAi}
            onOpenPremium={onOpenPremium}
            onOpenPdfReader={onOpenPdfReader}
            onOpenCircleSearch={onOpenCircleSearch}
          />
        </div>
      </div>

      {/* DRAGGABLE VERTICAL DIVIDER */}
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        className={`w-1.5 relative group hover:w-2 -mx-0.5 z-30 cursor-col-resize flex items-center justify-center transition-all ${
          isDragging ? 'bg-blue-500 w-2' : 'bg-transparent hover:bg-blue-400/50'
        }`}
        title="Drag to resize split view (Double click for 50:50)"
        onDoubleClick={() => setSplitRatio(50)}
      >
        <div className="w-1 h-8 rounded-full bg-gray-300 group-hover:bg-blue-600 transition-colors" />
      </div>

      {/* RIGHT PANE (Secondary Page or Scratchpad) */}
      <div
        style={{ width: `${100 - splitRatio}%` }}
        className="h-full flex flex-col overflow-hidden relative bg-white"
      >
        {/* Secondary Header Toolbar */}
        <div className="h-9 px-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            {/* Page Picker Selector */}
            <select
              value={secondaryPageId}
              onChange={(e) => setSecondaryPageId(e.target.value)}
              className="bg-white border border-gray-200 text-gray-800 text-[11px] font-medium rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs max-w-[180px] truncate"
            >
              <option value="scratchpad">📝 Live Scratchpad</option>
              <optgroup label="Workspace Notes">
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon || '📄'} {p.title}
                  </option>
                ))}
              </optgroup>
            </select>

            <button
              onClick={() => setSplitRatio(50)}
              className="px-1.5 py-0.5 text-[10px] bg-white hover:bg-gray-100 text-gray-600 rounded border border-gray-200 cursor-pointer"
              title="Reset 50:50 ratio"
            >
              50:50
            </button>

            <button
              onClick={handleSwapPanes}
              className="px-1.5 py-0.5 text-[10px] bg-white hover:bg-gray-100 text-gray-600 rounded border border-gray-200 cursor-pointer"
              title="Swap Left & Right Panes"
            >
              ⇄ Swap
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onCloseSplit}
              className="p-1 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100 cursor-pointer"
              title="Close Split Screen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Secondary Pane Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          {secondaryPageId === 'scratchpad' ? (
            <div className="p-6 max-w-2xl mx-auto h-full flex flex-col">
              <div className="flex items-center justify-between mb-3 text-xs text-gray-400 font-mono">
                <span>⚡ Real-time markdown scratchpad</span>
                <button
                  onClick={() => setScratchpadText('')}
                  className="hover:text-rose-600 hover:underline cursor-pointer"
                >
                  Clear Pad
                </button>
              </div>
              <textarea
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder="Type temporary working notes, copy-paste formulas, code..."
                className="flex-1 w-full p-4 bg-gray-50/50 rounded-xl border border-gray-200 text-xs font-mono leading-relaxed text-gray-800 focus:outline-none focus:border-blue-400 focus:bg-white resize-none shadow-2xs"
              />
            </div>
          ) : secondaryPage ? (
            <DocumentEditor
              page={secondaryPage}
              onUpdatePage={onUpdatePrimaryPage}
              databaseItems={databaseItems}
              onUpdateDatabaseItems={onUpdateDatabaseItems}
              onOpenAi={onOpenAi}
              onOpenPremium={onOpenPremium}
              onOpenPdfReader={onOpenPdfReader}
              onOpenCircleSearch={onOpenCircleSearch}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">
              Select a page to view in the right pane
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
