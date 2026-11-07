import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  FileText,
  Filter,
  ChevronDown,
  X,
  ExternalLink,
  Copy,
} from './WorkspaceIcons';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  pages = [],
  onSelectPage,
  onCreatePage,
  onOpenAi,
  user,
}) {
  const [query, setQuery] = useState('');
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [titleOnlyFilter, setTitleOnlyFilter] = useState(false);

  // Close on Escape & handle shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Set default selected page
  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      setSelectedPageId(pages[0].id);
    }
  }, [pages, selectedPageId]);

  // Filtered pages based on search query
  const filteredPages = useMemo(() => {
    if (!query.trim()) return pages;
    const q = query.toLowerCase();
    return pages.filter((p) => {
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      if (titleOnlyFilter) return matchTitle;
      const matchContent = (p.blocks || []).some((b) =>
        (b.content || '').toLowerCase().includes(q)
      );
      return matchTitle || matchContent;
    });
  }, [pages, query, titleOnlyFilter]);

  const past30DaysPages = filteredPages.slice(0, 6);
  const olderPages = filteredPages.slice(6);

  const activePage =
    pages.find((p) => p.id === selectedPageId) || filteredPages[0] || pages[0];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Dual-Pane Notion Command Search (Matching Screenshot 4) */}
      <div
        className="w-full max-w-4xl h-[560px] bg-[#202020] border border-[#333333] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#d4d4d4] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input & Controls */}
        <div className="p-3 border-b border-[#2c2c2c] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#888888] flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Open in new tab..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#666666] outline-none font-sans"
          />
          <div className="flex items-center gap-2 text-[#888888]">
            <button
              onClick={() => {
                if (activePage) onSelectPage(activePage.id);
                onClose();
              }}
              title="Open in new tab"
              className="p-1 hover:text-white rounded hover:bg-[#2c2c2c] cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:text-white rounded hover:bg-[#2c2c2c] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="px-3 py-2 border-b border-[#2a2a2a] flex items-center gap-2 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTitleOnlyFilter(!titleOnlyFilter)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              titleOnlyFilter
                ? 'bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/50'
                : 'bg-[#282828] text-[#999999] hover:text-white border border-[#333333]'
            }`}
          >
            <span>Aa Title only</span>
          </button>

          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#282828] text-[#cccccc] hover:text-white border border-[#333333] transition-colors cursor-pointer text-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
              {(user?.name || 'Abhishek yadav').charAt(0).toUpperCase()}
            </span>
            <span>{user?.name || 'Abhishek yadav'}</span>
            <ChevronDown className="w-3 h-3 text-[#777777]" />
          </button>

          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#282828] text-[#999999] hover:text-white border border-[#333333] transition-colors cursor-pointer">
            <span>In</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          <button className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#282828] text-[#999999] hover:text-white border border-[#333333] transition-colors cursor-pointer">
            <Plus className="w-3 h-3" />
            <span>Filter</span>
          </button>
        </div>

        {/* Dual Panel Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Panel: Search Results List */}
          <div
            className="w-1/2 border-r border-[#2c2c2c] overflow-y-auto no-scrollbar p-2 space-y-3"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Quick Actions */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAi) onOpenAi();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#2b2b2b] text-[#cccccc] hover:text-white transition-colors cursor-pointer text-left text-xs group"
              >
                <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
                <span className="font-semibold text-white">New chat</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onCreatePage) onCreatePage();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#2b2b2b] text-[#cccccc] hover:text-white transition-colors cursor-pointer text-left text-xs group"
              >
                <Plus className="w-4 h-4 text-[#888888] group-hover:text-white" />
                <span>New page</span>
              </button>
            </div>

            {/* Past 30 Days Section */}
            {past30DaysPages.length > 0 && (
              <div>
                <p className="px-2.5 py-1 text-[10px] font-bold text-[#666666] uppercase tracking-wider">
                  Past 30 days
                </p>
                <div className="space-y-0.5">
                  {past30DaysPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setSelectedPageId(page.id);
                        onSelectPage(page.id);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedPageId(page.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                        selectedPageId === page.id
                          ? 'bg-[#2e2e2e] text-white font-medium'
                          : 'text-[#aaaaaa] hover:bg-[#282828] hover:text-[#e0e0e0]'
                      }`}
                    >
                      <span className="text-sm select-none">{page.icon || '📄'}</span>
                      <span className="truncate flex-1">{page.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Older Section */}
            {olderPages.length > 0 && (
              <div>
                <p className="px-2.5 py-1 text-[10px] font-bold text-[#666666] uppercase tracking-wider">
                  Older
                </p>
                <div className="space-y-0.5">
                  {olderPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setSelectedPageId(page.id);
                        onSelectPage(page.id);
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedPageId(page.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                        selectedPageId === page.id
                          ? 'bg-[#2e2e2e] text-white font-medium'
                          : 'text-[#aaaaaa] hover:bg-[#282828] hover:text-[#e0e0e0]'
                      }`}
                    >
                      <span className="text-sm select-none">{page.icon || '📄'}</span>
                      <span className="truncate flex-1">{page.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Live Page Preview (Matching Screenshot 4) */}
          <div
            className="w-1/2 p-4 overflow-y-auto no-scrollbar bg-[#181818] flex flex-col text-left border-l border-[#262626]"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activePage ? (
              <div className="space-y-3.5 flex-1 flex flex-col">
                {/* Preview Card Mock (Matching Screenshot 4) */}
                <div className="p-4 rounded-xl bg-[#202020] border border-[#2d2d2d] space-y-3 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#2e2e2e] flex items-center justify-center text-sm shadow">
                      {activePage.icon || '📄'}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="h-3 w-3/4 bg-[#333333] rounded" />
                      <div className="h-2 w-1/2 bg-[#2a2a2a] rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2 w-full bg-[#292929] rounded" />
                    <div className="h-2 w-5/6 bg-[#262626] rounded" />
                    <div className="h-2 w-4/6 bg-[#262626] rounded" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-white truncate text-xs">{activePage.title}</span>
                  <span className="text-[10px] text-[#666666] font-mono">
                    {activePage.updatedAt || 'Active'}
                  </span>
                </div>

                {/* Actual Excerpt Blocks Preview */}
                <div className="space-y-1.5 text-xs text-[#999999] leading-relaxed flex-1 overflow-hidden">
                  {(activePage.blocks || []).slice(0, 4).map((b, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#202020]/70 border border-[#262626] text-[#cccccc] text-[11px] truncate"
                    >
                      {b.content || (b.type === 'database' ? '📊 Relational Database Embed' : '📝 Block content')}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-[#666666]">
                Select a page to preview contents
              </div>
            )}
          </div>
        </div>

        {/* Bottom Shortcuts Legend */}
        <div className="px-4 py-2 border-t border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between text-[11px] text-[#777777] font-mono">
          <div className="flex items-center gap-4">
            <span>↵ Open in new tab</span>
            <span>Ctrl+L Copy link</span>
            <span>Ctrl+K Command Search</span>
          </div>
          <span className="text-[#555555]">Esc to close</span>
        </div>
      </div>
    </div>
  );
}
