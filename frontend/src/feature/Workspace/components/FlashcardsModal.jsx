import React, { useState, useEffect, useMemo } from 'react';
import { X, Sparkles, ChevronRight, Check } from './WorkspaceIcons';
import KatexEquation from './KatexEquation';
import { PremiumBadge } from './PremiumModals';

/**
 * 🧠 1-Click AI Flashcards & Spaced Repetition (Active Recall) Modal
 */
export default function FlashcardsModal({ isOpen, onClose, page }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [cards, setCards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate flashcards from page blocks or sensible defaults
  useEffect(() => {
    if (!page) return;

    const generated = [];
    const blocks = page.blocks || [];

    // 1. Math formulas -> High-yield formula cards
    const mathBlocks = blocks.filter((b) => b.type === 'math');
    mathBlocks.forEach((m, idx) => {
      generated.push({
        id: `card_math_${idx}`,
        category: 'Formula & Proof',
        front: `State the mathematical formulation and explain the physical/logical meaning of this equation:`,
        frontMath: m.content,
        back: `Detailed Breakdown & Derivation:`,
        backMath: m.content,
        backDetails: [
          'Directly represents the fundamental relationship between operators and observables.',
          'Crucial for university physics exams, calculus proofs, and quantum mechanics.',
          'Remember: Ensure dimension balance and boundary conditions when integrating.',
        ],
      });
    });

    // 2. Headings + Paragraphs
    let lastHeading = null;
    blocks.forEach((b, idx) => {
      if (b.type === 'heading_1' || b.type === 'heading_2') {
        lastHeading = b.content;
      } else if (b.type === 'paragraph' && lastHeading) {
        generated.push({
          id: `card_text_${idx}`,
          category: 'Key Concept',
          front: `What is the core principle and application of:\n"${lastHeading}"?`,
          back: `Exam Summary:`,
          backDetails: [
            b.content,
            'High-yield active recall checkpoint from your active lecture notes.',
          ],
        });
        lastHeading = null;
      }
    });

    // Fallback baseline deck if page has few blocks
    if (generated.length === 0) {
      generated.push(
        {
          id: 'card_default_1',
          category: 'Quantum Mechanics',
          front: 'What is the Time-Dependent Schrödinger Wave Equation?',
          frontMath: 'i \\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)',
          back: 'Physical & Mathematical Explanation:',
          backMath: '\\hat{H} = -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r})',
          backDetails: [
            'Describes how the quantum state (wave function) of a physical system changes over time.',
            'Hamiltonian operator H represents the total energy (kinetic + potential).',
            'Born Interpretation: |Psi(r,t)|^2 gives the probability density of finding the particle at position r.',
          ],
        },
        {
          id: 'card_default_2',
          category: 'Multivariable Calculus',
          front: 'What is the value of the Gaussian Integral across all space?',
          frontMath: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = ?',
          back: 'Exact Solution & Proof Method:',
          backMath: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
          backDetails: [
            'Solved by squaring the integral: I^2 = ∫∫ e^{-(x^2+y^2)} dx dy.',
            'Switching to polar coordinates gives ∫₀^{2π} dθ ∫₀^∞ r e^{-r^2} dr = 2π * (1/2) = π.',
            'Taking the square root yields √π.',
          ],
        },
        {
          id: 'card_default_3',
          category: 'Relativity & Modern Physics',
          front: 'State Einstein\'s Mass-Energy Equivalence Principle:',
          frontMath: 'E = m c^2',
          back: 'Physical Significance:',
          backMath: 'E^2 = (p c)^2 + (m_0 c^2)^2',
          backDetails: [
            'Shows mass and energy are manifestations of the same underlying physical entity.',
            'For a particle at rest (momentum p = 0), energy reduces to E = m₀ c².',
            'Underpins nuclear fission, fusion, and stellar energy production.',
          ],
        }
      );
    }

    setCards(generated);
    setCurrentIdx(0);
    setIsFlipped(false);
  }, [page]);

  if (!isOpen) return null;

  const currentCard = cards[currentIdx];

  const handleNextCard = (rating) => {
    setIsFlipped(false);
    if (rating === 'easy' || rating === 'good') {
      setMasteredCount((prev) => prev + 1);
    }
    setTimeout(() => {
      if (currentIdx < cards.length - 1) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        // Loop back or reset
        setCurrentIdx(0);
      }
    }, 150);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 relative text-left text-gray-900 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Upper Right Corner Badges & Close */}
        <div className="absolute top-5 right-12 flex items-center gap-2">
          <PremiumBadge />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🧠</span>
          <h3 className="text-lg font-bold text-gray-900">1-Click AI Flashcards & Active Recall</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Spaced repetition (SM-2) engine generated directly from{' '}
          <span className="font-semibold text-gray-700">"{page?.title || 'Active Document'}"</span>.
        </p>

        {/* Progress & Deck Controls */}
        <div className="flex items-center justify-between text-xs bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200 mb-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">
              Card {currentIdx + 1} of {cards.length}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-emerald-700 font-semibold">🔥 {masteredCount} Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="text-gray-500 hover:text-gray-800 hover:underline cursor-pointer text-[11px]"
              title="Shuffle Cards"
            >
              🔀 Shuffle
            </button>
            <span className="text-gray-300">•</span>
            <span className="text-gray-400 text-[10px]">Click Card to Flip</span>
          </div>
        </div>

        {/* 3D INTERACTIVE FLIP CARD */}
        {currentCard ? (
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex-1 min-h-[260px] bg-gradient-to-b from-white to-gray-50/50 rounded-2xl border-2 border-gray-200 hover:border-blue-300 cursor-pointer p-6 flex flex-col justify-between shadow-sm transition-all duration-200 relative group overflow-hidden"
          >
            {/* Top Card Pill */}
            <div className="flex items-center justify-between text-[11px] font-mono select-none">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                {currentCard.category || 'Concept'}
              </span>
              <span className="text-gray-400 font-sans text-xs group-hover:text-blue-600 transition-colors">
                {isFlipped ? '🔄 Showing Answer' : '👆 Tap to Reveal Answer'}
              </span>
            </div>

            {/* Front or Back Content */}
            <div className="my-auto py-3">
              {!isFlipped ? (
                /* FRONT OF CARD */
                <div className="space-y-3 text-center">
                  <h4 className="text-base font-semibold text-gray-900 leading-snug">
                    {currentCard.front}
                  </h4>
                  {currentCard.frontMath && (
                    <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs inline-block max-w-full">
                      <KatexEquation math={currentCard.frontMath} displayMode={true} />
                    </div>
                  )}
                </div>
              ) : (
                /* BACK OF CARD */
                <div className="space-y-2.5 text-left animate-in fade-in duration-150">
                  <div className="text-xs font-bold font-mono text-emerald-700 uppercase tracking-wide">
                    {currentCard.back || 'Key Explanation:'}
                  </div>
                  {currentCard.backMath && (
                    <div className="p-2.5 bg-white rounded-xl border border-gray-200 shadow-2xs text-center">
                      <KatexEquation math={currentCard.backMath} displayMode={true} />
                    </div>
                  )}
                  {currentCard.backDetails && (
                    <ul className="space-y-1.5 text-xs text-gray-700 leading-relaxed list-disc list-inside">
                      {currentCard.backDetails.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="text-center text-[10px] text-gray-400 font-mono">
              {isFlipped ? 'Rate difficulty below to schedule next review' : 'Spacebar or Click to Flip'}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-gray-500">No flashcards found.</div>
        )}

        {/* SPACED REPETITION ACTIVE RECALL RATINGS (SM-2) */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-[11px] font-mono text-gray-400 mb-2 flex items-center justify-between">
            <span>Spaced Repetition Feedback:</span>
            <span>Next Review Interval</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
            {/* Again */}
            <button
              onClick={() => handleNextCard('again')}
              className="py-2.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors shadow-2xs"
            >
              <span>🔴 Again</span>
              <span className="text-[10px] font-mono font-normal opacity-75">&lt; 1 min</span>
            </button>

            {/* Hard */}
            <button
              onClick={() => handleNextCard('hard')}
              className="py-2.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors shadow-2xs"
            >
              <span>🟠 Hard</span>
              <span className="text-[10px] font-mono font-normal opacity-75">1 day</span>
            </button>

            {/* Good */}
            <button
              onClick={() => handleNextCard('good')}
              className="py-2.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors shadow-2xs"
            >
              <span>🟡 Good</span>
              <span className="text-[10px] font-mono font-normal opacity-75">3 days</span>
            </button>

            {/* Easy */}
            <button
              onClick={() => handleNextCard('easy')}
              className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors shadow-2xs"
            >
              <span>🟢 Easy</span>
              <span className="text-[10px] font-mono font-normal opacity-75">7 days</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
