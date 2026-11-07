import React, { useMemo } from 'react';
import katex from 'katex';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderKatexSafe(tex, displayMode = false) {
  try {
    return katex.renderToString(String(tex || '').trim(), {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
    });
  } catch {
    return `<code class="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-xs font-mono">${escapeHtml(tex)}</code>`;
  }
}

function formatInlineWithMath(rawText) {
  if (!rawText) return '';
  const mathHolders = [];

  // 1. Protect block math $$...$$ and \[...\]
  let text = String(rawText).replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => {
    const idx = mathHolders.length;
    mathHolders.push(
      `<div class="my-2.5 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl overflow-x-auto text-center text-gray-900 shadow-2xs">${renderKatexSafe(
        eq,
        true
      )}</div>`
    );
    return `@@MATH_TOKEN_${idx}@@`;
  });

  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => {
    const idx = mathHolders.length;
    mathHolders.push(
      `<div class="my-2.5 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl overflow-x-auto text-center text-gray-900 shadow-2xs">${renderKatexSafe(
        eq,
        true
      )}</div>`
    );
    return `@@MATH_TOKEN_${idx}@@`;
  });

  // 2. Protect inline math \(...\) and $...$
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => {
    const idx = mathHolders.length;
    mathHolders.push(`<span class="inline-block align-middle mx-0.5 text-gray-950">${renderKatexSafe(eq, false)}</span>`);
    return `@@MATH_TOKEN_${idx}@@`;
  });

  text = text.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (match, prefix, eq) => {
    if (/^\s*\d/.test(eq)) return match;
    const idx = mathHolders.length;
    mathHolders.push(`<span class="inline-block align-middle mx-0.5 text-gray-950">${renderKatexSafe(eq, false)}</span>`);
    return `${prefix}@@MATH_TOKEN_${idx}@@`;
  });

  // 3. Escape HTML safely
  let safe = escapeHtml(text);

  // 4. Inline markdown formatting (Clean White Theme contrast)
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-950">$1</strong>');
  safe = safe.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[11px] font-mono text-blue-700">$1</code>'
  );
  safe = safe.replace(/(^|[^\*])\*([^\*\n]+?)\*([^\*]|$)/g, '$1<em class="italic text-gray-700">$2</em>$3');

  // 5. Restore KaTeX HTML
  safe = safe.replace(/@@MATH_TOKEN_(\d+)@@/g, (_, idx) => mathHolders[Number(idx)] || '');

  return safe;
}

/**
 * 🧮 RichMathMarkdown (Clean Notion-White Mode + KaTeX Engine)
 */
export default function RichMathMarkdown({ content = '', className = '' }) {
  const html = useMemo(() => {
    if (!content) return '';

    // Pre-extract multi-line $$...$$ blocks before line splitting
    const blockHolders = [];
    const normalized = String(content).replace(/\$\$([\s\S]*?)\$\$/g, (_, eq) => {
      const idx = blockHolders.length;
      blockHolders.push(
        `<div class="my-3 py-3 px-4 bg-white border border-gray-200 rounded-xl overflow-x-auto text-center text-gray-950 shadow-xs">${renderKatexSafe(
          eq,
          true
        )}</div>`
      );
      return `\n@@DISPLAY_MATH_${idx}@@\n`;
    });

    const lines = normalized.split('\n');
    const out = [];
    let listBuffer = [];

    const flushList = () => {
      if (listBuffer.length > 0) {
        out.push(`<ul class="my-2 pl-4 space-y-1.5 list-disc text-gray-700">${listBuffer.join('')}</ul>`);
        listBuffer = [];
      }
    };

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        flushList();
        continue;
      }

      const displayMatch = trimmed.match(/^@@DISPLAY_MATH_(\d+)@@$/);
      if (displayMatch) {
        flushList();
        out.push(blockHolders[Number(displayMatch[1])] || '');
        continue;
      }

      if (/^#{1,4}\s+/.test(trimmed)) {
        flushList();
        const headingText = trimmed.replace(/^#+\s*/, '');
        out.push(
          `<h4 class="mt-3 mb-1.5 text-sm font-bold text-gray-950 tracking-tight">${formatInlineWithMath(
            headingText
          )}</h4>`
        );
        continue;
      }

      if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        const itemText = trimmed.replace(/^([-*•]|\d+\.)\s+/, '');
        listBuffer.push(`<li class="leading-relaxed text-xs sm:text-[13px] text-gray-700">${formatInlineWithMath(itemText)}</li>`);
        continue;
      }

      flushList();
      out.push(`<p class="my-1.5 leading-relaxed text-xs sm:text-[13px] text-gray-700">${formatInlineWithMath(trimmed)}</p>`);
    }

    flushList();
    return out.join('');
  }, [content]);

  return (
    <div
      className={`rich-math-markdown select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
