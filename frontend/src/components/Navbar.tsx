import React, { useState } from 'react';
import { useCardboardStore } from '../store/useCardboardStore';
import { ChevronDown, Sparkles, Terminal, Layers } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { route, setRoute } = useCardboardStore();
  const [pluginsOpen, setPluginsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#09090B]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setRoute('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-black shadow-md shadow-amber-500/20 transition-transform group-hover:scale-105">
              <Layers className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white font-serif">
              Cardboard
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setRoute('recipes')}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                route === 'recipes'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Recipes
            </button>
            <button
              onClick={() => setRoute('mac')}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                route === 'mac'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Mac
            </button>

            <div
              className="relative"
              onMouseEnter={() => setPluginsOpen(true)}
              onMouseLeave={() => setPluginsOpen(false)}
            >
              <button
                onClick={() => setRoute('plugins')}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  route === 'plugins'
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>Plugins</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>

              {pluginsOpen && (
                <div className="absolute left-0 top-full pt-2 w-64 z-50">
                  <div className="rounded-xl border border-white/10 bg-[#121216] p-2 shadow-2xl">
                    <button
                      onClick={() => {
                        setPluginsOpen(false);
                        setRoute('plugins');
                      }}
                      className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left hover:bg-white/[0.06] transition"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">ChatGPT plugin</div>
                        <div className="text-xs text-zinc-400">Edit video in ChatGPT</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setPluginsOpen(false);
                        setRoute('plugins');
                      }}
                      className="mt-1 flex w-full items-start gap-3 rounded-lg p-2.5 text-left hover:bg-white/[0.06] transition"
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                        <Terminal className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Claude plugin</div>
                        <div className="text-xs text-zinc-400">Edit video in Claude</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setRoute('pricing')}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                route === 'pricing'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => setRoute('changelog')}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                route === 'changelog'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Changelog
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRoute('dashboard')}
            className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] transition"
          >
            Login
          </button>
          <button
            onClick={() => setRoute('editor')}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black shadow-sm hover:bg-zinc-200 transition"
          >
            Get started
          </button>
          <button
            onClick={() => setRoute('mac')}
            className="hidden sm:inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-white/10 transition"
          >
            Download for Mac
          </button>
        </div>
      </div>
    </header>
  );
};
