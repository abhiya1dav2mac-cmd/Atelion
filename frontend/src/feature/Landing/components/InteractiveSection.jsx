import React from 'react';

export default function InteractiveSection() {
  return (
    <section id="interactive" className="py-16 sm:py-20 px-3 sm:px-6 w-full max-w-[1440px] mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[11px] font-mono-code uppercase tracking-widest text-blue-600 font-semibold">
          CHAPTER SPREAD PREVIEW
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-gray-950 font-normal mt-2">
          Sub-100ms response thresholds & tactile demos
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Every chapter pairs fundamental human perception science with copy-paste production React & CSS recipes.
        </p>
      </div>

      {/* Browser Mockup with Cyan Sticky Note - User PNG with expanded wide spread */}
      <div className="w-full max-w-[1340px] mx-auto flex justify-center items-center px-1 sm:px-4">
        <img
          src="/assets/browser-inspiration.png"
          alt="Stop collecting endless inspiration - Browser Spread"
          className="w-full h-auto object-contain select-none block drop-shadow-lg hover:scale-[1.005] transition-transform duration-300"
          loading="lazy"
        />
      </div>
    </section>
  );
}
