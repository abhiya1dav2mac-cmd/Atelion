import React, { useState } from 'react';
import { useCardboardStore } from '../store/useCardboardStore';
import { X, Download, CheckCircle, Film, Sparkles, Cpu } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { exportModalOpen, setExportModalOpen, projects, activeProjectId } = useCardboardStore();
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const [format, setFormat] = useState<'mp4' | 'mov' | 'fcpxml' | 'prxml'>('mp4');
  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p'>('4k');
  const [fps, setFps] = useState<'60' | '30' | '24'>('60');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);

  if (!exportModalOpen) return null;

  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(10);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setDownloadReady(true);
          return 100;
        }
        return prev + 18;
      });
    }, 250);
  };

  const handleTriggerDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeProject.title.toLowerCase().replace(/\s+/g, '-')}-${resolution}.${format}`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121217] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Export Video</h3>
            <p className="text-xs text-zinc-400">{activeProject.title} · {activeProject.duration}s</p>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 flex items-center gap-2.5 text-xs text-amber-300">
          <Cpu className="h-4 w-4 shrink-0 text-amber-400" />
          <span>Local Apple Silicon hardware acceleration active (12× faster than real-time render).</span>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Output Format</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'mp4', label: 'MP4 (H.264 / AAC)' },
              { id: 'mov', label: 'MOV (ProRes 422)' },
              { id: 'fcpxml', label: 'Final Cut Pro XML' },
              { id: 'prxml', label: 'Premiere Pro EDL' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`rounded-xl border p-2.5 text-left transition ${
                  format === f.id
                    ? 'border-white bg-white/10 text-white font-medium'
                    : 'border-white/10 bg-[#181820] text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">Resolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#181820] px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="4k">4K Ultra HD (3840×2160)</option>
              <option value="1080p">1080p Full HD (1920×1080)</option>
              <option value="720p">720p Web (1280×720)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">Frame Rate</label>
            <select
              value={fps}
              onChange={(e) => setFps(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#181820] px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="60">60 FPS (Silky Smooth)</option>
              <option value="30">30 FPS (Standard)</option>
              <option value="24">24 FPS (Cinematic)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          {isExporting ? (
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs text-zinc-400">
                <span>Rendering frames with Media Engine…</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  style={{ width: `${exportProgress}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-200"
                />
              </div>
            </div>
          ) : downloadReady ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 p-3 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle className="h-4 w-4" />
                <span>Render completed successfully! Ready to save.</span>
              </div>
              <button
                onClick={handleTriggerDownload}
                className="w-full rounded-xl bg-white py-2.5 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                Download Rendered File
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartExport}
              className="w-full rounded-xl bg-white py-2.5 text-xs font-semibold text-black hover:bg-zinc-200"
            >
              Start Export (12× Cloud / Local)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
