/**
 * ==============================================================================
 * ATELION EDGE AI ROUTER - CLOUDFLARE WORKER PROXY
 * Full 8-Tier Non-Chinese Waterfall Architecture (0% Chinese Models)
 * 100% Western / Allied Security: USA 🇺🇸, France 🇫🇷, Canada 🇨🇦
 * 
 * 🟢 Branch A: Normal Text & Code Q&A
 *   - Tier 1 🥇: Cerebras Cloud (USA - Llama 3.3 70B @ 2,000 tok/sec)
 *   - Tier 2 🥈: Groq LPU (USA - Llama 3.3 70B @ 800 tok/sec)
 *   - Tier 3 🥉: Cloudflare Workers AI Native Edge (@cf/meta/llama-3.3-70b-instruct)
 *   - Tier 4: Google Gemini 2.0 Flash (USA - 1M Context, Academic Accuracy)
 *   - Tier 5: SambaNova Cloud (USA - Dedicated RDU Llama 3.3 70B)
 *   - Tier 6: Mistral AI (France - Codestral & European Precision)
 *   - Tier 7: GitHub Models (USA/Microsoft - GPT-4o-mini Azure AI)
 *   - Tier 8: Cohere AI (Canada - Command R+ Citation Specialist)
 * 
 * 🟣 Branch B: Circle to Search & Handwritten OCR (Vision Mode)
 *   - Tier 1 🥇: Google Gemini 2.0 Flash Vision (USA)
 *   - Tier 2 🥈: SambaNova Cloud Vision (USA - Llama 3.2 90B Vision)
 *   - Tier 3 🥉: Mistral AI Vision (France - Pixtral 12B LaTeX Specialist)
 *   - Tier 4: Groq Vision (USA - Llama 3.2 11B Vision @ ~0.4s)
 *   - Tier 5: GitHub Models Vision (USA/Microsoft - GPT-4o-mini Vision)
 * ==============================================================================
 */

