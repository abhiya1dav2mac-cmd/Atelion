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
import { stripLeadingEmoji } from '../services/workspaceService';

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
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Dual-Pane Clean White Notion Command Search */}
      <div
        className="w-full max-w-4xl h-[560px] bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-800 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input & Controls */}
        <div className="p-3 border-b border-gray-200 flex items-center gap-3 bg-white">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages or type a command..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none font-sans"
          />
          <div className="flex items-center gap-2 text-gray-400">
            <button
              onClick={() => {
                if (activePage) onSelectPage(activePage.id);
                onClose();
              }}
              title="Open page"
              className="p-1.5 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar bg-gray-50/60">
          <button
            onClick={() => setTitleOnlyFilter(!titleOnlyFilter)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              titleOnlyFilter
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-2xs hover:bg-gray-50'
            }`}
          >
            <span>Aa Title only</span>
          </button>

          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-gray-700 hover:text-gray-950 border border-gray-200 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer text-xs">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
              {(user?.name || 'Abhishek yadav').charAt(0).toUpperCase()}
            </span>
            <span>{user?.name || 'Abhishek yadav'}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer">
            <span>In</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-gray-600 hover:text-gray-900 border border-gray-200 shadow-2xs hover:bg-gray-50 transition-colors cursor-pointer">
            <Plus className="w-3 h-3 text-gray-400" />
            <span>Filter</span>
          </button>
        </div>

        {/* Dual Panel Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden bg-white">
          {/* Left Panel: Search Results List */}
          <div
            className="w-1/2 border-r border-gray-200 overflow-y-auto no-scrollbar p-2.5 space-y-3 bg-white"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Quick Actions */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAi) onOpenAi();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-950 transition-colors cursor-pointer text-left text-xs group"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-600">New chat</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onCreatePage) onCreatePage();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-950 transition-colors cursor-pointer text-left text-xs group"
              >
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
                <span>New page</span>
              </button>
            </div>

            {/* Past 30 Days Section */}
            {past30DaysPages.length > 0 && (
              <div>
                <p className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
                          ? 'bg-gray-100 text-gray-950 font-semibold shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                      }`}
                    >
                      <span className="text-sm select-none flex-shrink-0">{page.icon || '📄'}</span>
                      <span className="truncate flex-1">{stripLeadingEmoji(page.title)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Older Section */}
            {olderPages.length > 0 && (
              <div>
                <p className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
                          ? 'bg-gray-100 text-gray-950 font-semibold shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                      }`}
                    >
                      <span className="text-sm select-none flex-shrink-0">{page.icon || '📄'}</span>
                      <span className="truncate flex-1">{stripLeadingEmoji(page.title)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Live Page Preview */}
          <div
            className="w-1/2 p-4 overflow-y-auto no-scrollbar bg-gray-50/70 flex flex-col text-left border-l border-gray-200"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {activePage ? (
              <div className="space-y-3.5 flex-1 flex flex-col">
                {/* Preview Card Mock */}
                <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm shadow-2xs">
                      {activePage.icon || '📄'}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="h-3 w-3/4 bg-gray-200 rounded" />
                      <div className="h-2 w-1/2 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2 w-full bg-gray-100 rounded" />
                    <div className="h-2 w-5/6 bg-gray-100 rounded" />
                    <div className="h-2 w-4/6 bg-gray-100 rounded" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-gray-900 truncate text-xs">
                    {stripLeadingEmoji(activePage.title)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {activePage.updatedAt || 'Active'}
                  </span>
                </div>

                {/* Actual Excerpt Blocks Preview */}
                <div className="space-y-1.5 text-xs text-gray-600 leading-relaxed flex-1 overflow-hidden">
                  {(activePage.blocks || []).slice(0, 5).map((b, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-800 text-[11px] truncate shadow-2xs"
                    >
                      {b.content || (b.type === 'database' ? '📊 Relational Database Embed' : '📝 Block content')}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                Select a page to preview contents
              </div>
            )}
          </div>
        </div>

        {/* Bottom Shortcuts Legend */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <div className="flex items-center gap-4">
            <span>↵ Open in new tab</span>
            <span>Ctrl+L Copy link</span>
            <span>Ctrl+K Command Search</span>
          </div>
          <span className="text-gray-400">Esc to close</span>
        </div>
      </div>
    </div>
  );
}
