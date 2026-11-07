import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DocumentEditor from '../components/DocumentEditor';
import SplitEditorPane from '../components/SplitEditorPane';
import FlashcardsModal from '../components/FlashcardsModal';
import VoiceScribeModal from '../components/VoiceScribeModal';
import PluginCenterModal from '../components/PluginCenterModal';
import ColdStorageVaultModal from '../components/ColdStorageVaultModal';
import AiCopilotDrawer from '../components/AiCopilotDrawer';
import CommandPaletteModal from '../components/CommandPaletteModal';
import TelemetryBar from '../components/TelemetryBar';
import FreehandCircleOverlay from '../components/FreehandCircleOverlay';
import VirtualPdfReader from '../components/VirtualPdfReader';
import CircleSearchModal from '../components/CircleSearchModal';
import { workspaceService } from '../services/workspaceService';
import { Sparkles, Search, ChevronRight, Pin, SidebarToggle, SunMoon } from '../components/WorkspaceIcons';
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
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [sidebarTheme, setSidebarTheme] = useState(() => {
    try {
      return localStorage.getItem('atelion_sidebar_theme') || 'light';
    } catch {
      return 'light';
    }
  });
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAiPinned, setIsAiPinned] = useState(true);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [activePremiumModal, setActivePremiumModal] = useState(null); // 'history' | 'share' | 'export' | 'graph' | 'passkey'
  const [isCircleOverlayOpen, setIsCircleOverlayOpen] = useState(false);
  const [isSplitViewOpen, setIsSplitViewOpen] = useState(false);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState(false);
  const [isVoiceScribeOpen, setIsVoiceScribeOpen] = useState(false);
  const [isPluginCenterOpen, setIsPluginCenterOpen] = useState(false);
  const [isColdVaultOpen, setIsColdVaultOpen] = useState(false);
  const [pdfReaderState, setPdfReaderState] = useState({
    isOpen: false,
    title: 'Quantum_Physics_Lecture_Notes.pdf',
  });
  const [circleCaptureData, setCircleCaptureData] = useState(null);

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

  useEffect(() => {
    try {
      localStorage.setItem('atelion_sidebar_theme', sidebarTheme);
    } catch {}
  }, [sidebarTheme]);

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

  const handleInsertBlocks = (newBlocks) => {
    if (!activePage || !Array.isArray(newBlocks)) return;
    handleUpdatePage(activePage.id, {
      blocks: [...(activePage.blocks || []), ...newBlocks],
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
        onOpenPdfReader={(title) =>
          setPdfReaderState({ isOpen: true, title: title || 'Quantum_Physics_Lecture_Notes.pdf' })
        }
        onOpenCircleSearch={() => setIsCircleOverlayOpen(true)}
        onOpenPlugins={() => setIsPluginCenterOpen(true)}
        onOpenColdVault={() => setIsColdVaultOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isPinned={isSidebarPinned}
        onTogglePin={() => setIsSidebarPinned((prev) => !prev)}
        sidebarTheme={sidebarTheme}
        onToggleTheme={() => setSidebarTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {/* 2. Main Document Work Area (Clean White Canvas) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-white">
        {/* Top Minimal Navigation Bar */}
        <header className="h-11 border-b border-gray-200 px-4 flex items-center justify-between bg-white/95 backdrop-blur-sm z-20 select-none text-gray-800">
          {/* Breadcrumb Navigation & Pin Controls */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 truncate">
            {/* 📌 Pin Sidebar Button in Top Bar */}
            <button
              onClick={() => {
                if (!isSidebarOpen) {
                  setIsSidebarOpen(true);
                  setIsSidebarPinned(true);
                } else {
                  setIsSidebarPinned(!isSidebarPinned);
                  if (isSidebarPinned) setIsSidebarOpen(false);
                }
              }}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                isSidebarOpen && isSidebarPinned
                  ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
              }`}
              title={
                isSidebarOpen && isSidebarPinned
                  ? 'Sidebar is PINNED (Click to unpin/collapse)'
                  : 'Click to open & PIN sidebar'
              }
            >
              <Pin className="w-3.5 h-3.5 text-current" />
              <span className="hidden sm:inline">
                {isSidebarOpen && isSidebarPinned ? 'Sidebar Pinned' : 'Pin Sidebar'}
              </span>
            </button>

            <span className="text-gray-300">|</span>

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

            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-mono border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Turso Edge 0ms</span>
            </div>

            {/* 🪟 Dual Split-Pane Side-by-Side Editor Button */}
            <button
              onClick={() => setIsSplitViewOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs border ${
                isSplitViewOpen
                  ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
              }`}
              title="Split View: Edit 2 Notes or Scratchpad Side-by-Side"
            >
              <span>🪟</span>
              <span className="hidden sm:inline">Split View</span>
            </button>

            {/* 🧠 1-Click AI Flashcards Button */}
            <button
              onClick={() => setIsFlashcardsOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-2xs transition-all cursor-pointer"
              title="1-Click AI Flashcards & Active Recall with Spaced Repetition"
            >
              <span>🧠</span>
              <span className="hidden sm:inline">Flashcards</span>
            </button>

            {/* 🎙️ Voice-to-Notion AI Scribe Button */}
            <button
              onClick={() => setIsVoiceScribeOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-2xs transition-all cursor-pointer"
              title="Voice-to-Notion AI Scribe (Groq Whisper Speech-to-Text)"
            >
              <span>🎙️</span>
              <span className="hidden sm:inline">Voice Scribe</span>
            </button>

            {/* 🕸️ Interactive Knowledge Graph Button */}
            <button
              onClick={() => setActivePremiumModal('graph')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-2xs transition-all cursor-pointer"
              title="Interactive 2D/3D Knowledge Graph"
            >
              <span>🕸️</span>
              <span className="hidden sm:inline">Graph</span>
            </button>

            {/* 🧩 Unified MCP Plugins & Integrations Center */}
            <button
              onClick={() => setIsPluginCenterOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-2xs transition-all cursor-pointer"
              title="Unified MCP Plugins (Drive, Sheets, Meet, Calendar, GitHub, Slack)"
            >
              <span>🧩</span>
              <span className="hidden sm:inline">Plugins</span>
            </button>

            {/* 📦 GramJS MTProto Cold Storage Vault */}
            <button
              onClick={() => setIsColdVaultOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-2xs transition-all cursor-pointer"
              title="GramJS MTProto Cold Storage & Telegram Private Vault"
            >
              <span>📦</span>
              <span className="hidden sm:inline">Cold Vault</span>
            </button>

            {/* Read PDF Circle Search Button (Opens PDF Viewer with Instant Freehand Pencil) */}
            <button
              onClick={() =>
                setPdfReaderState({ isOpen: true, title: 'Quantum_Physics_Lecture_Notes.pdf' })
              }
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 shadow-2xs transition-all cursor-pointer"
              title="Open Read PDF with Instant Freehand Pencil Circle Search"
            >
              <span>📄</span>
              <span className="hidden sm:inline">Read PDF</span>
            </button>

            {/* Home Freehand Pencil Circle Search Button */}
            <button
              onClick={() => setIsCircleOverlayOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
              title="Click for Instant Freehand Pencil — Underline, bracket, sketch any shape for direct AI answer"
            >
              <span>✏️</span>
              <span className="hidden sm:inline">Circle Search</span>
            </button>

            <button
              onClick={() => setIsAiOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs border ${
                isAiOpen
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
              }`}
              title={isAiOpen ? 'Close AI Side Panel' : 'Open Notion AI Side Panel'}
            >
              <Sparkles className="w-3.5 h-3.5 text-current" />
              <span className="hidden sm:inline">Ask Notion AI</span>
              {isAiOpen && <Pin className="w-3 h-3 ml-0.5 text-blue-200" />}
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
          {isSplitViewOpen ? (
            <SplitEditorPane
              pages={pages}
              primaryPage={activePage}
              onUpdatePrimaryPage={handleUpdatePage}
              databaseItems={databaseItems}
              onUpdateDatabaseItems={setDatabaseItems}
              onOpenAi={() => setIsAiOpen(true)}
              onOpenPremium={setActivePremiumModal}
              onOpenPdfReader={(title) =>
                setPdfReaderState({
                  isOpen: true,
                  title: title || 'Quantum_Physics_Lecture_Notes.pdf',
                })
              }
              onOpenCircleSearch={() => setIsCircleOverlayOpen(true)}
              onCloseSplit={() => setIsSplitViewOpen(false)}
            />
          ) : activePage ? (
            <DocumentEditor
              page={activePage}
              onUpdatePage={handleUpdatePage}
              databaseItems={databaseItems}
              onUpdateDatabaseItems={setDatabaseItems}
              onOpenAi={() => setIsAiOpen(true)}
              onOpenPremium={setActivePremiumModal}
              onOpenPdfReader={(title) =>
                setPdfReaderState({
                  isOpen: true,
                  title: title || 'Quantum_Physics_Lecture_Notes.pdf',
                })
              }
              onOpenCircleSearch={() => setIsCircleOverlayOpen(true)}
              onOpenFlashcards={() => setIsFlashcardsOpen(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-white">
              <span className="text-4xl mb-3">📄</span>
              <p className="text-sm font-bold text-gray-800 mb-1">Welcome to Atelion Workspace</p>
              <p className="text-xs text-gray-500 mb-4">Click below to initialize your first page.</p>
              <button
                onClick={() => handleCreatePage('New Page', '📄')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md transition-colors"
              >
                + Create Page
              </button>
            </div>
          )}

          {/* Floating Freehand Pencil Circle to Search Trigger (Immediate ✏️ Pencil) */}
          <button
            onClick={() => setIsCircleOverlayOpen(true)}
            className="fixed bottom-10 right-6 z-30 px-4 py-2.5 bg-white hover:bg-blue-50 text-gray-900 border border-gray-300 hover:border-blue-400 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group"
            title="Click for Instant Freehand Pencil (✏️) — Draw any underline, bracket, diagram, or formula"
          >
            <span className="text-sm group-hover:-rotate-12 transition-transform">✏️</span>
            <span className="text-xs font-bold text-gray-900 hidden sm:inline">
              Circle to Search
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold hidden sm:inline">
              Pencil
            </span>
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
        isPinned={isAiPinned}
        onTogglePin={() => setIsAiPinned((prev) => !prev)}
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

      {/* 8. Home / Workspace Instant Freehand Pencil Circle Search Overlay */}
      <FreehandCircleOverlay
        isOpen={isCircleOverlayOpen}
        onCancel={() => setIsCircleOverlayOpen(false)}
        onCompleteCapture={(payload) => {
          setIsCircleOverlayOpen(false);
          setCircleCaptureData({
            ...payload,
            pageTitle: activePage?.title || 'Workspace',
          });
        }}
      />

      {/* 9. Read PDF Viewer (Continuous + Single Page Mode with Instant Freehand Pencil) */}
      <VirtualPdfReader
        isOpen={pdfReaderState.isOpen}
        title={pdfReaderState.title}
        initialPencilActive={true}
        onClose={() => setPdfReaderState((prev) => ({ ...prev, isOpen: false }))}
        onTriggerCircleSearch={(payload) => setCircleCaptureData(payload)}
      />

      {/* 10. Unified Circle Search Result & Multi-Turn Follow-Up Chat Modal */}
      <CircleSearchModal
        isOpen={Boolean(circleCaptureData)}
        captureData={circleCaptureData}
        onClose={() => setCircleCaptureData(null)}
        onInsertToPage={(text) => {
          handleInsertAiText(text);
        }}
        user={user}
      />

      {/* 11. 🧠 1-Click AI Flashcards & Active Recall Spaced Repetition Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsOpen}
        onClose={() => setIsFlashcardsOpen(false)}
        page={activePage}
      />

      {/* 12. 🎙️ Voice-to-Notion AI Scribe Modal */}
      <VoiceScribeModal
        isOpen={isVoiceScribeOpen}
        onClose={() => setIsVoiceScribeOpen(false)}
        activePage={activePage}
        onInsertBlocks={handleInsertBlocks}
        onCreateNewPage={(title) => handleCreatePage(title, '🎙️')}
      />

      {/* 13. 🧩 Unified MCP Plugins & Integrations Modal */}
      <PluginCenterModal
        isOpen={isPluginCenterOpen}
        onClose={() => setIsPluginCenterOpen(false)}
      />

      {/* 14. 📦 GramJS MTProto Cold Storage Vault Modal */}
      <ColdStorageVaultModal
        isOpen={isColdVaultOpen}
        onClose={() => setIsColdVaultOpen(false)}
        pages={pages}
        onRestorePages={(restored) => setPages((prev) => [...restored, ...prev])}
      />
    </div>
  );
}

