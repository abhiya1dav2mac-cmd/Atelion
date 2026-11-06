import React from 'react';
import { Check } from './Icons';

export default function PricingSection({ onOpenAuth }) {
  return (
    <section id="pricing" className="py-20 px-6 max-w-5xl mx-auto border-t border-gray-200">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-[11px] font-mono-code uppercase tracking-widest text-blue-600 font-semibold">
          PRICING & EDITIONS
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-gray-950 font-normal mt-2">
          Choose your desk reference
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Expensed by designers and engineers at Apple, Stripe, Linear, and Vercel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Digital Edition */}
        <div className="p-8 rounded-3xl bg-white border border-gray-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono-code uppercase text-gray-500 font-semibold tracking-wider">
              DIGITAL BUNDLE
            </div>
            <h3 className="font-serif-display text-3xl text-gray-950 mt-1">Digital Edition</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-gray-950">$39</span>
              <span className="text-xs text-gray-400 font-mono-code">one-time payment</span>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Instant lifetime access to the complete digital playbook, interactive Figma kit, and React source repository.
            </p>
            <div className="w-full h-px bg-gray-100 my-6"></div>
            <ul className="space-y-3 text-xs text-gray-700">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>180-page DRM-free PDF & EPUB eBook</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Complete Figma interactive kit (.fig)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>45+ Production React & Tailwind snippets</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Free lifetime digital updates & patches</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onOpenAuth('signup')}
            type="button"
            className="mt-8 w-full py-3 rounded-full border border-gray-300 text-gray-900 font-semibold text-xs hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            Get Digital Edition — $39
          </button>
        </div>

        {/* Collector's Box Set */}
        <div className="p-8 rounded-3xl bg-white border-2 border-blue-600 shadow-2xl relative flex flex-col justify-between">
          <div className="absolute -top-3.5 right-6 bg-blue-600 text-white text-[10px] font-mono-code uppercase tracking-widest font-bold px-3.5 py-1 rounded-full shadow-md">
            MOST POPULAR · SHIPS GLOBALLY
          </div>
          <div>
            <div className="text-xs font-mono-code uppercase text-blue-600 font-semibold tracking-wider">
              HARDCOVER + DIGITAL
            </div>
            <h3 className="font-serif-display text-3xl text-gray-950 mt-1">Collector's Edition</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-gray-950">$89</span>
              <span className="text-xs text-gray-400 font-mono-code">+ free tracked shipping</span>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              The full tactile desk experience. Hardcover book, custom cutting mat coaster, plus all digital assets.
            </p>
            <div className="w-full h-px bg-gray-100 my-6"></div>
            <ul className="space-y-3 text-xs text-gray-700 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Hardcover 180-page Smyth-sewn linen book</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>120gsm Munken Lynx uncoated Swedish paper</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Custom self-healing desk cutting mat coaster</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Includes all Digital Edition files (PDF, Figma, Code)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Worldwide express tracked delivery</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => onOpenAuth('signup')}
            type="button"
            className="mt-8 w-full btn-blue-pill py-3 rounded-full text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            Order Collector's Edition — $89
          </button>
        </div>
      </div>
    </section>
  );
}
