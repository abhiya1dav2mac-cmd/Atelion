import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash,
  Search,
  Home,
  MessageSquare,
  BookOpen,
  Calendar,
  Settings,
  HelpCircle,
  Grid,
  ChevronDown,
  ChevronRight,
  SidebarToggle,
  X,
  Star,
} from './WorkspaceIcons';
import WorkspaceSwitcherModal from './WorkspaceSwitcherModal';
import AppsMenuModal from './AppsMenuModal';
import { PremiumBadge } from './PremiumModals';

export default function Sidebar({
  pages = [],
  activePageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  user,
  onLogout,
  onOpenAi,
  onOpenSearch,
  isOpen,
  onToggleSidebar,
}) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [showInviteToast, setShowInviteToast] = useState(true);

  const displayName = user?.name || (user?.role === 'student' ? 'Student Scholar' : 'Enterprise Architect');
  const initial = displayName.charAt(0).toUpperCase();

  const recents = pages.slice(0, 5);
  const privatePages = pages;

  if (!isOpen) {
    return (
      <div className="fixed top-3 left-3 z-40">
        <button
          onClick={onToggleSidebar}
          className="p-2 bg-[#202020] hover:bg-[#2a2a2a] text-[#cccccc] hover:text-white rounded-lg shadow-lg border border-[#2f2f2f] transition-all cursor-pointer"
          title="Open Sidebar"
        >
          <SidebarToggle className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="w-64 h-screen bg-[#202020] border-r border-[#2c2c2c] flex flex-col justify-between select-none z-30 transition-all flex-shrink-0 text-[#cccccc] font-sans no-scrollbar"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* 1. TOP HEADER & SEARCH (Matching Screenshot 4) */}
      <div className="flex flex-col overflow-hidden">
        {/* Workspace Brand & Upper Corner Premium Badge */}
        <div className="px-3 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⚡</span>
            <span className="text-xs font-bold text-white tracking-tight">Atelion Workspace</span>
          </div>
          <PremiumBadge className="scale-85" />
        </div>

        {/* Search or Ask Input */}
        <div className="p-3 pb-2 pt-1.5">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#262626] hover:bg-[#2c2c2c] border border-[#303030] rounded-lg text-xs text-[#888888] hover:text-[#cccccc] transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#aaaaaa]" />
              <span>Search or ask</span>
            </div>
            <kbd className="text-[10px] bg-[#1d1d1d] px-1.5 py-0.5 rounded border border-[#333333] text-[#777777] font-mono">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Top Navigation Links */}
        <div className="px-2 space-y-0.5 text-xs font-medium">
          <button
            onClick={() => {
              if (pages.length > 0) onSelectPage(pages[0].id);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#282828] text-[#cccccc] hover:text-white transition-colors cursor-pointer text-left"
          >
            <Home className="w-4 h-4 text-[#888888]" />
            <span>Home</span>
          </button>

          <button
            onClick={onOpenAi}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#282828] text-[#cccccc] hover:text-white transition-colors cursor-pointer text-left"
          >
            <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-white font-medium">New chat</span>
          </button>

          <button
            onClick={() => {
              if (onOpenSearch) onOpenSearch();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-[#282828] text-[#cccccc] hover:text-white transition-colors cursor-pointer text-left"
          >
            <BookOpen className="w-4 h-4 text-[#888888]" />
            <span>Library</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#282828] mx-3 my-2" />

        {/* Scrollable Tree Sections */}
        <div
          className="overflow-y-auto no-scrollbar px-2 space-y-3 flex-1 max-h-[calc(100vh-270px)]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Upcoming Events Section (Matching Screenshot 4) */}
          <div className="space-y-1">
            <p className="px-2.5 text-[10px] font-bold text-[#666666] uppercase tracking-wider">
              Upcoming events
            </p>
            <button
              onClick={() => {
                alert('Connect your Google Calendar or Outlook to sync live schedule and AI meeting notes.');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#282828] text-[#3B82F6] hover:text-[#60A5FA] text-xs font-medium transition-colors cursor-pointer text-left"
            >
              <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="truncate">Connect your calendar</span>
            </button>
          </div>

          {/* Recents Section (Matching Screenshot 4) */}
          {recents.length > 0 && (
            <div className="space-y-0.5">
              <p className="px-2.5 text-[10px] font-bold text-[#666666] uppercase tracking-wider">
                Recents
              </p>
              {recents.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPage(p.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-left transition-colors cursor-pointer group ${
                    p.id === activePageId
                      ? 'bg-[#2c2c2c] text-white font-medium'
                      : 'text-[#999999] hover:bg-[#262626] hover:text-white'
                  }`}
                >
                  <span className="text-sm select-none">{p.icon || '📄'}</span>
                  <span className="truncate flex-1">{p.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Shared Section (Matching Screenshot 4) */}
          <div className="space-y-1">
            <p className="px-2.5 text-[10px] font-bold text-[#666666] uppercase tracking-wider">
              Shared
            </p>
            <button
              onClick={() => {
                alert('Start collaborating: invite teammates to co-edit pages in real time.');
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-[#282828] text-[#888888] hover:text-white text-xs font-medium transition-colors cursor-pointer text-left"
            >
              <Plus className="w-3.5 h-3.5 text-[#777777]" />
              <span>Start collaborating</span>
            </button>
          </div>

          {/* Private Notes Section (Matching Screenshot 4) */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2.5">
              <p className="text-[10px] font-bold text-[#666666] uppercase tracking-wider">
                Private
              </p>
              <button
                onClick={() => onCreatePage('New page', '📄')}
                title="Add a page"
                className="text-[#666666] hover:text-white p-0.5 rounded cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {privatePages.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPage(p.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                  p.id === activePageId
                    ? 'bg-[#2c2c2c] text-white font-medium'
                    : 'text-[#999999] hover:bg-[#262626] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm select-none">{p.icon || '📄'}</span>
                  <span className="truncate">{p.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(p.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-[#666666] hover:text-red-400 rounded transition-opacity"
                  title="Delete page"
                >
                  <Trash className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM ACTIONS & PROFILE SWITCHER (Matching Screenshots 2, 3, 4) */}
      <div className="flex flex-col relative">
        {/* Invite Members Bottom Toast (Matching Screenshot 4) */}
        {showInviteToast && (
          <div className="mx-3 mb-2 p-2.5 rounded-xl bg-[#262626] border border-[#333333] shadow-lg flex items-center justify-between text-xs">
            <div className="min-w-0 pr-1">
              <p className="font-semibold text-white text-[11px] truncate">Invite members</p>
              <p className="text-[10px] text-[#888888] truncate">Collaborate with your team.</p>
            </div>
            <button
              onClick={() => setShowInviteToast(false)}
              className="text-[#777777] hover:text-white p-1 rounded cursor-pointer flex-shrink-0"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Customize Sidebar Button (Matching Screenshot 3) */}
        <div className="px-3 pb-2">
          <button
            onClick={() => alert('Customize Sidebar: Pin favorites or toggle private sections.')}
            className="w-full flex items-center gap-2 text-[11px] text-[#777777] hover:text-[#cccccc] transition-colors cursor-pointer py-1"
          >
            <Settings className="w-3.5 h-3.5 text-[#666666]" />
            <span>Customize sidebar</span>
          </button>
        </div>

        {/* Bottom Profile Bar (Matching Screenshots 2, 3, 4) */}
        <div className="p-2 border-t border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between">
          {/* Workspace Switcher Trigger Button */}
          <button
            onClick={() => {
              setIsSwitcherOpen(!isSwitcherOpen);
              setIsAppsMenuOpen(false);
            }}
            className="flex items-center gap-2 min-w-0 p-1.5 rounded-lg hover:bg-[#262626] text-left transition-colors cursor-pointer group flex-1 mr-1"
          >
            <div className="w-5 h-5 rounded bg-[#333333] text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
              {initial}
            </div>
            <span className="truncate text-xs font-semibold text-white group-hover:text-[#60A5FA] transition-colors">
              {displayName}'...
            </span>
            <ChevronDown className="w-3 h-3 text-[#777777] flex-shrink-0" />
          </button>

          {/* Quick Icons: Help (?) and Apps Menu (::) */}
          <div className="flex items-center gap-1 text-[#888888]">
            <button
              onClick={() => {
                alert('Atelion Help: Press Ctrl+K for search, / for block commands, or ask AI Copilot.');
              }}
              className="p-1.5 hover:text-white hover:bg-[#262626] rounded-md transition-colors cursor-pointer"
              title="Help & documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsAppsMenuOpen(!isAppsMenuOpen);
                setIsSwitcherOpen(false);
              }}
              className="p-1.5 hover:text-white hover:bg-[#262626] rounded-md transition-colors cursor-pointer"
              title="Apps, Skills & Trash"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dropdown Modals */}
        <WorkspaceSwitcherModal
          isOpen={isSwitcherOpen}
          onClose={() => setIsSwitcherOpen(false)}
          user={user}
          onLogout={onLogout}
        />

        <AppsMenuModal
          isOpen={isAppsMenuOpen}
          onClose={() => setIsAppsMenuOpen(false)}
        />
      </div>
    </aside>
  );
}
