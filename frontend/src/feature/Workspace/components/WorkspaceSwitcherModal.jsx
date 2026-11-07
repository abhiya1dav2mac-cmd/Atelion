import React from 'react';
import {
  ArrowUp,
  Settings,
  UserPlus,
  Check,
  Plus,
  LogOut,
  MoreHorizontal,
} from './WorkspaceIcons';

export default function WorkspaceSwitcherModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onGoToLanding,
  onUpgrade,
  onSettings,
  onInviteMembers,
  isLight = true,
}) {
  if (!isOpen) return null;

  const displayName = user?.name || (user?.role === 'student' ? 'Student Scholar' : 'Abhishek yadav');
  const displayEmail = user?.email || 'abhiya1dav2mac@gmail.com';
  const initial = displayName.charAt(0).toUpperCase();

  const containerClass = 'bg-white border-gray-200 text-gray-800 shadow-2xl';
  const cardClass = 'bg-gray-50 border-gray-200';
  const btnHover = 'hover:bg-gray-100 text-gray-700 hover:text-gray-900';
  const dividerClass = 'bg-gray-200';
  const activeWsClass = 'bg-gray-100 text-gray-950 font-medium';

  return (
    <>
      {/* Invisible backdrop to dismiss on click outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Floating Switcher Dropdown */}
      <div
        className={`fixed bottom-14 left-3 z-50 w-72 ${containerClass} border rounded-xl p-2 select-none animate-in fade-in zoom-in-95 duration-100 no-scrollbar text-xs font-sans`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Workspace Header */}
        <div className={`flex items-center gap-3 p-2 rounded-lg ${cardClass} border mb-2`}>
          <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold truncate text-xs ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {displayName}'s Space
            </h3>
            <p className="text-[10px] text-gray-500 font-medium truncate">
              Free Plan · 1 member <span className="text-amber-500 font-semibold">• 👑 Premium</span>
            </p>
          </div>
        </div>

        {/* Quick Workspace Actions */}
        <div className="space-y-0.5">
          <button
            onClick={() => {
              onClose();
              if (onUpgrade) onUpgrade();
              else alert('Upgrade to Atelion Pro: Unlimited AI, Cloudflare R2 Vault & Team Collaboration!');
            }}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md ${btnHover} text-blue-600 font-medium transition-colors cursor-pointer text-left`}
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
            <span className="text-blue-600 font-semibold">Upgrade</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onSettings) onSettings();
              else alert('Workspace Settings: Turso Edge Sync, API Keys, and Dark Theme preferences.');
            }}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md ${btnHover} transition-colors cursor-pointer text-left`}
          >
            <Settings className="w-4 h-4 opacity-70" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onInviteMembers) onInviteMembers();
              else alert('Invite link copied: share with your classmates or teammates to collaborate real-time!');
            }}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md ${btnHover} transition-colors cursor-pointer text-left`}
          >
            <UserPlus className="w-4 h-4 opacity-70" />
            <span>Invite members</span>
          </button>

          <button
            onClick={() => {
              onClose();
              alert('Add Account: Multi-account login capability enabled.');
            }}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md ${btnHover} transition-colors cursor-pointer text-left`}
          >
            <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Add account</span>
          </button>
        </div>

        {/* Divider */}
        <div className={`h-px ${dividerClass} my-2`} />

        {/* Email & Workspaces Section */}
        <div className="px-2 py-1 flex items-center justify-between text-[11px] text-gray-400">
          <span className="truncate">{displayEmail}</span>
          <button className="opacity-70 hover:opacity-100 p-0.5 rounded cursor-pointer">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Workspace Row with Checkmark */}
        <div className={`flex items-center justify-between px-2 py-1.5 rounded-md ${activeWsClass} mt-1`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-gray-900 text-[10px] font-bold text-white flex items-center justify-center">
              {initial}
            </div>
            <span className="truncate text-xs font-medium">{displayName}'s Space</span>
          </div>
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        </div>

        {/* Create New Workspace */}
        <button
          onClick={() => {
            onClose();
            alert('Create new isolated Turso LibSQL workspace shard.');
          }}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md ${btnHover} text-blue-600 font-medium transition-colors cursor-pointer text-left mt-1`}
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span className="text-blue-600 font-semibold">New workspace</span>
        </button>

        {/* Divider */}
        <div className={`h-px ${dividerClass} my-2`} />

        {/* View Public Website / Landing Page */}
        {onGoToLanding && (
          <button
            onClick={() => {
              onClose();
              onGoToLanding();
            }}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md ${btnHover} font-medium transition-colors cursor-pointer text-left mb-1`}
          >
            <span className="text-sm">🌐</span>
            <span>View Landing Page</span>
          </button>
        )}

        {/* Log Out */}
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-red-50 text-red-600 font-medium transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );
}
