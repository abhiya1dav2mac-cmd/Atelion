import React from 'react';

export default function Navbar({ onOpenAuth }) {
  return (
    <header className="w-full max-w-6xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between relative z-30">
      <a href="#hero" className="flex items-center group">
        <img
          src="/assets/atelion-logo-dark-4k.png"
          alt="Atelion"
          className="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
          style={{ imageRendering: 'crisp-edges' }}
        />
      </a>

      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onOpenAuth('signup')}
          className="btn-blue-pill text-white text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow transition-all"
        >
          <span>Sign up / Sign in</span>
        </button>
      </div>
    </header>
  );
}

