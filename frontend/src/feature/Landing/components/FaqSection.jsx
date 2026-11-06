import React, { useState } from 'react';
import { ChevronDown } from './Icons';

const faqs = [
  {
    q: "Who is The Pocket Design Playbook specifically created for?",
    a: "This playbook is crafted for Product Designers, UI/UX Engineers, and Design Technologists who want to bridge the gap between static wireframes and fluid, tactile digital interactions. It focuses heavily on tactile feel, micro-interactions, spring mechanics, and production implementation."
  },
  {
    q: "Does the purchase include Figma and React source code?",
    a: "Yes! Both the Digital Edition and the Collector's Box Set include the complete, production-ready Figma component kit (.fig) along with 45+ copy-paste React 18/19, Framer Motion, and Tailwind CSS code snippets ready for your project."
  },
  {
    q: "What are the physical dimensions and paper specifications of the book?",
    a: "The physical book is A5 pocket desk size (148 x 210 mm), bound with Smyth-sewn lay-flat binding so it stays completely open on your desk next to your keyboard. It is printed on 120gsm Munken Lynx uncoated Swedish archival paper with a debossed blind-foil linen hardcover."
  },
  {
    q: "How does worldwide international shipping work?",
    a: "The Collector's Box Set ships worldwide via tracked express courier (DHL / FedEx) from our fulfillment centers in London, New York, and Berlin. Domestic US and EU orders arrive in 3–5 business days, international orders in 5–8 business days."
  },
  {
    q: "Can I get an invoice or company reimbursement receipt?",
    a: "Yes! An automated VAT-compliant invoice is generated instantly upon checkout. Over 65% of our readers expense this book under their team's annual education or design tools budget."
  }
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="faq" className="py-20 px-6 max-w-3xl mx-auto border-t border-gray-200">
      <div className="text-center mb-12">
        <span className="text-[11px] font-mono-code uppercase tracking-widest text-blue-600 font-semibold">
          QUESTIONS & CLARIFICATIONS
        </span>
        <h2 className="font-serif-display text-3xl sm:text-4xl text-gray-950 font-normal mt-2">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-900 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
