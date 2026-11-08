/**
 * ==============================================================================
 * ATELION EDGE AI ROUTER - CLOUDFLARE WORKER PROXY
 * 100% Free • Zero Credit Card • Zero Billing Account Required
 * 100% Western / Allied Security: USA 🇺🇸, France 🇫🇷 • Zero Chinese Models
 * 0 Payment Method Required (Removed Mistral, Cohere, Cerebras & SambaNova which require billing/cards)
 * 
 * 🟢 Branch A: Normal Text & Code Q&A (100% Free • 0 Card)
 *   - Tier 1 🥇: Groq LPU (USA - Llama 3.3 70B @ 800 tok/sec, ~0.30s • 0 Card)
 *   - Tier 2 🥈: Google Gemini 2.0 Flash (USA - 1M Context, High Academic • 0 Card)
 *   - Tier 3 🥉: Cloudflare Workers AI Native Edge (@cf/meta/llama-3.3-70b-instruct • 0 Card)
 *   - Tier 4 🐙: GitHub Models (USA/Microsoft - GPT-4o-mini Azure AI • 0 Card)
 *   - Tier 5 🤗: Hugging Face Serverless Router (USA/France - Llama 3.3 70B • 0 Card)
 *   - Tier 6 🌐: OpenRouter Free Tier (USA - Llama 3.3 70B:free • 0 Card)
 * 
 * 🟣 Branch B: Circle to Search & Handwritten OCR (Vision Mode • 0 Card)
 *   - Tier 1 🥇: Google Gemini 2.0 Flash Vision (USA • 0 Card)
 *   - Tier 2 🥈: Groq Vision (USA - Llama 3.2 11B Vision @ ~0.4s • 0 Card)
 *   - Tier 3 🥉: GitHub Models Vision (USA/Microsoft - GPT-4o-mini Vision • 0 Card)
 *   - Tier 4 🤗: Hugging Face Vision (Llama 3.2 11B Vision • 0 Card)
 *   - Tier 5 🌐: OpenRouter Vision (Llama 3.2 11B Vision:free • 0 Card)
 * ==============================================================================
 */

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      });
    }

    try {
      const body = await request.json();
      const prompt = body.prompt || body.queryText || body.message || '';
      const imageBase64 = body.imageBase64 || body.image || null;
      const systemPrompt =
        body.systemPrompt ||
        'You are Atelion AI, an elite academic, coding, and mathematical reasoning assistant. Write all math and scientific formulas using standard LaTeX ($...$ and $$...$$).';
      const stream = body.stream !== false;
      const hasImage = Boolean(imageBase64 && imageBase64.length > 50);

      // Async Background Dispatcher (Zero Main-Thread / 0ms latency impact)
      const triggerBackgroundTasks = (engineName) => {
        if (!ctx?.waitUntil) return;
        ctx.waitUntil(
          (async () => {
            if (env.TELEGRAM_BOT_TOKEN && (env.TELEGRAM_CHAT_ID || env.TELEGRAM_ADMIN_CHAT_ID)) {
              try {
                const chatId = env.TELEGRAM_CHAT_ID || env.TELEGRAM_ADMIN_CHAT_ID;
                const text =
                  `⚡ *Atelion Omni-Flow 2.0 Edge Telemetry*\n` +
                  `• *Pathway:* \`${hasImage ? 'Multimodal Vision OCR' : 'Ultra-Speed Text Q&A'}\`\n` +
                  `• *Resolved By:* \`${engineName}\`\n` +
                  `• *Snippet:* _${prompt.slice(0, 60).replace(/[_*`\\[\\]]/g, ' ')}..._`;
                await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
                });
              } catch {}
            }
          })()
        );
      };

      if (!prompt && !hasImage) {
        return new Response(JSON.stringify({ error: 'Missing prompt or imageBase64 in request body.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        });
      }

      // ========================================================================
      // 🟣 PATHWAY A: MULTIMODAL VISION CASCADE (CIRCLE TO SEARCH & OCR)
      // ========================================================================
      if (hasImage) {
        // Vision Tier 1 🥇: Google Gemini 2.0 Flash-Lite (Google Vision King)
        if (env.GEMINI_API_KEY) {
          try {
            const geminiRes = await callGeminiVision(prompt, imageBase64, systemPrompt, env, stream);
            if (geminiRes.ok) {
              triggerBackgroundTasks('Gemini 2.0 Flash-Lite Vision (Tier 1 🥇 USA)');
              return wrapResponse(geminiRes, stream, 'Gemini-2.0-Flash-Lite-Vision (Tier 1 🥇 USA)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] Gemini Vision error:', e.message);
          }
        }

        // Vision Tier 2 🥈: Groq Vision (Llama 3.2 11B Speed Fallback @ ~0.4s • 0 Card)
        if (env.GROQ_API_KEY) {
          try {
            const groqVisRes = await callGroqVision(prompt, imageBase64, systemPrompt, env, stream);
            if (groqVisRes.ok) {
              triggerBackgroundTasks('Groq Llama 3.2 11B Vision (Tier 2 🥈 USA)');
              return wrapResponse(groqVisRes, stream, 'Groq-Llama-3.2-11B-Vision (Tier 2 🥈 USA)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] Groq Vision error:', e.message);
          }
        }

        // Vision Tier 4 🐙: GitHub Models Vision (GPT-4o-mini Vision via Microsoft Azure • 0 Card)
        const ghToken = env.GITHUB_MODELS_TOKEN || env.GITHUB_TOKEN || env.GH_MODELS_TOKEN;
        if (ghToken) {
          try {
            const ghVisRes = await callGitHubModelsVision(prompt, imageBase64, systemPrompt, ghToken, stream);
            if (ghVisRes.ok) {
              triggerBackgroundTasks('GitHub Models GPT-4o-mini Vision (Tier 4 Microsoft USA)');
              return wrapResponse(ghVisRes, stream, 'GitHub-Models-GPT-4o-mini-Vision (Tier 4 Microsoft USA 🐙)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] GitHub Models Vision error:', e.message);
          }
        }

        // Vision Tier 5 🤗: Hugging Face Serverless Vision (Llama 3.2 11B Vision • 0 Card)
        const hfKey = env.HUGGINGFACE_API_KEY || env.HF_TOKEN;
        if (hfKey) {
          try {
            const hfVisRes = await callHuggingFaceVision(prompt, imageBase64, systemPrompt, hfKey, stream);
            if (hfVisRes.ok) {
              triggerBackgroundTasks('Hugging Face Llama 3.2 11B Vision (Tier 5 🤗)');
              return wrapResponse(hfVisRes, stream, 'Hugging-Face-Llama-3.2-11B-Vision (Tier 5 🤗)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] Hugging Face Vision error:', e.message);
          }
        }

        // Vision Tier 6 🌐: OpenRouter Free Vision (Llama 3.2 11B Vision:free • 0 Card)
        if (env.OPENROUTER_API_KEY) {
          try {
            const orVisRes = await callOpenRouterVision(prompt, imageBase64, systemPrompt, env.OPENROUTER_API_KEY, stream);
            if (orVisRes.ok) {
              triggerBackgroundTasks('OpenRouter Free Vision (Tier 6 🌐)');
              return wrapResponse(orVisRes, stream, 'OpenRouter-Free-Vision (Tier 6 🌐)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] OpenRouter Vision error:', e.message);
          }
        }
      }

      // ========================================================================
      // 🟢 PATHWAY B: ULTRA-SPEED TEXT CASCADE (DOUBTS, CODE & EXAMS)
      // ========================================================================

      // Tier 1 🥇: Groq LPU (USA - Llama 3.3 70B @ 800 tok/sec, ~0.30s King of Speed • 0 Card)
      if (env.GROQ_API_KEY) {
        try {
          const groqRes = await callGroqLPU(prompt, systemPrompt, env, stream);
          if (groqRes.ok) {
            triggerBackgroundTasks('Groq LPU Llama 3.3 70B (Tier 1 🥇 USA - 800 tok/s)');
            return wrapResponse(groqRes, stream, 'Groq-LPU-Llama-3.3-70B (Tier 1 🥇 USA - 800 tok/s)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] Groq error:', e.message);
        }
      }

      // Tier 3 🥉: Google Gemini 2.0 Flash-Lite (Google Fastest Brain - 1M Context)
      if (env.GEMINI_API_KEY) {
        try {
          const geminiRes = await callGeminiText(prompt, systemPrompt, env, stream);
          if (geminiRes.ok) {
            triggerBackgroundTasks('Google Gemini 2.0 Flash-Lite (Tier 3 🥉 USA)');
            return wrapResponse(geminiRes, stream, 'Google-Gemini-2.0-Flash-Lite (Tier 3 🥉 USA)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] Gemini error:', e.message);
        }
      }

      // Tier 4: Cloudflare Workers AI Native Edge (@cf/meta/llama-3.3-70b-instruct)
      if (env.AI) {
        try {
          const cfRes = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            stream: stream,
          });

          triggerBackgroundTasks('Cloudflare Workers AI 70B Edge GPU (Tier 4 USA)');

          if (stream) {
            return new Response(cfRes, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-AI-Engine': 'Cloudflare-Workers-AI-70B (Tier 4 USA)',
                ...getCorsHeaders(),
              },
            });
          } else {
            return new Response(
              JSON.stringify({ result: cfRes.response, engine: 'Cloudflare Workers AI (Tier 4 USA)' }),
              {
                headers: {
                  'Content-Type': 'application/json',
                  'X-AI-Engine': 'Cloudflare-Workers-AI-70B',
                  ...getCorsHeaders(),
                },
              }
            );
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] Cloudflare Workers AI error:', e.message);
        }
      }

      // Tier 4 🐙: GitHub Models (USA/Microsoft - GPT-4o-mini Azure AI • 0 Card)
      const ghToken = env.GITHUB_MODELS_TOKEN || env.GITHUB_TOKEN || env.GH_MODELS_TOKEN;
      if (ghToken) {
        try {
          const ghRes = await callGitHubModels(prompt, systemPrompt, ghToken, stream);
          if (ghRes.ok) {
            triggerBackgroundTasks('GitHub Models GPT-4o-mini (Tier 4 Microsoft USA 🐙)');
            return wrapResponse(ghRes, stream, 'GitHub-Models-GPT-4o-mini (Tier 4 Microsoft USA 🐙)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] GitHub Models error:', e.message);
        }
      }

      // Tier 5 🤗: Hugging Face Serverless Router (USA/France - Llama 3.3 70B • 0 Card)
      const hfKey = env.HUGGINGFACE_API_KEY || env.HF_TOKEN;
      if (hfKey) {
        try {
          const hfRes = await callHuggingFaceText(prompt, systemPrompt, hfKey, stream);
          if (hfRes.ok) {
            triggerBackgroundTasks('Hugging Face Llama 3.3 70B (Tier 5 🤗)');
            return wrapResponse(hfRes, stream, 'Hugging-Face-Llama-3.3-70B (Tier 5 🤗)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] Hugging Face error:', e.message);
        }
      }

      // Tier 6 🌐: OpenRouter Free Tier (USA - Llama 3.3 70B:free • 0 Card)
      if (env.OPENROUTER_API_KEY) {
        try {
          const orRes = await callOpenRouterText(prompt, systemPrompt, env.OPENROUTER_API_KEY, stream);
          if (orRes.ok) {
            triggerBackgroundTasks('OpenRouter Free Tier Llama 3.3 70B (Tier 8 🌐)');
            return wrapResponse(orRes, stream, 'OpenRouter-Free-Tier (Tier 8 🌐)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] OpenRouter error:', e.message);
        }
      }

      return new Response(
        JSON.stringify({
          error: 'All 100% free zero-card AI waterfall providers exhausted or credentials missing.',
          waterfall: [
            'Groq',
            'Gemini',
            'Cloudflare',
            'GitHub Models',
            'Hugging Face',
            'OpenRouter',
          ],
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        }
      );
    } catch (globalErr) {
      console.error('[EDGE-PROXY-FATAL]', globalErr.message);
      return new Response(
        JSON.stringify({
          error: 'Edge AI proxy exception occurred.',
          details: globalErr.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        }
      );
    }
  },
};

function wrapResponse(res, stream, engineName) {
  return new Response(res.body, {
    status: 200,
    headers: {
      'Content-Type': stream ? 'text/event-stream' : 'application/json',
      'Cache-Control': 'no-cache',
      'X-AI-Engine': engineName,
      ...getCorsHeaders(),
    },
  });
}

// ==============================================================================
// PROVIDER IMPLEMENTATIONS FOR CLOUDFLARE EDGE WORKER
// ==============================================================================

async function callGroqLPU(prompt, systemPrompt, env, stream) {
  return await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.55,
      max_tokens: 1800,
      stream,
    }),
  });
}

async function callGeminiText(prompt, systemPrompt, env, stream) {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const model of models) {
    try {
      const endpoint = stream
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.45, maxOutputTokens: 2048 },
        }),
      });
      if (res.ok) return res;
    } catch (e) {}
  }
  throw new Error('Gemini text calls failed');
}

async function callGitHubModels(prompt, systemPrompt, token, stream) {
  return await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1800,
      stream,
    }),
  });
}

async function callHuggingFaceText(prompt, systemPrompt, apiKey, stream) {
  return await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.45,
      max_tokens: 1600,
      stream,
    }),
  });
}

async function callOpenRouterText(prompt, systemPrompt, apiKey, stream) {
  return await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://atelion.ai',
      'X-Title': 'Atelion AI',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.45,
      max_tokens: 1600,
      stream,
    }),
  });
}

// Vision Callers
async function callGeminiVision(prompt, imageBase64, systemPrompt, env, stream) {
  const cleanB64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const endpoint = stream
    ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`
    : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;

  return await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        {
          role: 'user',
          parts: [{ inlineData: { mimeType, data: cleanB64 } }, { text: prompt || 'Analyze this handwritten selection and output LaTeX.' }],
        },
      ],
      generationConfig: { temperature: 0.35, maxOutputTokens: 2048 },
    }),
  });
}

async function callGroqVision(prompt, imageBase64, systemPrompt, env, stream) {
  const dataUrl = imageBase64.startsWith('data:image/') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  return await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Explain this handwritten structure with LaTeX formulas.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.4,
      max_tokens: 1600,
      stream,
    }),
  });
}

async function callGitHubModelsVision(prompt, imageBase64, systemPrompt, token, stream) {
  const dataUrl = imageBase64.startsWith('data:image/') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  return await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Transcribe handwritten math and explain.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.4,
      max_tokens: 1800,
      stream,
    }),
  });
}

async function callHuggingFaceVision(prompt, imageBase64, systemPrompt, apiKey, stream) {
  const dataUrl = imageBase64.startsWith('data:image/') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  return await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.2-11B-Vision-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Analyze this handwritten selection and output LaTeX.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.35,
      max_tokens: 1800,
      stream,
    }),
  });
}

async function callOpenRouterVision(prompt, imageBase64, systemPrompt, apiKey, stream) {
  const dataUrl = imageBase64.startsWith('data:image/') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  return await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://atelion.ai',
      'X-Title': 'Atelion AI',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Analyze this image and explain in LaTeX.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.4,
      max_tokens: 1800,
      stream,
    }),
  });
}

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };
}
