import React from 'react';

export default function PhilosophySection() {
  return (
    <section className="py-20 px-6 max-w-4xl mx-auto text-center border-t border-gray-200/60">
      <div className="w-10 h-10 mx-auto rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-700 mb-6">
        <span className="text-base font-serif-display italic">§</span>
      </div>
      <h2 className="font-serif-display text-3xl sm:text-5xl text-gray-950 font-normal leading-tight tracking-tight mb-6">
        "Good products feel immediate. <br />
        <span className="italic">Great products feel inevitable.</span>"
      </h2>
      <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
        Most design books discuss color palettes and typography. This desk reference details what happens in the 120 milliseconds between a user's intent and software's physical response.
      </p>
    </section>
  );
}

