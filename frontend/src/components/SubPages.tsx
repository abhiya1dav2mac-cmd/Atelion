import React from 'react';
import { useCardboardStore } from '../store/useCardboardStore';
import { Cpu, Sparkles, Terminal, Play, Download, CheckCircle2 } from 'lucide-react';

export const SubPages: React.FC = () => {
  const { route, createNewProject, setRoute } = useCardboardStore();

  if (route === 'recipes') {
    const recipes = [
      {
        title: 'Product Launch Video',
        category: 'SaaS & Hardware',
        duration: '0:30',
        prompt:
          'Turn our feature release notes into a 30-second kinetic launch video with chrome 3D typography and synced percussion.',
      },
      {
        title: 'Archival Documentary Montage',
        category: 'Storytelling',
        duration: '1:05',
        prompt:
          'Make a short documentary on American makers, from forges and furnaces to the moon landing. Grainy archival feel.',
      },
      {
        title: '9:16 Viral Podcast Clip',
        category: 'Social Reels / TikTok',
        duration: '0:24',
        prompt:
          'Pull the top hot-take from this interview, reframe 9:16 around the speaker, and add behind-subject captions.',
      },
      {
        title: 'UGC Ad with Voice Clone',
        category: 'Performance Marketing',
        duration: '0:35',
        prompt:
          'Cut all dead air and retakes, overlay web-sourced B-roll every 4 seconds, and narrate the hook in my cloned voice.',
      },
    ];

    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 text-white font-sans">
        <div className="max-w-2xl">
          <div className="font-mono text-xs text-amber-400 uppercase tracking-wider">Cardboard Recipes</div>
          <h1 className="mt-2 text-4xl font-serif">Start from a proven editing workflow</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Click any recipe to load its prompt, multi-track structure, and AI Director instructions directly in the editor.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {recipes.map((r) => (
            <div
              key={r.title}
              className="rounded-2xl border border-white/10 bg-[#111114] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>{r.category}</span>
                  <span>{r.duration}</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">{r.title}</h3>
                <p className="mt-3 rounded-xl border border-white/10 bg-[#18181C] p-3.5 text-xs text-zinc-300">
                  &ldquo;{r.prompt}&rdquo;
                </p>
              </div>
              <button
                onClick={() => createNewProject(r.prompt, r.title)}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Run Recipe in Editor
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (route === 'mac') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 text-white text-center font-sans">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs text-amber-300">
          <Cpu className="h-3.5 w-3.5" /> Built natively for Apple Silicon (M1 / M2 / M3 / M4)
        </div>
        <h1 className="mt-5 text-4xl sm:text-6xl font-serif">Cardboard for Mac</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400 leading-relaxed">
          Lite is free on Apple Silicon because video processing and rendering run locally on your
          Mac&apos;s Media Engine. Connect directly to Claude Code and Codex via local MCP.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => setRoute('editor')}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold text-black hover:bg-zinc-200"
          >
            <Download className="h-4 w-4" /> Download for macOS (Universal .dmg)
          </button>
          <button
            onClick={() => setRoute('editor')}
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-xs font-semibold text-white hover:bg-white/10"
          >
            Launch Browser Editor Instead
          </button>
        </div>
      </div>
    );
  }

  if (route === 'plugins') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 text-white font-sans">
        <h1 className="text-4xl font-serif">ChatGPT, Claude & MCP Plugins</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Drive Cardboard&apos;s multi-track timeline from your favorite AI assistant or coding agent.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6">
            <Sparkles className="h-6 w-6 text-emerald-400" />
            <h3 className="mt-3 text-xl font-semibold">ChatGPT Plugin</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Ask ChatGPT to assemble cuts, add captions, and generate B-roll—then click &ldquo;Open in
              Cardboard&rdquo; to fine-tune every frame on the timeline.
            </p>
            <button
              onClick={() => setRoute('editor')}
              className="mt-6 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black"
            >
              Try ChatGPT Workflow
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6">
            <Terminal className="h-6 w-6 text-amber-400" />
            <h3 className="mt-3 text-xl font-semibold">Claude & Codex MCP Server</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Connect Claude Desktop, Claude Code, or Codex CLI directly to Cardboard to turn product
              changelogs and repositories into launch videos automatically.
            </p>
            <button
              onClick={() => setRoute('editor')}
              className="mt-6 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black"
            >
              Open MCP Sandbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-white font-sans">
      <div className="font-mono text-xs text-amber-400 uppercase tracking-wider">CHANGELOG · 2026</div>
      <h1 className="mt-2 text-4xl font-serif">What&apos;s new in Cardboard</h1>
      <div className="mt-8 space-y-6">
        {[
          {
            version: 'v2.6 — GPT-6 Astra Agent & Reference Film Matching',
            date: 'September 2026',
            notes:
              'Cut-for-cut reference documentary matching, web-sourced archival B-roll watching 130+ clips in parallel, and 12× real-time 4K rendering.',
          },
          {
            version: 'v2.4 — Claude Code & Codex MCP Server',
            date: 'August 2026',
            notes:
              'Drive the full Cardboard timeline from Claude Desktop, Claude Code, or terminal scripts.',
          },
          {
            version: 'v2.1 — Instant Voice Cloning & Behind-Subject Captions',
            date: 'July 2026',
            notes:
              'Clone your voice from a 27-second reading sample and place dynamic captions behind foreground speakers.',
          },
        ].map((log) => (
          <div key={log.version} className="rounded-2xl border border-white/10 bg-[#111114] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {log.version}
              </h3>
              <span className="font-mono text-xs text-zinc-400">{log.date}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{log.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
