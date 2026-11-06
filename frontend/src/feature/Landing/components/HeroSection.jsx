import React from 'react';

export default function HeroSection() {
  return (
    <section id="hero" className="relative pt-10 pb-20 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200/80 shadow-sm text-[11px] font-mono-code font-medium text-gray-600 uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          A 180-PAGE DESK REFERENCE
        </div>

        <h1 className="font-serif-display text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-gray-950 leading-[1.08] mb-6">
          The active guide to app <br className="hidden sm:inline" />
          <span className="italic font-light">and web interaction</span>
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-base text-gray-600 leading-relaxed font-normal mb-8">
          A tactile manual for designers and engineers who craft resilient, intuitive, and memorable software experiences.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <a
            href="#pricing"
            className="btn-blue-pill text-white text-sm font-semibold px-7 py-3 rounded-full inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <span>Get your copy — $39</span>
            <span>→</span>
          </a>
          <a
            href="#interactive"
            className="text-xs font-medium text-gray-600 hover:text-gray-900 px-5 py-3 rounded-full border border-gray-300/80 bg-white/60 hover:bg-white transition-all shadow-sm"
          >
            Explore sample spread ↵
          </a>
        </div>

        {/* Social Proof Logos */}
        <div className="pt-2 pb-8">
          <p className="text-[11px] font-mono-code text-gray-400 tracking-wider uppercase mb-5">
            Read by interaction teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all text-xs font-mono-code tracking-widest text-gray-600">
            <span className="font-semibold tracking-normal text-sm">FIGMA</span>
            <span className="font-semibold tracking-normal text-sm">STRIPE</span>
            <span className="font-semibold tracking-normal text-sm">LINEAR</span>
            <span className="font-semibold tracking-normal text-sm">VERCEL</span>
            <span className="font-semibold tracking-normal text-sm">APPLE</span>
            <span className="font-semibold tracking-normal text-sm">AIRBNB</span>
          </div>
        </div>
      </div>

      {/* 4K Flat-Lay Studio Desk Visual (100% Full Width Edge-to-Edge) */}
      <div className="w-full relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-0 my-0 overflow-hidden">
        <div className="w-full flex justify-center items-center">
          <img
            src="/assets/hero-flatlay.jpg"
            alt="The Pocket Design Playbook Flat-Lay Studio Desk Reference"
            className="w-full h-auto object-cover select-none pointer-events-none"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

