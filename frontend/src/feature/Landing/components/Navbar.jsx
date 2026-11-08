import React from 'react';

export default function Navbar({ onOpenAuth, user, onLogout, onGoToWorkspace }) {
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

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button
              type="button"
              onClick={onGoToWorkspace}
              className="btn-blue-pill text-white text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow transition-all"
            >
              <span>Open Workspace →</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-gray-600 hover:text-red-600 text-xs font-medium px-2 py-1.5 transition-colors cursor-pointer"
            >
              Log out
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              className="text-gray-700 hover:text-gray-950 text-xs font-semibold px-3.5 py-2 rounded-full transition-colors cursor-pointer hover:bg-gray-100"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="btn-blue-pill text-white text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow transition-all"
            >
              <span>Sign Up Free</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

