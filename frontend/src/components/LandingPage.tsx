import React, { useState } from 'react';
import { useCardboardStore } from '../store/useCardboardStore';
import {
  Sparkles,
  ArrowUp,
  Play,
  Check,
  Copy,
  Film,
  Mic,
  Scissors,
  Globe,
  ChevronDown,
  Layers,
  Terminal,
  Volume2,
  Share2,
  Clock,
} from 'lucide-react';

const HERO_RECIPES = [
  { label: 'Launch Video', prompt: 'Create a 30-second high-contrast launch video for our new AI workspace with kinetic chrome typography.' },
  { label: 'UGC', prompt: 'Edit this talking-head clip into a snappy 9:16 TikTok UGC review, cut all dead air, and add dynamic captions.' },
  { label: 'Explainer', prompt: 'Make a 45-second product explainer showing how teams collaborate on video timelines with clean motion graphics.' },
  { label: 'Montage', prompt: 'Make a short documentary on American makers, from forges and furnaces to the moon landing. Grainy archival feel.' },
  { label: 'Product Demo', prompt: 'Turn my screen recording demo.mp4 into a polished product walkthrough with automatic zoom keyframes.' },
  { label: 'Podcast Clip', prompt: 'Find the 3 best hot-take moments from this 50-minute interview, reframe to 9:16, and add captions.' },
];

const SHOWCASE_CARDS = [
  {
    id: 'sc-1',
    title: 'Product Ad',
    tag: 'Commercial · 0:24',
    bg: 'from-amber-500/25 via-zinc-900 to-zinc-950',
    desc: 'High-speed macro hardware reveal synced to percussion stems.',
  },
  {
    id: 'sc-2',
    title: 'Keyframed Portal',
    tag: 'Motion VFX · 0:18',
    bg: 'from-purple-500/25 via-zinc-900 to-zinc-950',
    desc: 'Seamless camera zoom transitions between 3D spatial layers.',
  },
  {
    id: 'sc-3',
    title: 'Paper Collage',
    tag: 'Mixed Media · 0:32',
    bg: 'from-emerald-500/25 via-zinc-900 to-zinc-950',
    desc: 'Stop-motion archival paper cutout animation driven by a single prompt.',
  },
  {
    id: 'sc-4',
    title: 'Talking Head',
    tag: 'Creator · 0:45',
    bg: 'from-blue-500/25 via-zinc-900 to-zinc-950',
    desc: 'Automatic dead-air removal, B-roll overlays, and behind-subject captions.',
  },
  {
    id: 'sc-5',
    title: 'Invisible Glass',
    tag: 'UI Showcase · 0:28',
    bg: 'from-rose-500/25 via-zinc-900 to-zinc-950',
    desc: 'Refractive glassmorphic product telemetry rendered at 60fps.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Which devices does Cardboard work on?',
    a: "Any computer with Chrome, plus a Mac app for Apple Silicon. Phones and tablets aren't supported yet.",
  },
  {
    q: "What's the difference between local and cloud processing?",
    a: 'The Mac app edits and exports on your Mac; in the browser, that happens in the cloud. AI features like transcription and generation use the cloud either way.',
  },
  {
    q: 'Can I use my own AI agent?',
    a: 'Yes. The Mac app works with Claude Code and Codex, and any agent can drive Cardboard through its CLI or MCP server.',
  },
  {
    q: 'Is my footage private?',
    a: 'Yes. Your footage is yours, and nothing is shared until you create a link. In the Mac app, your projects stay on your Mac.',
  },
  {
    q: 'How do I share or export my video?',
    a: 'Share a link people can watch and comment on, or export an MP4, MOV and more at up to 4K. You can also send the timeline to Premiere Pro, Final Cut Pro or DaVinci Resolve.',
  },
];

