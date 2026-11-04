import React, { useState } from 'react';
import { useCardboardStore } from '../store/useCardboardStore';
import { X, Copy, Check, MessageSquare, Clock, Send, Users } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const {
    shareModalOpen,
    setShareModalOpen,
    projects,
    activeProjectId,
    currentTime,
    addComment,
    toggleResolveComment,
  } = useCardboardStore();

  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState('Ishan');

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  if (!shareModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(`https://cardboard.ai/v/${activeProject.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(authorName, commentText, currentTime);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121217] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Share Project</h3>
            <p className="text-xs text-zinc-400">{activeProject.title}</p>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-300 block mb-1.5">Project Web Link</label>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#181820] p-2">
            <input
              readOnly
              value={`https://cardboard.ai/v/${activeProject.id}`}
              className="flex-1 bg-transparent px-2 font-mono text-xs text-zinc-300 outline-none"
            />
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#16161D] p-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-zinc-300">
            <Users className="h-4 w-4 text-emerald-400" />
            Live Collaborators
          </span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Maya (Viewing)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Leo (Viewing)
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
              Timestamped Comments ({activeProject.comments.length})
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              Current Playhead: {currentTime.toFixed(1)}s
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {activeProject.comments.length === 0 ? (
              <div className="text-xs text-zinc-500 text-center py-4">No comments yet.</div>
            ) : (
              activeProject.comments.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-xl border p-2.5 text-xs transition ${
                    c.resolved
                      ? 'border-white/5 bg-[#141418] opacity-60'
                      : 'border-white/10 bg-[#181820]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1 text-white font-medium">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: c.avatarColor }}
                      />
                      {c.author}
                    </span>
                    <span className="text-amber-400 font-semibold">{c.timecode}s</span>
                  </div>
                  <p className="mt-1 text-zinc-200">{c.text}</p>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => toggleResolveComment(c.id)}
                      className="text-[10px] text-zinc-400 hover:text-white"
                    >
                      {c.resolved ? 'Mark unresolved' : 'Resolve ✓'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <form onSubmit={handleAddComment} className="flex gap-2 border-t border-white/10 pt-3">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Add comment at ${currentTime.toFixed(1)}s...`}
            className="flex-1 rounded-xl border border-white/10 bg-[#181820] px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-amber-400"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
