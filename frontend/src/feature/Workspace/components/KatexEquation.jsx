import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Clean redundant delimiters ($$, \[, \], etc.) from math formula
 */
function cleanMathDelimiters(text) {
  if (!text || typeof text !== 'string') return '';
  let str = text.trim();
  // Strip leading and trailing $$ or \[ \]
  str = str.replace(/^\$\$([\s\S]*?)\$\$$/, '$1');
  str = str.replace(/^\\\[([\s\S]*?)\\\]$/, '$1');
  str = str.replace(/^\\\(([\s\S]*?)\\\)$/, '$1');
  str = str.replace(/^\$([\s\S]*?)\$$/, '$1');
  return str.trim();
}

/**
 * 🧮 KatexEquation Component
 * Renders mathematical equations with sub-millisecond precision using KaTeX
 */
export default function KatexEquation({
  math = '',
  displayMode = true,
  className = '',
}) {
  const renderedHtml = useMemo(() => {
    const formula = cleanMathDelimiters(math);
    if (!formula) {
      return '<span style="color: #9ca3af; font-style: italic;">Empty equation</span>';
    }

    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch (err) {
      return `<code class="text-rose-500 font-mono text-xs">${formula}</code>`;
    }
  }, [math, displayMode]);

  return (
    <div
      className={`katex-equation-container overflow-x-auto py-2.5 px-3 select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
