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
  Pin,
  ChevronsLeft,
  SunMoon,
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
  isOpen = true,
  onToggleSidebar,
  isPinned = true,
  onTogglePin,
  sidebarTheme = 'dark',
  onToggleTheme,
}) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [showInviteToast, setShowInviteToast] = useState(true);
  const [localPinned, setLocalPinned] = useState(true);
  const [localTheme, setLocalTheme] = useState('dark');

  const pinned = onTogglePin ? isPinned : localPinned;
  const togglePin = () => {
    if (onTogglePin) onTogglePin();
    else setLocalPinned(!localPinned);
  };

  const currentTheme = onToggleTheme ? sidebarTheme : localTheme;
  const toggleTheme = () => {
    if (onToggleTheme) onToggleTheme();
    else setLocalTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isLight = currentTheme === 'light';

  // Dynamic Notion Light vs Notion Dark theme tokens
  const theme = isLight
    ? {
        aside: 'bg-[#F7F7F5] border-r border-[#E9E9E7] text-[#37352F]',
        headerBrand: 'text-[#37352F]',
        searchInput: 'bg-[#EEEEEC] hover:bg-[#E5E5E3] border-[#E0E0DE] text-[#6A6965] hover:text-[#37352F]',
        kbd: 'bg-[#FFFFFF] border-[#DCDCDA] text-[#787774]',
        navItem: 'hover:bg-[#EBEBE9] text-[#5A5852] hover:text-[#191918]',
        navItemActive: 'bg-[#E5E5E3] text-[#191918] font-semibold',
        divider: 'bg-[#E9E9E7]',
        sectionHeading: 'text-[#9B9A97]',
        recentItem: 'text-[#5A5852] hover:bg-[#EBEBE9] hover:text-[#191918]',
        recentItemActive: 'bg-[#E5E5E3] text-[#191918] font-semibold',
        bottomBar: 'border-t border-[#E9E9E7] bg-[#F1F1EF]',
        userButton: 'hover:bg-[#E5E5E3] text-[#191918]',
        userAvatar: 'bg-[#E0E0DE] text-[#37352F]',
        iconButton: 'text-[#787774] hover:text-[#191918] hover:bg-[#E5E5E3]',
        inviteBox: 'bg-[#FFFFFF] border-[#E0E0DE] shadow-xs text-[#37352F]',
      }
    : {
        aside: 'bg-[#202020] border-r border-[#2c2c2c] text-[#cccccc]',
        headerBrand: 'text-white',
        searchInput: 'bg-[#262626] hover:bg-[#2c2c2c] border-[#303030] text-[#888888] hover:text-[#cccccc]',
        kbd: 'bg-[#1d1d1d] border-[#333333] text-[#777777]',
        navItem: 'hover:bg-[#282828] text-[#cccccc] hover:text-white',
        navItemActive: 'bg-[#2c2c2c] text-white font-semibold',
        divider: 'bg-[#282828]',
        sectionHeading: 'text-[#666666]',
        recentItem: 'text-[#999999] hover:bg-[#262626] hover:text-white',
        recentItemActive: 'bg-[#2c2c2c] text-white font-semibold',
        bottomBar: 'border-t border-[#2a2a2a] bg-[#1a1a1a]',
        userButton: 'hover:bg-[#262626] text-white',
        userAvatar: 'bg-[#333333] text-white',
        iconButton: 'text-[#888888] hover:text-white hover:bg-[#262626]',
        inviteBox: 'bg-[#262626] border-[#333333] shadow-lg text-white',
      };

  const displayName = user?.name || (user?.role === 'student' ? 'Student Scholar' : 'Abhishek yadav');
  const initial = displayName.charAt(0).toUpperCase();

  const recents = pages.slice(0, 5);
  const privatePages = pages;

  if (!isOpen) {
    return (
      <div className="fixed top-2.5 left-2.5 z-40 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-gray-200">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-950 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Open & Pin Sidebar"
        >
          <SidebarToggle className="w-4 h-4 text-gray-700" />
          <span className="hidden sm:inline">Open Sidebar</span>
        </button>
        <button
          onClick={togglePin}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            pinned ? 'text-amber-600 bg-amber-50' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title={pinned ? 'Sidebar will remain pinned when opened' : 'Click to pin sidebar'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className={`w-64 h-screen ${theme.aside} flex flex-col justify-between select-none z-30 transition-all flex-shrink-0 font-sans no-scrollbar`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* 1. TOP HEADER & SEARCH (Matching Screenshot 4) */}
      <div className="flex flex-col overflow-hidden">
        {/* Workspace Brand, 📌 Pin Button, 🌓 Theme Toggle & Upper Corner Premium Badge */}
        <div className="px-3 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm">⚡</span>
            <span className={`text-xs font-bold tracking-tight truncate ${theme.headerBrand}`}>
              Atelion Space
            </span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* 📌 Dedicated Pin / Unpin Button */}
            <button
              onClick={togglePin}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                pinned
                  ? 'text-amber-400 bg-amber-400/20 border border-amber-400/40 shadow-xs'
                  : theme.iconButton
              }`}
              title={pinned ? 'Sidebar is PINNED (Click to unpin)' : 'Click to PIN sidebar'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            {/* 🌓 Sidebar Theme Toggle (Notion Dark vs Notion White/Light) */}
            <button
              onClick={toggleTheme}
              className={`p-1 rounded-md transition-colors cursor-pointer ${theme.iconButton}`}
              title={isLight ? 'Switch to Notion Dark (#202020)' : 'Switch to Notion Light (#F7F7F5)'}
            >
              <SunMoon className="w-3.5 h-3.5" />
            </button>

            {/* ⮜⮜ Quick Collapse Sidebar Button */}
            <button
              onClick={onToggleSidebar}
              className={`p-1 rounded-md transition-colors cursor-pointer ${theme.iconButton}`}
              title="Collapse sidebar (Chevrons left)"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            <PremiumBadge className="scale-80" />
          </div>
        </div>

        {/* Search or Ask Input */}
        <div className="p-3 pb-2 pt-1.5">
          <button
            onClick={onOpenSearch}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 ${theme.searchInput} border rounded-lg text-xs transition-colors cursor-pointer group`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-current opacity-70 group-hover:opacity-100" />
              <span>Search or ask</span>
            </div>
            <kbd className={`text-[10px] ${theme.kbd} px-1.5 py-0.5 rounded border font-mono`}>
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
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md ${theme.navItem} transition-colors cursor-pointer text-left`}
          >
            <Home className="w-4 h-4 opacity-70" />
            <span>Home</span>
          </button>

          <button
            onClick={onOpenAi}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md ${theme.navItem} transition-colors cursor-pointer text-left`}
          >
            <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
            <span className="font-semibold text-[#3B82F6]">New chat</span>
          </button>

          <button
            onClick={() => {
              if (onOpenSearch) onOpenSearch();
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md ${theme.navItem} transition-colors cursor-pointer text-left`}
          >
            <BookOpen className="w-4 h-4 opacity-70" />
            <span>Library</span>
          </button>
        </div>

        {/* Divider */}
        <div className={`h-px ${theme.divider} mx-3 my-2`} />

        {/* Scrollable Tree Sections */}
        <div
          className="overflow-y-auto no-scrollbar px-2 space-y-3 flex-1 max-h-[calc(100vh-270px)]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Upcoming Events Section (Matching Screenshot 4) */}
          <div className="space-y-1">
            <p className={`px-2.5 text-[10px] font-bold ${theme.sectionHeading} uppercase tracking-wider`}>
              Upcoming events
            </p>
            <button
              onClick={() => {
                alert('Connect your Google Calendar or Outlook to sync live schedule and AI meeting notes.');
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md ${theme.navItem} text-[#3B82F6] hover:text-[#60A5FA] text-xs font-medium transition-colors cursor-pointer text-left`}
            >
              <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="truncate">Connect your calendar</span>
            </button>
          </div>

          {/* Recents Section (Matching Screenshot 4) */}
          {recents.length > 0 && (
            <div className="space-y-0.5">
              <p className={`px-2.5 text-[10px] font-bold ${theme.sectionHeading} uppercase tracking-wider`}>
                Recents
              </p>
              {recents.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPage(p.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-left transition-colors cursor-pointer group ${
                    p.id === activePageId ? theme.recentItemActive : theme.recentItem
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
            <p className={`px-2.5 text-[10px] font-bold ${theme.sectionHeading} uppercase tracking-wider`}>
              Shared
            </p>
            <button
              onClick={() => {
                alert('Start collaborating: invite teammates to co-edit pages in real time.');
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md ${theme.navItem} text-xs font-medium transition-colors cursor-pointer text-left`}
            >
              <Plus className="w-3.5 h-3.5 opacity-70" />
              <span>Start collaborating</span>
            </button>
          </div>

          {/* Private Notes Section (Matching Screenshot 4) */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2.5">
              <p className={`text-[10px] font-bold ${theme.sectionHeading} uppercase tracking-wider`}>
                Private
              </p>
              <button
                onClick={() => onCreatePage('New page', '📄')}
                title="Add a page"
                className="opacity-70 hover:opacity-100 p-0.5 rounded cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {privatePages.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectPage(p.id)}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                  p.id === activePageId ? theme.recentItemActive : theme.recentItem
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
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 rounded transition-opacity"
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
          <div className={`mx-3 mb-2 p-2.5 rounded-xl ${theme.inviteBox} border flex items-center justify-between text-xs`}>
            <div className="min-w-0 pr-1">
              <p className="font-semibold text-[11px] truncate">Invite members</p>
              <p className="text-[10px] opacity-70 truncate">Collaborate with your team.</p>
            </div>
            <button
              onClick={() => setShowInviteToast(false)}
              className="opacity-60 hover:opacity-100 p-1 rounded cursor-pointer flex-shrink-0"
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
            className={`w-full flex items-center gap-2 text-[11px] opacity-70 hover:opacity-100 transition-opacity cursor-pointer py-1`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Customize sidebar</span>
          </button>
        </div>

        {/* Bottom Profile Bar (Matching Screenshots 2, 3, 4) */}
        <div className={`p-2 ${theme.bottomBar} flex items-center justify-between`}>
          {/* Workspace Switcher Trigger Button */}
          <button
            onClick={() => {
              setIsSwitcherOpen(!isSwitcherOpen);
              setIsAppsMenuOpen(false);
            }}
            className={`flex items-center gap-2 min-w-0 p-1.5 rounded-lg ${theme.userButton} text-left transition-colors cursor-pointer group flex-1 mr-1`}
            title={`${displayName}'s Space`}
          >
            <div className={`w-5 h-5 rounded ${theme.userAvatar} text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
              {initial}
            </div>
            <span className="truncate text-xs font-semibold group-hover:text-[#60A5FA] transition-colors">
              {displayName}'s Space
            </span>
            <ChevronDown className="w-3 h-3 opacity-60 flex-shrink-0" />
          </button>

          {/* Quick Icons: Help (?) and Apps Menu (::) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                alert('Atelion Help: Press Ctrl+K for search, / for block commands, or ask AI Copilot.');
              }}
              className={`p-1.5 ${theme.iconButton} rounded-md transition-colors cursor-pointer relative`}
              title="Help & documentation"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#3B82F6] rounded-full ring-2 ring-[#1a1a1a]" />
            </button>

            <button
              onClick={() => {
                setIsAppsMenuOpen(!isAppsMenuOpen);
                setIsSwitcherOpen(false);
              }}
              className={`p-1.5 ${theme.iconButton} rounded-md transition-colors cursor-pointer`}
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
