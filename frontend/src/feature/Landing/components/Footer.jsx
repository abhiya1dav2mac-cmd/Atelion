import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#EAECEF] border-t border-gray-300/80 pt-16 pb-12 px-6 relative">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <div>
          <div className="flex items-center">
            <img
              src="/assets/atelion-logo-dark-4k.png"
              alt="Atelion"
              className="h-10 w-auto object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
          <p className="text-xs text-gray-500 max-w-xs mt-3">
            A 180-page tactile desk reference for craft-driven interface designers and engineers.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
          <div>
            <div className="font-mono-code font-medium text-gray-400 uppercase tracking-widest text-[10px] mb-3">Product</div>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#hero" className="hover:text-black">Overview</a></li>
              <li><a href="#interactive" className="hover:text-black">Interactive Preview</a></li>
              <li><a href="#specs" className="hover:text-black">Tactile Specs</a></li>
              <li><a href="#pricing" className="hover:text-black">Pricing</a></li>
            </ul>
          </div>
          <div>
            <div className="font-mono-code font-medium text-gray-400 uppercase tracking-widest text-[10px] mb-3">Resources</div>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#interactive" className="hover:text-black">Figma Component Kit</a></li>
              <li><a href="#interactive" className="hover:text-black">React Code Snippets</a></li>
              <li><a href="#faq" className="hover:text-black">FAQ</a></li>
            </ul>
          </div>
          <div>
            <div className="font-mono-code font-medium text-gray-400 uppercase tracking-widest text-[10px] mb-3">Legal</div>
            <ul className="space-y-2 text-gray-600">
              <li><span className="text-gray-500">Privacy Policy</span></li>
              <li><span className="text-gray-500">Terms of Service</span></li>
              <li><span className="text-gray-500">Shipping & Returns</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-300 text-[11px] font-mono-code text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© 2026 The Pocket Design Playbook. All rights reserved.</span>
        <span>Crafted with Instrument Serif, Inter & Tailwind CSS.</span>
      </div>
    </footer>
  );
}

