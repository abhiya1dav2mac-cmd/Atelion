import React, { useState } from 'react';
import { X, Search, Check, Sparkles } from './WorkspaceIcons';
import { PremiumBadge } from './PremiumModals';

/**
 * 🧩 Unified MCP Plugins & Integrations Center
 * Manages connections for:
 *  1. Google Drive
 *  2. Google Sheets
 *  3. Google Meet
 *  4. Google Calendar API
 *  5. GitHub
 *  6. Slack API
 */
export default function PluginCenterModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState([
    {
      id: 'google_calendar',
      name: 'Google Calendar API',
      category: 'Calendar & Scheduling',
      icon: '📅',
      color: '#4285F4',
      desc: 'Automatic event scheduling, attendee invitations, and calendar sync.',
      connected: true,
      lastSync: '2 mins ago',
      tools: ['create_event', 'list_events', 'find_free_slots'],
      scopes: 'calendar.events, calendar.readonly',
    },
    {
      id: 'google_meet',
      name: 'Google Meet',
      category: 'Video Conferencing',
      icon: '📹',
      color: '#00897B',
      desc: '1-click automated meeting room links with conferenceData integration.',
      connected: true,
      lastSync: '10 mins ago',
      tools: ['generate_meet_link', 'invite_participants', 'set_meeting_passcode'],
      scopes: 'meetings.space.created',
    },
    {
      id: 'google_drive',
      name: 'Google Drive',
      category: 'Cloud Storage',
      icon: '📁',
      color: '#FBBC05',
      desc: 'Search, read, and attach PDFs, docs, and assets directly in notes.',
      connected: false,
      lastSync: 'Not connected',
      tools: ['search_drive_files', 'export_doc_to_pdf', 'upload_attachment'],
      scopes: 'drive.file, drive.readonly',
    },
    {
      id: 'google_sheets',
      name: 'Google Sheets',
      category: 'Spreadsheets & Data',
      icon: '📊',
      color: '#34A853',
      desc: 'Bidirectional sync between Notion databases and Google Sheets rows.',
      connected: false,
      lastSync: 'Not connected',
      tools: ['append_row', 'read_range', 'export_database_to_sheet'],
      scopes: 'spreadsheets',
    },
    {
      id: 'github',
      name: 'GitHub API',
      category: 'Developer & Code',
      icon: '🐙',
      color: '#24292E',
      desc: 'Create issues, link PRs to project tasks, and sync repo milestones.',
      connected: true,
      lastSync: '1 hour ago',
      tools: ['create_issue', 'link_pull_request', 'get_repo_commits'],
      scopes: 'repo, read:user',
    },
    {
      id: 'slack',
      name: 'Slack API',
      category: 'Team Communication',
      icon: '💬',
      color: '#4A154B',
      desc: 'Broadcast meeting invites, task assignments, and AI summaries to channels.',
      connected: true,
      lastSync: 'Just now',
      tools: ['send_channel_message', 'post_meeting_card', 'notify_user'],
      scopes: 'chat:write, channels:read',
    },
  ]);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'connected' | 'available'

  if (!isOpen) return null;

  const toggleConnection = (id) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              connected: !p.connected,
              lastSync: !p.connected ? 'Just now' : 'Disconnected',
            }
          : p
      )
    );
  };

  const filtered = plugins.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'connected') return matchesSearch && p.connected;
    if (activeTab === 'available') return matchesSearch && !p.connected;
    return matchesSearch;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 relative text-left text-gray-900 animate-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Upper Right Badges & Close */}
        <div className="absolute top-5 right-12 flex items-center gap-2">
          <PremiumBadge />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-2xl">🧩</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Unified MCP Plugins & Integrations
            </h3>
            <p className="text-xs text-gray-500">
              Connect external enterprise tools. AI Copilot uses standard Model Context Protocol (MCP) tool calling to automate tasks across apps.
            </p>
          </div>
        </div>

        {/* Search & Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all border ${
                activeTab === 'all'
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
            >
              All Integrations ({plugins.length})
            </button>
            <button
              onClick={() => setActiveTab('connected')}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all border ${
                activeTab === 'connected'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Connected ({plugins.filter((p) => p.connected).length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all border ${
                activeTab === 'available'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              Available ({plugins.filter((p) => !p.connected).length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plugins..."
              className="pl-7 pr-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 w-48 font-sans"
            />
          </div>
        </div>

        {/* Plugins Grid List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
          {filtered.map((plugin) => (
            <div
              key={plugin.id}
              className="p-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all bg-white shadow-2xs flex items-start justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border border-gray-100 flex-shrink-0"
                  style={{ backgroundColor: `${plugin.color}15` }}
                >
                  {plugin.icon}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-gray-900">{plugin.name}</h4>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-gray-100 text-gray-600 border border-gray-200">
                      {plugin.category}
                    </span>
                    {plugin.connected && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed mb-2">{plugin.desc}</p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-gray-500">
                    <span className="font-semibold text-gray-700">MCP Tools:</span>
                    {plugin.tools.map((t) => (
                      <span key={t} className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                        {t}
                      </span>
                    ))}
                    <span className="text-gray-300">•</span>
                    <span>Last Synced: {plugin.lastSync}</span>
                  </div>
                </div>
              </div>

              {/* Connect / Disconnect Toggle Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => toggleConnection(plugin.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                    plugin.connected
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
                  }`}
                >
                  {plugin.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-gray-400">
              No integrations match your search query.
            </div>
          )}
        </div>

        {/* Bottom Status Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">🔒 AES-256-GCM Encrypted</span>
            <span>• OAuth tokens stored in secure client vault</span>
          </div>
          <span>Model Context Protocol (MCP v1.2)</span>
        </div>
      </div>
    </div>
  );
}
