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
  onUpgrade,
  onSettings,
  onInviteMembers,
}) {
  if (!isOpen) return null;

  const displayName = user?.name || (user?.role === 'student' ? 'Student Scholar' : 'Abhishek yadav');
  const displayEmail = user?.email || 'abhiya1dav2mac@gmail.com';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Invisible backdrop to dismiss on click outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Floating Dark Switcher Dropdown (Matching Screenshot 2) */}
      <div
        className="fixed bottom-14 left-3 z-50 w-72 bg-[#202020] border border-[#2f2f2f] rounded-xl shadow-2xl text-[#d4d4d4] text-xs font-sans p-2 select-none animate-in fade-in zoom-in-95 duration-100 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Workspace Header */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#262626]/70 border border-[#2e2e2e]/80 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#333333] border border-[#3e3e3e] flex items-center justify-center text-sm font-semibold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white truncate text-xs">{displayName}'s Space</h3>
            <p className="text-[10px] text-amber-400 font-bold truncate">👑 PREMIUM UNLOCKED • Enterprise Edition</p>
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
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#2a2a2a] text-[#3B82F6] font-medium transition-colors cursor-pointer text-left"
          >
            <ArrowUp className="w-4 h-4 text-[#3B82F6]" />
            <span>Upgrade</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onSettings) onSettings();
              else alert('Workspace Settings: Turso Edge Sync, API Keys, and Dark Theme preferences.');
            }}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#2a2a2a] text-[#cccccc] hover:text-white transition-colors cursor-pointer text-left"
          >
            <Settings className="w-4 h-4 text-[#888888]" />
            <span>Settings</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onInviteMembers) onInviteMembers();
              else alert('Invite link copied: share with your classmates or teammates to collaborate real-time!');
            }}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#2a2a2a] text-[#cccccc] hover:text-white transition-colors cursor-pointer text-left"
          >
            <UserPlus className="w-4 h-4 text-[#888888]" />
            <span>Invite members</span>
          </button>

          <button
            onClick={() => {
              onClose();
              alert('Add Account: Multi-account login capability enabled.');
            }}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#2a2a2a] text-[#cccccc] hover:text-white transition-colors cursor-pointer text-left"
          >
            <svg className="w-4 h-4 text-[#888888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Add account</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2a2a2a] my-2" />

        {/* Email & Workspaces Section */}
        <div className="px-2 py-1 flex items-center justify-between text-[11px] text-[#777777]">
          <span className="truncate">{displayEmail}</span>
          <button className="text-[#888888] hover:text-white p-0.5 rounded cursor-pointer">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Workspace Row with Checkmark */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-[#2a2a2a] text-white mt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-[#3a3a3a] text-[10px] font-bold flex items-center justify-center">
              {initial}
            </div>
            <span className="truncate text-xs font-medium">{displayName}'s Space</span>
          </div>
          <Check className="w-4 h-4 text-white flex-shrink-0" />
        </div>

        {/* Create New Workspace */}
        <button
          onClick={() => {
            onClose();
            alert('Create new isolated Turso LibSQL workspace shard.');
          }}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-[#2a2a2a] text-[#3B82F6] font-medium transition-colors cursor-pointer text-left mt-1"
        >
          <Plus className="w-4 h-4 text-[#3B82F6]" />
          <span>New workspace</span>
        </button>

        {/* Divider */}
        <div className="h-px bg-[#2a2a2a] my-2" />

        {/* Log Out */}
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-red-500/10 text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );
}
