import React, { useRef, useEffect, useState } from 'react';
import { useCardboardStore } from '../store/useCardboardStore';
import {
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Share2,
  Download,
  Film,
  Mic,
  Music,
  Type,
  Send,
  Paperclip,
  Check,
  ChevronDown,
  Layers,
  Sliders,
  Settings2,
  Maximize2,
} from 'lucide-react';
import { AspectRatio, TimelineClip } from '../types/editor';

export const VideoEditorView: React.FC = () => {
  const {
    projects,
    activeProjectId,
    selectedClipId,
    currentTime,
    isPlaying,
    timelineZoom,
    isAgentWorking,
    setCurrentTime,
    setIsPlaying,
    setSelectedClipId,
    setTimelineZoom,
    setAspectRatio,
    updateClip,
    splitSelectedClip,
    duplicateSelectedClip,
    deleteSelectedClip,
    addAssetToTimeline,
    sendAiDirectorPrompt,
    setShareModalOpen,
    setExportModalOpen,
    undo,
    redo,
    openProject,
    setRoute,
  } = useCardboardStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const selectedClip = activeProject?.clips.find((c) => c.id === selectedClipId);

  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'inspector'>('library');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const startTime = performance.now();
      const initialTime = currentTime;

      const loop = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        const nextTime = initialTime + elapsed;
        if (nextTime >= activeProject.duration) {
          setCurrentTime(0);
          setIsPlaying(false);
        } else {
          setCurrentTime(Number(nextTime.toFixed(2)));
          animId = requestAnimationFrame(loop);
        }
      };
      animId = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTime, activeProject.duration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.key === 's' || e.key === 'S') {
        splitSelectedClip();
      } else if (e.key === 'd' || e.key === 'D') {
        duplicateSelectedClip();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedClip();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, splitSelectedClip, duplicateSelectedClip, deleteSelectedClip, undo, redo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const activeVideoClip = activeProject.clips
      .filter((c) => c.trackType === 'video')
      .find((c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration);

    const filter = activeVideoClip?.filter || 'archival';
    const scene = activeVideoClip?.sceneStyle || 'forge';

    ctx.clearRect(0, 0, width, height);

    if (scene === 'forge' || scene === 'welder') {
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
      grad.addColorStop(0, '#78350F');
      grad.addColorStop(0.5, '#451A03');
      grad.addColorStop(1, '#0F0906');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#FDE68A';
      for (let i = 0; i < 24; i++) {
        const x = (width * 0.45) + Math.sin(currentTime * 4 + i) * 160;
        const y = (height * 0.5) + Math.cos(currentTime * 3 + i * 2) * 90;
        ctx.beginPath();
        ctx.arc(x, y, (i % 3) + 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (scene === 'city' || scene === 'plane') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1E293B');
      grad.addColorStop(0.6, '#0F172A');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#090D16';
      for (let i = 0; i < 12; i++) {
        const h = 40 + (i % 5) * 25;
        ctx.fillRect(i * (width / 12), height - h - 30, width / 13, h + 30);
      }
    } else {
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, width, height);
    }

    if (filter === 'archival') {
      ctx.fillStyle = 'rgba(217, 119, 6, 0.08)';
      ctx.fillRect(0, 0, width, height);
    } else if (filter === 'chrome') {
      ctx.fillStyle = 'rgba(147, 197, 253, 0.12)';
      ctx.fillRect(0, 0, width, height);
    } else if (filter === 'noir') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 80; i++) {
      const gx = Math.random() * width;
      const gy = Math.random() * height;
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }
  }, [currentTime, activeProject.clips]);

  const activeCaption = activeProject.clips
    .filter((c) => c.trackType === 'captions')
    .find((c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = Math.max(0, clickX / timelineZoom);
    setCurrentTime(Number(newTime.toFixed(2)));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendAiDirectorPrompt(chatInput);
    setChatInput('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs < 10 ? `0${secs}` : secs}.${millis < 10 ? `0${millis}` : millis}`;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#09090B] text-zinc-100 font-sans overflow-hidden">
      {/* 1. TOP NLE HEADER */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#121217] px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRoute('dashboard')}
            className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            Dashboard
          </button>
          <div className="h-4 w-px bg-white/10" />

          {projects.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={() => openProject(p.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-medium transition ${
                p.id === activeProjectId
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>{p.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-lg border border-white/10 bg-[#1A1A22] p-0.5">
          {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`rounded-md px-2.5 py-1 text-xs font-mono font-medium transition ${
                activeProject.aspectRatio === ratio
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-white/10"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={() => setExportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export ⌘E</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 3-COLUMN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 border-r border-white/10 bg-[#0E0E12] flex flex-col justify-between">
          <div>
            <div className="flex border-b border-white/10 text-xs font-medium">
              <button
                onClick={() => setActiveTab('library')}
                className={`flex-1 py-2.5 text-center transition ${
                  activeTab === 'library'
                    ? 'border-b-2 border-white text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Media Library
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 py-2.5 text-center transition ${
                  activeTab === 'inspector'
                    ? 'border-b-2 border-white text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Inspector
              </button>
            </div>

            {activeTab === 'library' && (
              <div className="p-3 space-y-3">
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Project Assets ({activeProject.assets.length})
                </div>
                <div className="space-y-1.5 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
                  {activeProject.assets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => addAssetToTimeline(asset)}
                      className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#16161C] p-2 hover:border-amber-400/50 hover:bg-[#1E1E26] cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400">
                          {asset.type === 'video' ? <Film className="h-4 w-4 text-blue-400" /> : <Mic className="h-4 w-4 text-emerald-400" />}
                        </div>
                        <div className="overflow-hidden">
                          <div className="truncate text-xs font-medium text-white">{asset.name}</div>
                          <div className="font-mono text-[10px] text-zinc-500">{asset.duration}s · {asset.sceneStyle}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 font-mono">
                        + Add
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'inspector' && selectedClip && (
              <div className="p-4 space-y-4 text-xs">
                <div>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase">Selected Clip</span>
                  <div className="text-sm font-semibold text-white mt-0.5">{selectedClip.title}</div>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1.5">Color Grade</label>
                  <select
                    value={selectedClip.filter}
                    onChange={(e) => updateClip(selectedClip.id, { filter: e.target.value as any })}
                    className="w-full rounded-lg border border-white/10 bg-[#18181C] px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="none">None (Standard Rec.709)</option>
                    <option value="archival">Archival 16mm Warmth</option>
                    <option value="chrome">Chrome High Contrast</option>
                    <option value="warm">Studio Golden Hour</option>
                    <option value="noir">Noir Monochromatic</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Scale</span>
                    <span className="font-mono">{Math.round(selectedClip.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.05"
                    value={selectedClip.scale}
                    onChange={(e) => updateClip(selectedClip.id, { scale: parseFloat(e.target.value) })}
                    className="w-full accent-amber-400"
                  />
                </div>

                {selectedClip.trackType === 'captions' && (
                  <div className="rounded-xl border border-white/10 bg-[#16161C] p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Behind-Subject</div>
                      <div className="text-[10px] text-zinc-500">Render captions behind subject</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!selectedClip.behindSubject}
                      onChange={(e) => updateClip(selectedClip.id, { behindSubject: e.target.checked })}
                      className="accent-amber-400 h-4 w-4"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10 text-[11px] text-zinc-500 font-mono">
            Shot Cut: cut-for-cut matched to reference.mp4
          </div>
        </aside>

        <main className="flex-1 flex flex-col justify-between overflow-hidden bg-[#09090B]">
          <div className="flex-1 flex items-center justify-center p-6 relative">
            <div
              className={`relative rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl flex items-center justify-center ${
                activeProject.aspectRatio === '9:16'
                  ? 'h-[360px] aspect-[9/16]'
                  : activeProject.aspectRatio === '1:1'
                  ? 'h-[360px] aspect-square'
                  : 'w-[540px] aspect-video'
              }`}
            >
              <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-cover" />

              {activeCaption && (
                <div
                  className={`absolute w-full px-6 text-center select-none ${
                    activeCaption.behindSubject ? 'bottom-16 opacity-80' : 'bottom-6'
                  }`}
                >
                  <span className="inline-block rounded-lg bg-black/80 px-3 py-1.5 text-sm sm:text-base font-bold text-white shadow-lg border border-white/10">
                    {activeCaption.text}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="h-10 shrink-0 border-t border-b border-white/10 bg-[#111116] px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black hover:bg-zinc-200"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
              </button>
              <button
                onClick={() => setCurrentTime(0)}
                className="text-zinc-400 hover:text-white"
                title="Restart"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <div className="font-mono text-xs text-zinc-300">
                <span className="text-white font-semibold">{formatTimecode(currentTime)}</span> / {formatTimecode(activeProject.duration)}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={splitSelectedClip}
                disabled={!selectedClipId}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-40"
                title="Split at playhead (S)"
              >
                <Scissors className="h-3 w-3" /> Split (S)
              </button>
              <button
                onClick={duplicateSelectedClip}
                disabled={!selectedClipId}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 disabled:opacity-40"
                title="Duplicate (D)"
              >
                <Copy className="h-3 w-3" /> Duplicate (D)
              </button>
              <button
                onClick={deleteSelectedClip}
                disabled={!selectedClipId}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-rose-300 hover:bg-white/10 disabled:opacity-40"
                title="Delete (Backspace)"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ZoomOut className="h-3.5 w-3.5 text-zinc-500" />
              <input
                type="range"
                min="16"
                max="60"
                value={timelineZoom}
                onChange={(e) => setTimelineZoom(parseInt(e.target.value))}
                className="w-20 accent-amber-400"
              />
              <ZoomIn className="h-3.5 w-3.5 text-zinc-500" />
            </div>
          </div>

          <div
            ref={timelineRef}
            onClick={handleTimelineClick}
            className="h-56 shrink-0 bg-[#0C0C10] overflow-x-auto relative select-none p-3 border-t border-white/5"
          >
            <div className="relative h-6 border-b border-white/10 mb-2">
              {Array.from({ length: Math.ceil(activeProject.duration) + 1 }).map((_, sec) => (
                <div
                  key={sec}
                  style={{ left: `${sec * timelineZoom}px` }}
                  className="absolute top-0 flex flex-col items-start font-mono text-[9px] text-zinc-500 pointer-events-none"
                >
                  <span className="h-2 w-px bg-zinc-700" />
                  <span>{sec}s</span>
                </div>
              ))}
            </div>

            <div
              style={{ left: `${currentTime * timelineZoom}px` }}
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-30 pointer-events-none"
            >
              <div className="h-3 w-3 -ml-[5px] bg-amber-400 rounded-b-sm shadow-md" />
            </div>

            <div className="space-y-2">
              <div className="relative h-8 rounded-lg bg-[#14141A] border border-white/5">
                <span className="absolute left-2 top-2 z-10 font-mono text-[9px] text-purple-400 pointer-events-none">
                  Captions
                </span>
                {activeProject.clips
                  .filter((c) => c.trackType === 'captions')
                  .map((clip) => (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                        setActiveTab('inspector');
                      }}
                      style={{
                        left: `${clip.startTime * timelineZoom}px`,
                        width: `${clip.duration * timelineZoom}px`,
                      }}
                      className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[10px] font-mono truncate cursor-pointer transition ${
                        selectedClipId === clip.id
                          ? 'bg-purple-600 border border-white text-white z-20'
                          : 'bg-purple-500/25 border border-purple-400/30 text-purple-200 hover:bg-purple-500/40'
                      }`}
                    >
                      {clip.title}
                    </div>
                  ))}
              </div>

              <div className="relative h-10 rounded-lg bg-[#14141A] border border-white/5">
                <span className="absolute left-2 top-2 z-10 font-mono text-[9px] text-blue-400 pointer-events-none">
                  Video / B-roll
                </span>
                {activeProject.clips
                  .filter((c) => c.trackType === 'video')
                  .map((clip) => (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                        setActiveTab('inspector');
                      }}
                      style={{
                        left: `${clip.startTime * timelineZoom}px`,
                        width: `${clip.duration * timelineZoom}px`,
                      }}
                      className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[10px] font-mono truncate cursor-pointer transition ${
                        selectedClipId === clip.id
                          ? 'bg-blue-600 border border-white text-white z-20'
                          : 'bg-blue-500/25 border border-blue-400/30 text-blue-200 hover:bg-blue-500/40'
                      }`}
                    >
                      {clip.title}
                    </div>
                  ))}
              </div>

              <div className="relative h-8 rounded-lg bg-[#14141A] border border-white/5">
                <span className="absolute left-2 top-2 z-10 font-mono text-[9px] text-emerald-400 pointer-events-none">
                  Voiceover
                </span>
                {activeProject.clips
                  .filter((c) => c.trackType === 'voiceover')
                  .map((clip) => (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                      }}
                      style={{
                        left: `${clip.startTime * timelineZoom}px`,
                        width: `${clip.duration * timelineZoom}px`,
                      }}
                      className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[10px] font-mono truncate cursor-pointer transition ${
                        selectedClipId === clip.id
                          ? 'bg-emerald-600 border border-white text-white z-20'
                          : 'bg-emerald-500/25 border border-emerald-400/30 text-emerald-200'
                      }`}
                    >
                      {clip.title}
                    </div>
                  ))}
              </div>

              <div className="relative h-8 rounded-lg bg-[#14141A] border border-white/5">
                <span className="absolute left-2 top-2 z-10 font-mono text-[9px] text-amber-400 pointer-events-none">
                  Score
                </span>
                {activeProject.clips
                  .filter((c) => c.trackType === 'music')
                  .map((clip) => (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                      }}
                      style={{
                        left: `${clip.startTime * timelineZoom}px`,
                        width: `${clip.duration * timelineZoom}px`,
                      }}
                      className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[10px] font-mono truncate cursor-pointer transition ${
                        selectedClipId === clip.id
                          ? 'bg-amber-600 border border-white text-white z-20'
                          : 'bg-amber-500/25 border border-amber-400/30 text-amber-200'
                      }`}
                    >
                      {clip.title}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>

        <aside className="w-80 shrink-0 border-l border-white/10 bg-[#0E0E12] flex flex-col justify-between">
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-white">AI Director</span>
              </div>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                GPT-6 Astra
              </span>
            </div>

            <div className="p-2 border-b border-white/[0.06] bg-[#121217] flex gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => sendAiDirectorPrompt('Make this video shorter')}
                className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 whitespace-nowrap text-zinc-300 hover:bg-white/10"
              >
                Cut dead air
              </button>
              <button
                onClick={() => sendAiDirectorPrompt('Make this vertical for Reels and add captions')}
                className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 whitespace-nowrap text-zinc-300 hover:bg-white/10"
              >
                9:16 Vertical
              </button>
              <button
                onClick={() => sendAiDirectorPrompt('Add behind-subject captions')}
                className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 whitespace-nowrap text-zinc-300 hover:bg-white/10"
              >
                Captions
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {activeProject.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-white/10 text-white ml-4'
                      : 'bg-[#181820] border border-white/10 text-zinc-200 mr-2'
                  }`}
                >
                  {msg.attachment && (
                    <div className="font-mono text-[10px] text-amber-400 mb-1 flex items-center gap-1">
                      <Film className="h-3 w-3" /> {msg.attachment}
                    </div>
                  )}
                  {msg.workedDuration && (
                    <div className="font-mono text-[10px] text-zinc-400 mb-1">
                      {msg.workedDuration}
                    </div>
                  )}
                  <div>{msg.content}</div>

                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-2 space-y-1 rounded-lg bg-black/40 p-2 font-mono text-[10px] text-emerald-400">
                      {msg.toolCalls.map((tc) => (
                        <div key={tc.id} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3" />
                          <span>{tc.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isAgentWorking && (
                <div className="rounded-xl bg-[#181820] border border-amber-400/30 p-3 text-xs text-amber-300 animate-pulse font-mono flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>AI Director is executing edits across tracks…</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-white/10 bg-[#121217]">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1A1A22] px-3 py-1.5 focus-within:border-white/30">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Direct the video (e.g. add captions, trim intro)..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isAgentWorking}
                  className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-black hover:bg-zinc-200 disabled:opacity-40 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
};
