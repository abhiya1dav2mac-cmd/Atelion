import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DocumentEditor from '../components/DocumentEditor';
import AiCopilotDrawer from '../components/AiCopilotDrawer';
import CommandPaletteModal from '../components/CommandPaletteModal';
import TelemetryBar from '../components/TelemetryBar';
import { workspaceService } from '../services/workspaceService';
import { Sparkles, Search, ChevronRight } from '../components/WorkspaceIcons';
import {
  PremiumBadge,
  VersionHistoryModal,
  SharePublishModal,
  ExportModal,
  KnowledgeGraphModal,
  PasskeyEnrollModal,
} from '../components/PremiumModals';

export default function WorkspacePage({ user, onLogout }) {
  const userRole = user?.role === 'student' ? 'student' : 'professional';
  const [pages, setPages] = useState(() => workspaceService.getPages(userRole));
  const [activePageId, setActivePageId] = useState(() => {
    const list = workspaceService.getPages(userRole);
    return list.length > 0 ? list[0].id : null;
  });
  const [databaseItems, setDatabaseItems] = useState(() => workspaceService.getDatabaseItems(userRole));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [activePremiumModal, setActivePremiumModal] = useState(null); // 'history' | 'share' | 'export' | 'graph' | 'passkey'

  // Global Ctrl+K / Cmd+K listener for Notion Command Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <div className="flex h-screen w-screen overflow-hidden bg-white text-gray-900 font-sans select-none">
      {/* 1. Collapsible Notion Sidebar (Matching Screenshots 2, 3, 4) */}
      <Sidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={setActivePageId}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        user={user}
        onLogout={onLogout}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenSearch={() => setIsCommandSearchOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* 2. Main Document Work Area (Clean White Canvas) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-white">
        {/* Top Minimal Navigation Bar */}
        <header className="h-11 border-b border-gray-200 px-4 flex items-center justify-between bg-white/95 backdrop-blur-sm z-20 select-none text-gray-800">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 truncate">
            <span className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer">
              Atelion
            </span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="flex items-center gap-1.5 font-semibold text-gray-900 truncate">
              <span>{activePage?.icon || '📄'}</span>
              <span className="truncate">{activePage?.title || 'Workspace'}</span>
            </span>
          </div>

          {/* Quick Actions & Live Backend Status Pill */}
          <div className="flex items-center gap-2">
            <PremiumBadge />

            {/* Quick ⌘K Search Pill in Header */}
            <button
              onClick={() => setIsCommandSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg text-xs border border-gray-200 transition-colors cursor-pointer"
            >
              <Search className="w-3 h-3 text-gray-400" />
              <span>Search</span>
              <kbd className="text-[10px] bg-white px-1 rounded border border-gray-300 text-gray-500 font-mono">
                ⌘K
              </kbd>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-mono border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Turso Edge 0ms</span>
            </div>

            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Ask Notion AI</span>
            </button>

            {/* User Profile Pill in Top Header Bar */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 select-none">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs flex-shrink-0">
                {(user?.name || 'Abhishek yadav').charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-gray-900 truncate max-w-[130px]">
                  {user?.name || 'Abhishek yadav'}
                </span>
                <span className="text-[10px] text-gray-500 font-medium truncate max-w-[130px]">
                  {user?.role === 'student' ? 'Student Scholar' : 'Enterprise Architect'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 3. Document Canvas Area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative bg-white">
          {activePage && (
            <DocumentEditor
              page={activePage}
              onUpdatePage={handleUpdatePage}
              databaseItems={databaseItems}
              onUpdateDatabaseItems={setDatabaseItems}
              onOpenAi={() => setIsAiOpen(true)}
              onOpenPremium={setActivePremiumModal}
            />
          )}

          {/* Floating Circle to Search / AI Trigger */}
          <button
            onClick={() => setIsAiOpen(true)}
            className="fixed bottom-10 right-6 z-40 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group border border-white/20"
            title="Circle to Search & AI Assistant"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold pr-1 hidden sm:inline">Circle to Search</span>
          </button>
        </div>

        {/* 4. Global Bottom Telemetry Status Bar (Matching Screenshots 3, 4) */}
        <TelemetryBar user={user} activePageId={activePageId} />
      </main>

      {/* 5. Sliding Notion AI Copilot Drawer (Matching Screenshot 1) */}
      <AiCopilotDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onInsertText={handleInsertAiText}
        activePage={activePage}
        user={user}
      />

      {/* 6. Universal Command Search & Quick Switcher (Matching Screenshot 4) */}
      <CommandPaletteModal
        isOpen={isCommandSearchOpen}
        onClose={() => setIsCommandSearchOpen(false)}
        pages={pages}
        onSelectPage={(id) => {
          setActivePageId(id);
          setIsCommandSearchOpen(false);
        }}
        onCreatePage={handleCreatePage}
        onOpenAi={() => {
          setIsCommandSearchOpen(false);
          setIsAiOpen(true);
        }}
        user={user}
      />

      {/* 7. Notion Premium Modals */}
      <VersionHistoryModal
        isOpen={activePremiumModal === 'history'}
        onClose={() => setActivePremiumModal(null)}
        page={activePage}
        onRestoreVersion={(ver) => {
          console.log('[PREMIUM-RESTORE]', ver.label);
        }}
      />

      <SharePublishModal
        isOpen={activePremiumModal === 'share'}
        onClose={() => setActivePremiumModal(null)}
        page={activePage}
      />

      <ExportModal
        isOpen={activePremiumModal === 'export'}
        onClose={() => setActivePremiumModal(null)}
        page={activePage}
      />

      <KnowledgeGraphModal
        isOpen={activePremiumModal === 'graph'}
        onClose={() => setActivePremiumModal(null)}
        pages={pages}
        onSelectPage={setActivePageId}
      />

      <PasskeyEnrollModal
        isOpen={activePremiumModal === 'passkey'}
        onClose={() => setActivePremiumModal(null)}
        user={user}
      />
    </div>
  );
}

