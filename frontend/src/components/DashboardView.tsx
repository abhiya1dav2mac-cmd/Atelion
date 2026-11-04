import React, { useState, useRef } from 'react';
import { useCardboardStore } from '../store/useCardboardStore';
import {
  Search,
  Plus,
  Trash2,
  Upload,
  Film,
  Sparkles,
  RotateCcw,
  FolderKanban,
  Settings,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    projects,
    openProject,
    createNewProject,
    deleteProject,
    restoreProject,
    uploadCustomAsset,
  } = useCardboardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'projects' | 'trash'>('projects');
  const [quickPrompt, setQuickPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesTab = activeTab === 'trash' ? p.deleted : !p.deleted;
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadCustomAsset(file);
    createNewProject(`Edit uploaded media: ${file.name}`, file.name);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#09090B] text-zinc-100 font-sans">
      <aside className="w-64 border-r border-white/10 bg-[#0E0E12] p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-xl border border-white/10 bg-[#16161C] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-white/25 focus:outline-none"
            />
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeTab === 'projects'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              Dashboard · Projects
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
                activeTab === 'trash'
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              Trash
            </button>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 font-bold text-xs text-black">
              I
            </div>
            <div>
              <div className="text-xs font-medium text-white">Ishan</div>
              <div className="text-[10px] text-zinc-500">Creator Plan · GPT-6 Astra</div>
            </div>
          </div>
          <Settings className="h-4 w-4 text-zinc-500 hover:text-white cursor-pointer" />
        </div>
      </aside>

      <main className="flex-1 p-8 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif text-white">
              What are we editing today, Ishan?
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Start with a prompt, drop media files, or continue a recent cut.
            </p>
          </div>
          <span className="rounded-full bg-amber-500/15 border border-amber-400/30 px-3 py-1 font-mono text-xs text-amber-300">
            Apple Silicon Local Engine Active
          </span>
        </div>

        {activeTab === 'projects' && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#121216] p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-white flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  New project with prompt
                </span>
                <textarea
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="e.g., Assemble a 30s TikTok cut from my latest podcast recording with subtitles..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#18181C] p-3 text-xs text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    if (quickPrompt.trim()) {
                      createNewProject(quickPrompt);
                      setQuickPrompt('');
                    }
                  }}
                  disabled={!quickPrompt.trim()}
                  className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 disabled:opacity-40 transition"
                >
                  Generate Cut
                </button>
              </div>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-[#121216]/50 p-6 flex flex-col items-center justify-center text-center hover:border-amber-400/50 hover:bg-[#121216] transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition">
                <Upload className="h-5 w-5 text-amber-400" />
              </div>
              <div className="mt-3 text-sm font-medium text-white">
                Drag and drop media here
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Supports MP4, MOV, MP3, WAV, PNG, JPG (up to 4K)
              </p>
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              {activeTab === 'projects' ? 'Recent Projects' : 'Trash'}
            </h2>
            <span className="text-xs text-zinc-500">{filteredProjects.length} items</span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#111114] p-12 text-center text-zinc-500 text-xs">
              No projects found.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-white/10 bg-[#121216] overflow-hidden hover:border-amber-400/40 transition group flex flex-col justify-between"
                >
                  <div
                    onClick={() => activeTab === 'projects' && openProject(proj.id)}
                    className="p-5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                      <span>{proj.aspectRatio}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {proj.duration}s
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-medium text-white group-hover:text-amber-300 transition">
                      {proj.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Updated {proj.updatedAt}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1">
                      <span className="rounded bg-purple-500/15 border border-purple-400/30 px-1.5 py-0.5 text-[10px] text-purple-300 font-mono">
                        {proj.clips.filter((c) => c.trackType === 'captions').length} Captions
                      </span>
                      <span className="rounded bg-blue-500/15 border border-blue-400/30 px-1.5 py-0.5 text-[10px] text-blue-300 font-mono">
                        {proj.clips.filter((c) => c.trackType === 'video').length} Shots
                      </span>
                      <span className="rounded bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 text-[10px] text-amber-300 font-mono">
                        Audio Synced
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] bg-[#16161D] px-4 py-2.5 flex items-center justify-between text-xs">
                    {activeTab === 'projects' ? (
                      <>
                        <button
                          onClick={() => openProject(proj.id)}
                          className="font-medium text-white hover:text-amber-400 flex items-center gap-1"
                        >
                          Open in Editor <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="text-zinc-500 hover:text-rose-400 transition"
                          title="Move to trash"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => restoreProject(proj.id)}
                          className="font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Restore
                        </button>
                        <span className="text-zinc-500 text-[10px]">In trash</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
