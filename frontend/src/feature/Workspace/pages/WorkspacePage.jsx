import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DocumentEditor from '../components/DocumentEditor';
import AiCopilotDrawer from '../components/AiCopilotDrawer';
import { workspaceService } from '../services/workspaceService';
import { Sparkles, Database } from '../components/WorkspaceIcons';

export default function WorkspacePage({ user, onLogout }) {
  const [pages, setPages] = useState(() => workspaceService.getPages());
  const [activePageId, setActivePageId] = useState(() => {
    const list = workspaceService.getPages();
    return list.length > 0 ? list[0].id : null;
  });
  const [databaseItems, setDatabaseItems] = useState(() => workspaceService.getDatabaseItems());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Sync to local-first database on state change
  useEffect(() => {
    workspaceService.savePages(pages);
  }, [pages]);

  useEffect(() => {
    workspaceService.saveDatabaseItems(databaseItems);
  }, [databaseItems]);

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  const handleCreatePage = (title = 'Untitled Note', icon = '📄') => {
    const newPage = workspaceService.createPage(title, icon);
    setPages(workspaceService.getPages());
    setActivePageId(newPage.id);
  };

  const handleUpdatePage = (pageId, updates) => {
    const updated = workspaceService.updatePage(pageId, updates);
    if (updated) {
      setPages(workspaceService.getPages());
    }
  };

  const handleDeletePage = (pageId) => {
    const remaining = workspaceService.deletePage(pageId);
    setPages(remaining);
    if (activePageId === pageId && remaining.length > 0) {
      setActivePageId(remaining[0].id);
    }
  };

  const handleInsertAiText = (text) => {
    if (!activePage) return;
    const newBlock = {
      id: 'b_ai_' + Date.now(),
      type: 'paragraph',
      content: text,
    };
    handleUpdatePage(activePage.id, {
      blocks: [...activePage.blocks, newBlock],
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans">
      {/* 1. Collapsible Notion Sidebar */}
      <Sidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        user={user}
        onLogout={onLogout}
        onOpenAi={() => setIsAiOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* 2. Main Document Work Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Minimal Navigation Bar */}
        <header className="h-11 border-b border-gray-200/80 px-4 flex items-center justify-between bg-white/90 backdrop-blur-sm z-20 select-none">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 truncate">
            <span className="text-gray-400">Atelion</span>
            <span className="text-gray-300">/</span>
            <span className="flex items-center gap-1.5 font-semibold text-gray-900 truncate">
              <span>{activePage?.icon || '📄'}</span>
              <span>{activePage?.title || 'Workspace'}</span>
            </span>
          </div>

          {/* Quick Actions & Live Backend Status Pill */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-mono border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Backend & Turso Active</span>
            </div>

            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI / Circle</span>
            </button>
          </div>
        </header>

        {/* 3. Document Editor */}
        {activePage && (
          <DocumentEditor
            page={activePage}
            onUpdatePage={handleUpdatePage}
            databaseItems={databaseItems}
            onUpdateDatabaseItems={setDatabaseItems}
            onOpenAi={() => setIsAiOpen(true)}
          />
        )}

        {/* Floating Circle to Search / AI Trigger */}
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group"
          title="Circle to Search & AI Assistant"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold pr-1 hidden sm:inline">Circle to Search</span>
        </button>
      </main>

      {/* 4. Sliding AI Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onInsertText={handleInsertAiText}
      />
    </div>
  );
}