export default {
  async fetch(request, env) {
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

      if (!prompt && !hasImage) {
        return new Response(JSON.stringify({ error: 'Missing prompt or imageBase64 in request body.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        });
      }

      // ========================================================================
      // 🟣 BRANCH B: CIRCLE TO SEARCH & HANDWRITTEN OCR (VISION WATERFALL)
      // ========================================================================
      if (hasImage) {
        // Vision Tier 1 🥇: Google Gemini 2.0 Flash Vision
        if (env.GEMINI_API_KEY) {
          try {
            const geminiRes = await callGeminiVision(prompt, imageBase64, systemPrompt, env, stream);
            if (geminiRes.ok) {
              return wrapResponse(geminiRes, stream, 'Gemini-2.0-Flash-Vision (Tier 1 🥇 USA)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] Gemini Vision error:', e.message);
          }
        }

        // Vision Tier 2 🥈: SambaNova Cloud Vision (Llama 3.2 90B Vision)
        if (env.SAMBANOVA_API_KEY) {
          try {
            const sambaRes = await callSambaNovaVision(prompt, imageBase64, systemPrompt, env, stream);
            if (sambaRes.ok) {
              return wrapResponse(sambaRes, stream, 'SambaNova-Llama-3.2-90B-Vision (Tier 2 🥈 USA)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] SambaNova Vision error:', e.message);
          }
        }

        // Vision Tier 3 🥉: Mistral AI Vision (Pixtral 12B LaTeX Specialist)
        if (env.MISTRAL_API_KEY) {
          try {
            const mistralRes = await callMistralVision(prompt, imageBase64, systemPrompt, env, stream);
            if (mistralRes.ok) {
              return wrapResponse(mistralRes, stream, 'Mistral-Pixtral-12B-Vision (Tier 3 🥉 France)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] Mistral Vision error:', e.message);
          }
        }

        // Vision Tier 4: Groq Vision (Llama 3.2 11B Vision @ ~0.4s)
        if (env.GROQ_API_KEY) {
          try {
            const groqVisRes = await callGroqVision(prompt, imageBase64, systemPrompt, env, stream);
            if (groqVisRes.ok) {
              return wrapResponse(groqVisRes, stream, 'Groq-Llama-3.2-11B-Vision (Tier 4 USA)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] Groq Vision error:', e.message);
          }
        }

        // Vision Tier 5: GitHub Models Vision (GPT-4o-mini Vision via Microsoft Azure)
        const ghToken = env.GITHUB_TOKEN || env.GH_MODELS_TOKEN;
        if (ghToken) {
          try {
            const ghVisRes = await callGitHubModelsVision(prompt, imageBase64, systemPrompt, ghToken, stream);
            if (ghVisRes.ok) {
              return wrapResponse(ghVisRes, stream, 'GitHub-Models-GPT-4o-mini-Vision (Tier 5 USA)');
            }
          } catch (e) {
            console.warn('[EDGE-VISION] GitHub Models Vision error:', e.message);
          }
        }
      }

      // ========================================================================
      // 🟢 BRANCH A: NORMAL TEXT & CODE Q&A (PRIORITY WATERFALL)
      // ========================================================================

      // Tier 1 🥇: Cerebras Cloud (USA - Llama 3.3 70B @ 2,000 tok/sec)
      if (env.CEREBRAS_API_KEY) {
        try {
          const cerebrasRes = await callCerebrasCloud(prompt, systemPrompt, env, stream);
          if (cerebrasRes.ok) {
            return wrapResponse(cerebrasRes, stream, 'Cerebras-Llama-3.3-70B (Tier 1 🥇 USA - 2000 tok/s)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] Cerebras error:', e.message);
        }
      }

      // Tier 2 🥈: Groq LPU (USA - Llama 3.3 70B @ 800 tok/sec)
      if (env.GROQ_API_KEY) {
        try {
          const groqRes = await callGroqLPU(prompt, systemPrompt, env, stream);
          if (groqRes.ok) {
            return wrapResponse(groqRes, stream, 'Groq-LPU-Llama-3.3-70B (Tier 2 🥈 USA - 800 tok/s)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] Groq error:', e.message);
        }
      }

      // Tier 3 🥉: Cloudflare Workers AI Native Edge (@cf/meta/llama-3.3-70b-instruct)
      if (env.AI) {
        try {
          const cfRes = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            stream: stream,
          });

          if (stream) {
            return new Response(cfRes, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-AI-Engine': 'Cloudflare-Workers-AI-70B (Tier 3 🥉 USA)',
                ...getCorsHeaders(),
              },
            });
          } else {
            return new Response(
              JSON.stringify({ result: cfRes.response, engine: 'Cloudflare Workers AI (Tier 3 🥉 USA)' }),
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

      // Tier 4: Google Gemini 2.0 Flash (USA - 1M Context, Deep Reasoning)
      if (env.GEMINI_API_KEY) {
        try {
          const geminiRes = await callGeminiText(prompt, systemPrompt, env, stream);
          if (geminiRes.ok) {
            return wrapResponse(geminiRes, stream, 'Google-Gemini-2.0-Flash (Tier 4 USA)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] Gemini error:', e.message);
        }
      }

      // Tier 5: SambaNova Cloud (USA - Dedicated RDU Llama 3.3 70B)
      if (env.SAMBANOVA_API_KEY) {
        try {
          const sambaRes = await callSambaNovaText(prompt, systemPrompt, env, stream);
          if (sambaRes.ok) {
            return wrapResponse(sambaRes, stream, 'SambaNova-Llama-3.3-70B (Tier 5 USA - RDU)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] SambaNova error:', e.message);
        }
      }

      // Tier 6: Mistral AI (France - Codestral & European Precision)
      if (env.MISTRAL_API_KEY) {
        try {
          const mistralRes = await callMistralText(prompt, systemPrompt, env, stream);
          if (mistralRes.ok) {
            return wrapResponse(mistralRes, stream, 'Mistral-Codestral (Tier 6 France)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] Mistral error:', e.message);
        }
      }

      // Tier 7: GitHub Models (USA/Microsoft - GPT-4o-mini Azure AI)
      const ghToken = env.GITHUB_TOKEN || env.GH_MODELS_TOKEN;
      if (ghToken) {
        try {
          const ghRes = await callGitHubModels(prompt, systemPrompt, ghToken, stream);
          if (ghRes.ok) {
            return wrapResponse(ghRes, stream, 'GitHub-Models-GPT-4o-mini (Tier 7 Microsoft USA)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] GitHub Models error:', e.message);
        }
      }

      // Tier 8: Cohere AI (Canada - Command R+ Academic Citations)
      if (env.COHERE_API_KEY) {
        try {
          const cohereRes = await callCohereText(prompt, systemPrompt, env, stream);
          if (cohereRes.ok) {
            return wrapResponse(cohereRes, stream, 'Cohere-Command-R-Plus (Tier 8 Canada)');
          }
        } catch (e) {
          console.warn('[EDGE-TEXT] Cohere error:', e.message);
        }
      }

      return new Response(
        JSON.stringify({
          error: 'All non-Chinese AI waterfall providers exhausted or credentials missing.',
          waterfall: ['Cerebras', 'Groq', 'Cloudflare', 'Gemini', 'SambaNova', 'Mistral', 'GitHub Models', 'Cohere'],
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

async function callCerebrasCloud(prompt, systemPrompt, env, stream) {
  return await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CEREBRAS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.3-70b',
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

async function callSambaNovaText(prompt, systemPrompt, env, stream) {
  return await fetch('https://api.sambanova.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SAMBANOVA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Meta-Llama-3.3-70B-Instruct',
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

async function callMistralText(prompt, systemPrompt, env, stream) {
  return await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'codestral-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1800,
      stream,
    }),
  });
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

async function callCohereText(prompt, systemPrompt, env, stream) {
  return await fetch('https://api.cohere.com/v2/chat', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'command-r-plus-08-2024',
      messages: [{ role: 'user', content: prompt }],
      preamble: systemPrompt,
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

async function callSambaNovaVision(prompt, imageBase64, systemPrompt, env, stream) {
  const dataUrl = imageBase64.startsWith('data:image/') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  return await fetch('https://api.sambanova.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SAMBANOVA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Llama-3.2-90B-Vision-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Identify and solve this handwritten formula or diagram.' },
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

async function callMistralVision(prompt, imageBase64, systemPrompt, env, stream) {
  const dataUrl = imageBase64.startsWith('data:image/') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  return await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'pixtral-12b-2409',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt || 'Transcribe handwriting to clean LaTeX and explain.' },
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

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };
}