export const LandingPage: React.FC = () => {
  const {
    createNewProject,
    setRoute,
    openProject,
    billingCycle,
    setBillingCycle,
  } = useCardboardStore();

  const [heroPrompt, setHeroPrompt] = useState(
    'Make a short documentary on American makers, from forges and furnaces to the moon landing.'
  );
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [voiceStep, setVoiceStep] = useState(2);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [copiedDemoLink, setCopiedDemoLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeStoryTab, setActiveStoryTab] = useState(2);
  const [activeShapeTab, setActiveShapeTab] = useState(0);
  const [activeWorkTab, setActiveWorkTab] = useState(1);
  const [activeProductTab, setActiveProductTab] = useState(0);

  const handleImprovePrompt = () => {
    setHeroPrompt((prev) =>
      prev.includes('archival')
        ? prev
        : `${prev.trim()} Grainy 16mm archival film feel, cut tightly to an orchestral score, with warm studio narration and dynamic captions.`
    );
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 selection:bg-amber-500/30 font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-normal tracking-tight text-white sm:text-6xl md:text-7xl font-serif">
            Make a highlight
          </h1>

          {/* Hero Prompt Box */}
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-[#16161C]/90 p-3 shadow-2xl backdrop-blur-xl">
            <textarea
              value={heroPrompt}
              onChange={(e) => setHeroPrompt(e.target.value)}
              rows={3}
              placeholder="Describe your video, or drop footage..."
              className="w-full resize-none bg-transparent px-3 py-2 text-base text-white placeholder-zinc-500 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-2.5 px-1">
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-300 hover:bg-white/[0.08]">
                  <span>+</span>
                  <span>Auto</span>
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                </button>
                <button
                  type="button"
                  onClick={handleImprovePrompt}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Improve</span>
                </button>
              </div>

              <button
                onClick={() => createNewProject(heroPrompt)}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-black hover:bg-zinc-200 transition shadow-md"
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Quick-Start Recipe Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {HERO_RECIPES.map((r) => (
              <button
                key={r.label}
                onClick={() => setHeroPrompt(r.prompt)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-zinc-300 hover:border-white/30 hover:bg-white/[0.08] hover:text-white transition"
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="mt-5 text-xs text-zinc-500">
            or make it in{' '}
            <button
              onClick={() => setRoute('plugins')}
              className="text-zinc-300 underline decoration-white/20 underline-offset-4 hover:text-white"
            >
              ChatGPT · Claude
            </button>
          </div>
        </div>

        {/* Timeline tick marks visual */}
        <div className="mt-16 border-b border-white/[0.06] py-3 overflow-hidden opacity-30 select-none">
          <div className="flex justify-between max-w-7xl mx-auto px-4 font-mono text-[9px] text-zinc-600">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="flex flex-col items-center">
                <span className="h-2 w-px bg-zinc-600" />
                <span>0:{i < 10 ? `0${i}` : i}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MADE WITH CARDBOARD - SHOWCASE SECTION */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-normal font-serif text-white sm:text-4xl">
            Made with Cardboard
          </h2>
          <p className="mt-2 text-sm text-zinc-400">Remarkable video quality</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 aspect-[4/3] p-6 flex flex-col justify-between">
            <span className="text-xs font-mono text-amber-400">Archival Cityscape</span>
            <div>
              <h3 className="text-lg font-semibold text-white">The Steel that Built Our Cities</h3>
              <p className="text-xs text-zinc-400 mt-1">High precision archival grading and sync.</p>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 aspect-[4/3] flex items-center justify-center">
            <div className="text-center p-6 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg">
                <Play className="h-5 w-5 fill-current ml-0.5" />
              </div>
              <div className="text-lg font-medium text-white font-serif">You&apos;re in control</div>
              <p className="text-xs text-zinc-400 max-w-xs">Cut, replace, retime, and generate shots with natural prompts.</p>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 aspect-[4/3]">
            <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-zinc-900 to-black p-6 flex flex-col justify-between">
              <span className="inline-block self-start rounded bg-black/60 px-2 py-1 font-mono text-[10px] text-zinc-400 border border-white/10">
                1080x1920 · 9:16
              </span>
              <div>
                <div className="text-xs text-amber-400 font-mono">Dynamic Captions</div>
                <h4 className="text-xl font-medium text-white font-serif mt-1">&ldquo;It just looks like magic.&rdquo;</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setRoute('editor')}
            className="rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition"
          >
            Get started
          </button>
        </div>
      </section>

      {/* 3. YOUR FIRST VIDEO IN THREE STEPS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-normal font-serif text-white sm:text-4xl">
            Your first video in three steps
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Describe it, direct it, and share it. Here&apos;s how your first cut comes together.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6 flex flex-col justify-between">
            <div className="rounded-xl border border-white/10 bg-[#18181C] p-4">
              <div className="text-xs text-zinc-300 font-medium">
                Turn my product demo into a launch video
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 border border-white/10 px-2 py-1 font-mono text-[11px] text-zinc-300">
                    <Film className="h-3 w-3 text-blue-400" /> demo.mp4
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 border border-white/10 px-2 py-1 font-mono text-[11px] text-zinc-300">
                    <Film className="h-3 w-3 text-amber-400" /> b-roll.mov
                  </span>
                </div>
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-black">
                  <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-base font-medium text-white">Describe it</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Use a prompt, your footage, or both, and Cardboard builds your editable first cut.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6 flex flex-col justify-between">
            <div className="rounded-xl border border-white/10 bg-[#18181C] p-4 space-y-2.5">
              <div className="self-end rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-white inline-block">
                Make the intro faster and add captions
              </div>
              <div className="text-[11px] text-zinc-300 flex items-center gap-1.5 pt-1">
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Done. Intro trimmed and captions added.
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between font-mono text-[9px] text-zinc-500 mb-1">
                  <span>| 0:00</span>
                  <span>| 0:01</span>
                  <span>| 0:02</span>
                  <span>| 0:03</span>
                  <span>| 0:04</span>
                  <span>| 0:05</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    4s → 2s
                  </span>
                  <div className="h-6 flex-1 bg-blue-600/30 border border-blue-400/40 rounded flex items-center px-2 text-[10px] text-blue-200">
                    Clip 01
                  </div>
                  <div className="h-6 flex-1 bg-blue-600/30 border border-blue-400/40 rounded flex items-center px-2 text-[10px] text-blue-200">
                    Clip 02
                  </div>
                </div>
                <div className="mt-1 flex gap-1">
                  <span className="rounded bg-purple-500/25 border border-purple-400/30 px-1.5 py-0.5 font-mono text-[9px] text-purple-200">
                    Caption
                  </span>
                  <span className="rounded bg-purple-500/25 border border-purple-400/30 px-1.5 py-0.5 font-mono text-[9px] text-purple-200">
                    Caption
                  </span>
                </div>
                <div className="mt-1 rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-[9px] text-zinc-400">
                  soundtrack.mp3
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-base font-medium text-white">Direct it</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Refine the first cut through simple chat requests or right on the timeline.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6 flex flex-col justify-between">
            <div className="rounded-xl border border-white/10 bg-[#18181C] p-4 flex flex-col items-center justify-center relative min-h-[140px]">
              <div className="flex items-center justify-between w-full mb-3">
                <button
                  onClick={() => {
                    setCopiedDemoLink(true);
                    setTimeout(() => setCopiedDemoLink(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-1 text-xs text-emerald-300"
                >
                  <Copy className="h-3 w-3" />
                  {copiedDemoLink ? 'Copied!' : 'Link copied'}
                </button>
                <span className="rounded-lg bg-zinc-800 border border-white/10 px-2.5 py-1 text-xs text-zinc-300">
                  Export MP4
                </span>
              </div>

              <div className="w-20 h-20 rounded-full border border-zinc-700 flex items-center justify-center relative my-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-amber-400" />
                </div>
                <div className="absolute -top-1 -left-2 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-black">
                  M
                </div>
                <div className="absolute -bottom-1 -right-2 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white">
                  L
                </div>
              </div>

              <div className="flex items-center justify-between w-full text-[10px] text-zinc-400 mt-2">
                <span>Shared with team</span>
                <span className="rounded bg-amber-500/15 border border-amber-400/30 px-1.5 py-0.5 text-amber-300">
                  3 comments
                </span>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-base font-medium text-white">Share it</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                Send a link to your team for feedback, or export the finished video.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EVERYTHING YOU NEED TO MAKE VIDEOS */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-xl">
          <h2 className="text-3xl font-normal font-serif text-white sm:text-4xl">
            Everything you need to make videos
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Build the story, shape the edit, then share or export it, all in one editor.
          </p>
        </div>

        {/* 01 BUILD THE STORY */}
        <div className="mt-16">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-serif text-2xl text-zinc-600">01</span>
            <h3 className="text-2xl font-serif text-white">Build the story</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              {[
                'Generate video, images, music, and sound effects.',
                'Create motion graphics from a prompt.',
                'Clone your voice and narrate in it.',
                'Source relevant B-roll from the internet.',
                'Use reference links to videos you like.',
              ].map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStoryTab(idx)}
                  className={`w-full text-left p-3 rounded-xl transition text-sm flex items-start gap-3 ${
                    activeStoryTab === idx
                      ? 'bg-white/10 text-white font-medium border-l-2 border-white pl-4'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span>{text}</span>
                </button>
              ))}
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-white/10 bg-[#141418] p-6 shadow-2xl">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-amber-400" />
                    Voice clone · Read this aloud
                  </span>
                  <span className="font-mono">{voiceStep} / 4</span>
                </div>

                <div className="my-6 rounded-xl border border-white/10 bg-[#1A1A22] p-5 text-sm text-zinc-200 leading-relaxed font-serif">
                  &ldquo;Here is the thing nobody tells you about starting something new. The first version is supposed to be rough.&rdquo;
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex items-center gap-3">
                  <button
                    onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                    className="h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center text-white"
                  >
                    <div className="h-3 w-3 bg-white rounded-sm" />
                  </button>
                  <div className="flex-1 flex items-center gap-1">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full ${
                          i % 3 === 0 ? 'h-6 bg-white' : i % 2 === 0 ? 'h-4 bg-zinc-400' : 'h-2 bg-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs text-zinc-400">0:28</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono">Keep reading · 2s to go</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVoiceStep((s) => (s < 4 ? s + 1 : 1))}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-zinc-400 hover:text-white"
                    >
                      Skip esc
                    </button>
                    <button
                      onClick={() => alert('Voice profile created and ready for narration!')}
                      className="rounded-lg bg-blue-600 px-3.5 py-1.5 font-medium text-white hover:bg-blue-500"
                    >
                      Clone voice ↵
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 02 SHAPE THE EDIT */}
        <div className="mt-20 border-t border-white/[0.06] pt-16">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-serif text-2xl text-zinc-600">02</span>
            <h3 className="text-2xl font-serif text-white">Shape the edit</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              {[
                'Cut dead air, filler words, and retakes.',
                'Pull the best moments from long recordings.',
                'Captions, reframing, and chat-directed revisions.',
              ].map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveShapeTab(idx)}
                  className={`w-full text-left p-3 rounded-xl transition text-sm flex items-start gap-3 ${
                    activeShapeTab === idx
                      ? 'bg-white/10 text-white font-medium border-l-2 border-white pl-4'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span>{text}</span>
                </button>
              ))}
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-white/10 bg-[#141418] p-6 shadow-2xl">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
                  <span className="font-semibold text-white">Transcript</span>
                  <span className="font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                    −6s of dead air
                  </span>
                </div>

                <div className="py-4 space-y-3 font-mono text-xs">
                  <div className="text-zinc-300">
                    <span className="text-zinc-500 mr-3">0:00</span>
                    So, um, this is the new dashboard.
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-zinc-500 mr-3">0:04</span>
                    Everything you need is like, in one view.
                  </div>
                  <div className="flex items-center justify-between text-zinc-500 line-through">
                    <div>
                      <span className="mr-3">0:08</span>
                      You can filter by, uh— let me redo that.
                    </div>
                    <span className="rounded bg-zinc-800 border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-400 no-underline">
                      Retake
                    </span>
                  </div>
                  <div className="text-white font-medium bg-white/[0.04] p-2 rounded-lg border border-white/10">
                    <span className="font-mono text-zinc-400 mr-3">0:12</span>
                    You can filter by team.
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full ${
                          i % 4 === 0 ? 'h-5 bg-white' : 'h-2.5 bg-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400">Cleaned & Synced</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 03 WORK AND PUBLISH YOUR WAY */}
        <div className="mt-20 border-t border-white/[0.06] pt-16">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-serif text-2xl text-zinc-600">03</span>
            <h3 className="text-2xl font-serif text-white">Work and publish your way</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              {[
                'Connect Claude Code or Codex through the desktop app.',
                'Share work with a link.',
                'Render an hour of footage in about five minutes.',
              ].map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveWorkTab(idx)}
                  className={`w-full text-left p-3 rounded-xl transition text-sm flex items-start gap-3 ${
                    activeWorkTab === idx
                      ? 'bg-white/10 text-white font-medium border-l-2 border-white pl-4'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span>{text}</span>
                </button>
              ))}
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-white/10 bg-[#141418] p-6 shadow-2xl max-w-md mx-auto">
                <div className="text-sm font-medium text-white mb-4">Share</div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#1D1D24] p-2">
                  <input
                    readOnly
                    value="https://cardboard.ai/v/makers-doc-bf8c0"
                    className="flex-1 bg-transparent px-2 text-xs text-zinc-300 outline-none font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('https://cardboard.ai/v/makers-doc-bf8c0');
                      alert('Share link copied to clipboard!');
                    }}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200"
                  >
                    Copy link
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                  <span>Shared with team</span>
                  <div className="flex -space-x-1">
                    <span className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-[#141418] flex items-center justify-center text-[10px] text-black font-bold">
                      M
                    </span>
                    <span className="h-6 w-6 rounded-full bg-blue-500 border-2 border-[#141418] flex items-center justify-center text-[10px] text-white font-bold">
                      L
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-400/20 p-2.5 text-xs text-amber-300 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>3 timestamped comments from Maya & Leo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE DESKTOP SHOWCASE */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 border-t border-white/[0.06]">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-serif font-normal text-white sm:text-4xl">
              Make videos the way you do everything else
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Create directly in Cardboard, use its agent, or connect your agents to bring your project to life.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openProject('proj-makers')}
              className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-zinc-200 transition"
            >
              Launch Editor →
            </button>
            <button
              onClick={() => setRoute('mac')}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
            >
              Download for Mac
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0D0D11] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#16161D] px-4 py-2 text-xs text-zinc-300">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
              </div>
              <span className="font-semibold text-white">Cardboard</span>
              <span className="hidden sm:inline text-zinc-400 text-[11px]">
                File &nbsp; Edit &nbsp; Playback &nbsp; View &nbsp; Window &nbsp; Help
              </span>
            </div>
            <div className="font-mono text-[11px] text-zinc-400">Mon Sep 28 9:41 AM</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            <div className="lg:col-span-8 border-r border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#111116] px-4 py-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">Dashboard</span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-white font-medium">
                    Makers documentary
                  </span>
                  <span className="text-zinc-600">+</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                    16:9
                  </span>
                  <button
                    onClick={() => openProject('proj-makers')}
                    className="rounded bg-white px-2.5 py-0.5 font-semibold text-black text-[11px]"
                  >
                    Export ⌘E
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col items-center justify-center bg-black/60 relative">
                <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border border-white/10 bg-zinc-900 shadow-xl flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="text-center p-6 space-y-2">
                    <span className="text-xs font-mono text-amber-400">Furnace Wide Shot #14</span>
                    <h4 className="text-xl font-medium text-white font-serif">Makers Documentary Master</h4>
                  </div>
                  <div className="absolute bottom-3 text-center w-full px-4">
                    <span className="rounded bg-black/75 px-3 py-1 text-sm font-semibold text-white">
                      and its progress.
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 bg-[#111116] p-3 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                  <span className="text-white font-semibold">0:20 / 1:04</span>
                  <span>00:00:20.725</span>
                </div>

                <div className="space-y-1">
                  <div className="h-6 rounded bg-purple-500/25 border border-purple-400/30 px-2 flex items-center text-[10px] text-purple-200 font-mono">
                    Captions · We work with our hands, and our hands serve us well...
                  </div>
                  <div className="flex gap-1 overflow-hidden">
                    {['14 | original', '21 | forge', '22 | steel', '24 | city', '25 | furnace', '69 | cnc'].map((s) => (
                      <div
                        key={s}
                        className="h-8 flex-1 rounded bg-blue-600/30 border border-blue-400/40 px-1.5 flex items-center justify-center text-[10px] text-blue-200 font-mono whitespace-nowrap"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                  <div className="h-5 rounded bg-emerald-500/20 border border-emerald-400/30 px-2 flex items-center text-[10px] text-emerald-300 font-mono">
                    Voiceover · Narrator (Warm Archival)
                  </div>
                  <div className="h-5 rounded bg-amber-500/20 border border-amber-400/30 px-2 flex items-center text-[10px] text-amber-300 font-mono">
                    Score · American Maker Orchestral Tape
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 p-5 bg-[#121217] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold text-white">AI Director</span>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                    GPT-6 Astra
                  </span>
                </div>

                <div className="rounded-xl bg-[#1A1A22] p-3 text-xs text-zinc-200 space-y-1">
                  <div className="font-mono text-[10px] text-amber-400">makers-reference.mp4</div>
                  <p>
                    Make a short documentary on American makers, from forges and furnaces to the moon landing.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-zinc-400">Worked for 12m 36s</div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    I&apos;ll match your reference cut for cut: 73 shots across 30 subjects, from forges and furnaces to the moon landing.
                  </p>
                  <div className="rounded-lg bg-black/40 border border-white/10 p-2 font-mono text-[10px] text-emerald-400 space-y-1">
                    <div>✓ Transcribed reference</div>
                    <div>✓ Found archival footage: &ldquo;American Maker&rdquo;</div>
                    <div>✓ Generated video: Molten steel pouring</div>
                    <div>✓ Sourced stock footage: CNC cutting</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openProject('proj-makers')}
                className="mt-6 w-full rounded-xl bg-white py-2 text-xs font-semibold text-black hover:bg-zinc-200"
              >
                Open Full Interactive Workspace →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#111114] p-4 text-xs">
            <span className="font-semibold text-white">Cardboard can connect to Claude Code and Codex.</span>
            <p className="mt-1 text-zinc-400">Drive the full NLE timeline programmatically via local MCP.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#111114] p-4 text-xs">
            <span className="font-semibold text-white">Users can work in Cardboard directly or through their agents.</span>
            <p className="mt-1 text-zinc-400">Hybrid UI: canvas timeline editor + autonomous editing chat.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#111114] p-4 text-xs">
            <span className="font-semibold text-white">Lite is free on Apple Silicon because processing runs locally.</span>
            <p className="mt-1 text-zinc-400">Hardware accelerated media engine for zero cloud overhead.</p>
          </div>
        </div>
      </section>

      {/* 6. "YOUR NEXT PRODUCT VIDEO" CATEGORY SHOWCASE */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <h2 className="text-3xl font-normal font-serif text-white sm:text-4xl">
              Your next product video, made in Cardboard.
            </h2>
            <p className="mt-2 text-sm text-zinc-400">No editing experience needed.</p>

            <div className="mt-8 space-y-2">
              {[
                'Product Showcases',
                'Viral Trends',
                'Launch Videos',
                'UGC Ads',
                'Explainers',
                'Vlogs',
                'Podcast Clips',
              ].map((category, idx) => (
                <button
                  key={category}
                  onClick={() => setActiveProductTab(idx)}
                  className={`block text-left text-base transition ${
                    activeProductTab === idx
                      ? 'text-white font-medium underline decoration-white decoration-2 underline-offset-8'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-950 overflow-hidden aspect-[16/10] shadow-2xl flex items-center justify-center p-8">
              <div className="text-center space-y-3">
                <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                  Featured Category: {[
                    'Product Showcases',
                    'Viral Trends',
                    'Launch Videos',
                    'UGC Ads',
                    'Explainers',
                    'Vlogs',
                    'Podcast Clips',
                  ][activeProductTab]}
                </div>
                <h3 className="text-2xl font-serif text-white">Automated Motion & Kinetic Typography</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Turn product URLs or assets into multi-track video cuts ready for social distribution.
                </p>
                <button
                  onClick={() => createNewProject(`Launch video for product showcase`)}
                  className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
                >
                  Create in this style
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMPLETE PRICING SECTION */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-normal text-white sm:text-4xl">
            Pricing for every stage of editing
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Every plan includes the full editing suite.
          </p>

          <div className="mt-6 inline-flex items-center rounded-full border border-white/10 bg-[#141418] p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-5 py-1.5 text-xs font-medium transition ${
                billingCycle === 'monthly' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`rounded-full px-5 py-1.5 text-xs font-medium transition ${
                billingCycle === 'annual' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Annual <span className="text-amber-400 ml-1">Save up to 61%</span>
            </button>
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            Launch pricing, up to 78% off your first month.
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Lite</h3>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-zinc-300">
                  Free on Mac App
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-normal font-serif text-white">$5</span>
                <span className="text-xs text-zinc-400">/first month</span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Then <span className="line-through">$10</span> {billingCycle === 'annual' ? '$8/month' : '$10/month'}
              </div>

              <button
                onClick={() => setRoute('editor')}
                className="mt-6 w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition"
              >
                Get started
              </button>

              <div className="mt-6 space-y-2 text-xs text-zinc-400">
                <div>⏱ Standard usage</div>
                <div>✦ Generative AI not included</div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">✓ Captions</div>
                <div className="flex items-center gap-2 text-zinc-500">✕ Watermark-free exports</div>
                <div className="flex items-center gap-2">✓ Reframing</div>
                <div className="flex items-center gap-2">✓ Video cleanup</div>
                <div className="flex items-center gap-2">✓ Motion graphics</div>
                <div className="flex items-center gap-2">✓ Full suite of editing tools</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Starter</h3>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-normal font-serif text-white">$9</span>
                <span className="text-xs text-zinc-400">/first month</span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Then <span className="line-through">$40</span> {billingCycle === 'annual' ? '$29/month' : '$40/month'}
              </div>

              <button
                onClick={() => setRoute('editor')}
                className="mt-6 w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition"
              >
                Get started
              </button>

              <div className="mt-6 space-y-2 text-xs text-zinc-400">
                <div>⏱ 2.5x usage</div>
                <div>✦ 400 generative credits</div>
                <div className="text-[11px] text-zinc-500">Base model access (Hailuo, Kling 2.5, Image gen etc)</div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">✓ Everything in Lite</div>
                <div className="flex items-center gap-2">✓ Unlimited, watermark-free exports</div>
                <div className="flex items-center gap-2">✓ NLE exports</div>
                <div className="flex items-center gap-2">✓ AI-generated music</div>
                <div className="flex items-center gap-2">✓ Stock footage</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/50 bg-[#121622] p-6 flex flex-col justify-between shadow-2xl relative">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Creator</h3>
                <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 text-[10px] font-medium">
                  Recommended
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-normal font-serif text-white">$30</span>
                <span className="text-xs text-zinc-400">/first month</span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Then <span className="line-through">$100</span> {billingCycle === 'annual' ? '$59/month' : '$100/month'}
              </div>

              <button
                onClick={() => setRoute('editor')}
                className="mt-6 w-full rounded-xl bg-white py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition"
              >
                Get started
              </button>

              <div className="mt-6 space-y-2 text-xs text-zinc-400">
                <div>⏱ 10x usage</div>
                <div>✦ 1,500 generative credits</div>
                <div className="text-[11px] text-zinc-500">Premium model access (Kling 3, Seed Dance 2.5, Omni, Veo etc)</div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">✓ Everything in Starter</div>
                <div className="flex items-center gap-2">✓ Voice cloning</div>
                <div className="flex items-center gap-2">✓ Web-sourced B-roll</div>
                <div className="flex items-center gap-2">✓ 4K exports</div>
                <div className="flex items-center gap-2">✓ Direct clips from X, Instagram, YouTube, Vimeo and more</div>
                <div className="flex items-center gap-2">✓ Match text styles and audio from any video link</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111114] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Pro</h3>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-normal font-serif text-white">$89</span>
                <span className="text-xs text-zinc-400">/first month</span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Then <span className="line-through">$250</span> {billingCycle === 'annual' ? '$175/month' : '$250/month'}
              </div>

              <button
                onClick={() => setRoute('editor')}
                className="mt-6 w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition"
              >
                Get started
              </button>

              <div className="mt-6 space-y-2 text-xs text-zinc-400">
                <div>⏱ 30x usage</div>
                <div>✦ 5,000 generative credits</div>
                <div className="text-[11px] text-zinc-500">All models included</div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">✓ Everything in Creator</div>
                <div className="flex items-center gap-2">✓ Priority processing</div>
                <div className="flex items-center gap-2">✓ Early access to advanced AI features</div>
                <div className="flex items-center gap-2">✓ Higher usage limits</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => setRoute('pricing')}
            className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1"
          >
            Compare all plans →
          </button>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5">
            <h2 className="text-3xl font-serif font-normal text-white">
              Frequently asked questions
            </h2>
          </div>
          <div className="md:col-span-7 divide-y divide-white/10">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={item.q} className="py-4">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="flex w-full items-center justify-between text-left text-sm font-medium text-white"
                >
                  <span>{item.q}</span>
                  <span className="text-zinc-500 ml-4 font-mono text-base">
                    {openFaqIndex === idx ? '×' : '+'}
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM BANNER */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#141824] to-[#0A0D14] p-12 text-center overflow-hidden shadow-2xl">
          <div className="font-mono text-xs text-zinc-500 mb-2">00:26</div>
          <h2 className="text-4xl sm:text-5xl font-serif font-normal text-white">
            Get started with one prompt.<span className="animate-pulse">|</span>
          </h2>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setRoute('editor')}
              className="rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 transition"
            >
              Get started
            </button>
            <button
              onClick={() => setRoute('mac')}
              className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-xs font-medium text-white hover:bg-white/10"
            >
              Download for Mac
            </button>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Launch pricing on every plan. Cancel anytime.
          </p>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="relative border-t border-white/10 bg-[#09090B] pt-20 pb-12 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-16">
            <div className="md:col-span-5 space-y-4">
              <h3 className="text-2xl font-serif text-white max-w-xs leading-snug">
                Create stunning content 10x faster with our agentic video editor.
              </h3>
              <div className="flex gap-4 text-xs text-zinc-400">
                <span className="cursor-pointer hover:text-white">𝕏</span>
                <span className="cursor-pointer hover:text-white">Instagram</span>
                <span className="cursor-pointer hover:text-white">LinkedIn</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-white mb-3">Product</div>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li><button onClick={() => setRoute('pricing')} className="hover:text-white">Pricing</button></li>
                <li><button onClick={() => setRoute('recipes')} className="hover:text-white">Recipes</button></li>
                <li><button onClick={() => setRoute('plugins')} className="hover:text-white">Plugins</button></li>
                <li><button onClick={() => setRoute('changelog')} className="hover:text-white">Changelog</button></li>
                <li><span className="cursor-pointer hover:text-white">Support</span></li>
                <li><span className="cursor-pointer hover:text-white">Status</span></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs font-semibold text-white mb-3">Legal</div>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li><span className="cursor-pointer hover:text-white">Privacy</span></li>
                <li><span className="cursor-pointer hover:text-white">Terms of Service</span></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <div className="text-xs font-semibold text-white mb-3">Company</div>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li><span className="cursor-pointer hover:text-white">Blog</span></li>
                <li><span className="cursor-pointer hover:text-white">Careers</span></li>
                <li><span className="cursor-pointer hover:text-white">Hard problems</span></li>
                <li><span className="cursor-pointer hover:text-white">Y Combinator</span></li>
                <li><span className="cursor-pointer hover:text-white">Contact</span></li>
              </ul>
            </div>
          </div>

          <div className="py-6 select-none pointer-events-none text-center">
            <span className="text-7xl sm:text-9xl font-serif font-light text-white/[0.04] tracking-tight block">
              Cardboard
            </span>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-wrap justify-between items-center text-xs text-zinc-500">
            <span>© 2026 Cardboard Inc. All rights reserved.</span>
            <span>Made with ♥ in SF</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
