import React from 'react';
import { ArrowRight } from './Icons';

export default function CurriculumSection() {
  const chapters = [
    {
      num: "01",
      title: "The Physics of Touch",
      pages: "Pages 12–54",
      summary: "Understanding mass, stiffness, and damping ratios to build interfaces that feel rooted in natural physical laws."
    },
    {
      num: "02",
      title: "Gestures & Velocity Tracking",
      pages: "Pages 55–98",
      summary: "Designing flick dismissals, rubber-band boundaries, and direction-locked gesture recognizers."
    },
    {
      num: "03",
      title: "Multi-Sensory Feedback Loops",
      pages: "Pages 99–138",
      summary: "Calibrating 12ms haptic pulses, sub-audible UI clicks, and non-blocking visual feedback states."
    },
    {
      num: "04",
      title: "Production Architecture & Code",
      pages: "Pages 139–180",
      summary: "45+ production-tested React, Framer Motion, and Tailwind recipes ready to paste directly into your codebase."
    }
  ];

  return (
    <section id="curriculum" className="py-20 px-6 max-w-5xl mx-auto border-t border-gray-200">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-[11px] font-mono-code uppercase tracking-widest text-blue-600 font-semibold">
          TABLE OF CONTENTS
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-gray-950 font-normal mt-2">
          Curriculum & Chapter Breakdown
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          From cognitive science principles to bulletproof production engineering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chapters.map((ch, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono-code mb-2">
                <span className="text-blue-600 font-bold">CHAPTER {ch.num}</span>
                <span className="text-gray-400">{ch.pages}</span>
              </div>
              <h3 className="font-serif-display text-2xl text-gray-950 font-normal mt-1">
                {ch.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                {ch.summary}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-900">
              <span>Explore Chapter Deep Dive</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
