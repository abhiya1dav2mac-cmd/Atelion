import React from 'react';
import {
  FileText,
  Plus,
  Trash,
  Database,
  Sparkles,
  LogOut,
  Star,
  ChevronRight,
  SidebarToggle,
} from './WorkspaceIcons';

export default function Sidebar({
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  user,
  onLogout,
  onOpenAi,
  isOpen,
  onToggleSidebar,
}) {
  const favorites = pages.filter((p) => p.favorite);
  const regularPages = pages.filter((p) => !p.favorite);

  if (!isOpen) {
    return (
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-950 rounded-xl shadow-md border border-gray-200/80 backdrop-blur-md transition-all cursor-pointer"
          title="Open Sidebar"
        >
          <SidebarToggle className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 sm:w-72 h-screen bg-[#FBFBFA] border-r border-[#EBEBEA] flex flex-col justify-between select-none z-30 transition-all flex-shrink-0">
      {/* Top Workspace Header */}
      <div className="flex flex-col overflow-hidden">
        <div className="p-3.5 flex items-center justify-between border-b border-[#EBEBEA]/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              {user?.role === 'student' ? '🎓' : '⚡'}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-gray-900 truncate tracking-tight">
                {user?.role === 'student' ? 'Student Study Hub' : 'Atelion OS Pro'}
              </h2>
              <p className="text-[10px] text-gray-500 truncate font-mono">
                {user?.collegeName || user?.companyName || (user?.role === 'student' ? 'Academic Edition' : 'Enterprise Workspace')}
              </p>
            </div>
          </div>
          <button
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <SidebarToggle className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Launch Tools */}
        <div className="px-2 pt-3 pb-2 space-y-0.5 border-b border-[#EBEBEA]/60">
          <button
            onClick={onOpenAi}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 rounded-lg transition-colors cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>AI Copilot & Circle Search</span>
            <span className="ml-auto text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-mono">
              Groq LPU
            </span>
          </button>

          <button
            onClick={() => onCreatePage('New Document', '📄')}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-950 hover:bg-gray-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-gray-400" />
            <span>Add New Page</span>
          </button>
        </div>

        {/* Scrollable Document Tree */}
        <div className="overflow-y-auto px-2 py-3 space-y-4 flex-1">
          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Favorites</span>
              </div>
              <div className="space-y-0.5">
                {favorites.map((p) => (
                  <PageItem
                    key={p.id}
                    page={p}
                    isActive={p.id === activePageId}
                    onSelect={() => onSelectPage(p.id)}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeletePage(p.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Pages */}
          <div>
            <div className="px-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Workspace Pages</span>
              <button
                onClick={() => onCreatePage('New Page', '📝')}
                className="hover:text-gray-700 p-0.5 rounded cursor-pointer"
                title="Create Page"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-0.5">
              {regularPages.map((p) => (
                <PageItem
                  key={p.id}
                  page={p}
                  isActive={p.id === activePageId}
                  onSelect={() => onSelectPage(p.id)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    onDeletePage(p.id);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className="p-3 border-t border-[#EBEBEA] bg-white/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold uppercase flex-shrink-0">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-gray-900 truncate">{user?.name || 'Pro User'}</p>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  user?.role === 'student'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {user?.role === 'student' ? 'Student' : 'Pro'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 truncate">{user?.email || 'user@workspace.io'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

function PageItem({ page, isActive, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
        isActive ? 'bg-[#EFEFEF] text-gray-950 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm select-none">{page.icon || '📄'}</span>
        <span className="truncate">{page.title}</span>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-opacity"
        title="Delete page"
      >
        <Trash className="w-3 h-3" />
      </button>
    </div>
  );
}

