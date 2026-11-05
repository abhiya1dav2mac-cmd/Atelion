import React from 'react';

export default function CtaBanner({ onOpenAuth }) {
  return (
    <section className="relative pt-24 sm:pt-36 pb-20 sm:pb-28 min-h-[560px] sm:min-h-[640px] w-full overflow-hidden flex items-center justify-center">
      {/* Left Flat-Lay Props - Increased size slightly, full keyboard visible, locked to Left 0 & Bottom 0 */}
      <img
        src="/assets/bottom-props-left.png"
        alt="Left Desk Flat-Lay Props"
        className="absolute left-0 bottom-0 w-[34vw] sm:w-[410px] md:w-[470px] lg:w-[520px] xl:w-[560px] max-h-[96%] max-w-none h-auto object-contain object-left-bottom pointer-events-none select-none z-0"
        loading="lazy"
      />

      {/* Right Flat-Lay Props - Increased size slightly, locked to Right 0 & Bottom 0 */}
      <img
        src="/assets/bottom-props-right.png"
        alt="Right Desk Flat-Lay Props"
        className="absolute right-0 bottom-0 w-[36vw] sm:w-[430px] md:w-[490px] lg:w-[540px] xl:w-[580px] max-h-[96%] max-w-none h-auto object-contain object-right-bottom pointer-events-none select-none z-0"
        loading="lazy"
      />

      {/* Center CTA Content */}
      <div className="relative z-10 max-w-lg mx-auto text-center px-4 my-auto">
        <div className="w-16 h-24 mx-auto rounded-r-md bg-black shadow-book mb-6 p-2 text-white flex flex-col justify-between select-none">
          <span className="text-[7px] font-mono-code opacity-70 tracking-tighter">VOL. 01</span>
          <span className="text-[8px] font-serif-display leading-tight italic">Pocket Playbook</span>
          <span className="text-[6px] font-mono-code text-blue-400">180 PP</span>
        </div>

        <h2 className="font-serif-display text-4xl sm:text-5xl text-gray-950 font-normal tracking-tight mb-4 leading-tight">
          Ready to craft interfaces <br />
          <span className="italic">that feel alive?</span>
        </h2>

        <p className="max-w-md mx-auto text-xs sm:text-sm text-gray-600 mb-8 leading-relaxed">
          Join over 12,000 product designers and engineers who keep this reference permanently open on their physical desks.
        </p>

        <button
          type="button"
          onClick={() => onOpenAuth('signup')}
          className="btn-blue-pill text-white text-sm font-semibold px-8 py-3.5 rounded-full inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          <span>Order Collector's Edition — $89</span>
          <span>→</span>
        </button>

        <div className="mt-5 text-[11px] font-mono-code text-gray-400">
          Free tracked express worldwide shipping · Ships within 24 hours
        </div>
      </div>
    </section>
  );
}
