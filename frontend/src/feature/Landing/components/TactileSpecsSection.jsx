import React from 'react';

export default function TactileSpecsSection() {
  return (
    <section id="specs" className="relative py-16 sm:py-24 w-full overflow-hidden border-t border-gray-200">
      <div className="text-center max-w-2xl mx-auto mb-10 px-4">
        <span className="text-[11px] font-mono-code uppercase tracking-widest text-blue-600 font-semibold">
          PHYSICAL BOOK CRAFT
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-gray-950 font-normal mt-2">
          Engineered for the physical desk
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Every specification was chosen by designers, for designers who appreciate analog substance.
        </p>
      </div>

      {/* Flat-lay showcase: Left paper ball anchored at left: 0 & mid booklet centered */}
      <div className="relative w-full flex items-center justify-center min-h-[260px] sm:min-h-[360px] md:min-h-[440px]">
        {/* Paper Ball anchored flush to Left: 0 */}
        <img
          src="/assets/paper-ball.png"
          alt="Crumpled Paper Ball"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-16 sm:w-24 md:w-32 lg:w-36 h-auto object-contain object-left pointer-events-none select-none drop-shadow-xl z-10"
          loading="lazy"
        />

        {/* Center booklet & mobile interface set perfectly in the middle */}
        <div className="relative z-0 w-full max-w-3xl lg:max-w-4xl mx-auto flex justify-center items-center px-4 sm:px-6">
          <img
            src="/assets/intent-mirroring-center.png"
            alt="Intent Mirroring - Booklet & Mobile Interface"
            className="w-full max-w-[520px] sm:max-w-[640px] md:max-w-[760px] h-auto object-contain select-none block drop-shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
