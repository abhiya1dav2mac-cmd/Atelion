import React from 'react';

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-6 max-w-4xl mx-auto border-t border-gray-200">
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-gray-200/90 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-2xl font-serif-display shadow-md">
          AM
        </div>
        <div>
          <p className="font-serif-display text-xl sm:text-2xl text-gray-900 leading-snug italic font-normal">
            "This is the rare design book that treats interaction design like a mechanical discipline. You will never write another linear CSS cubic-bezier again."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-950">Arthur Marchand</span>
            <span className="text-xs text-gray-400 font-mono-code">· Principal Design Technologist, Studio Haptic</span>
          </div>
        </div>
      </div>
    </section>
  );
}

