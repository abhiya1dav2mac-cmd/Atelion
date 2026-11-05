/**
 * ==============================================================================
 * ATELION EDGE AI ROUTER - CLOUDFLARE WORKER PROXY (SOLUTION 2 FULL CASCADE)
 * "Zero-Server-Load" Architecture (0% CPU & 0% RAM on Render Host)
 * ==============================================================================
 * Multi-Provider Free Cascading Engine:
 * 1. Groq LPU (llama-3.1-8b-instant @ ~800 tokens/sec, 14,400 RPD)
 * 2. OpenRouter Free (deepseek/deepseek-r1:free / meta-llama/llama-3.3-70b:free)
 * 3. Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct, 10,000 Neurons/Day FREE)
 * 4. GitHub Models (gpt-4o-mini via GitHub PAT, 150 RPD)
 * 5. Google Gemini 2.0 Flash (gemini-2.0-flash, 1,500 RPD, 1M context)
 * ==============================================================================
 */

export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight
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
      const prompt = body.prompt || body.queryText || '';
      const systemPrompt = body.systemPrompt || 'You are Atelion AI, an ultra-fast academic, coding, and mathematical reasoning assistant.';
      const stream = body.stream !== false;

      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Missing prompt in request body.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        });
      }

      // ========================================================================
      // CASCADE PROVIDER 1: Groq LPU (Sub-second, ~800 tokens/sec, 14,400 RPD)
      // ========================================================================
      if (env.GROQ_API_KEY) {
        try {
          const groqRes = await callGroqLPU(prompt, systemPrompt, env, stream);
          if (groqRes.ok) {
            return new Response(groqRes.body, {
              status: 200,
              headers: {
                'Content-Type': stream ? 'text/event-stream' : 'application/json',
                'Cache-Control': 'no-cache',
                'X-AI-Engine': 'Groq-LPU-llama-3.1-8b',
                ...getCorsHeaders(),
              },
            });
          }
          console.warn(`[EDGE-PROXY] Groq returned ${groqRes.status}. Escalating to OpenRouter Free...`);
        } catch (e) {
          console.warn('[EDGE-PROXY] Groq error:', e.message);
        }
      }

      // ========================================================================
      // CASCADE PROVIDER 2: OpenRouter Free (DeepSeek R1 / Llama 3.3 70B)
      // ========================================================================
      if (env.OPENROUTER_API_KEY) {
        try {
          const orRes = await callOpenRouterFree(prompt, systemPrompt, env, stream);
          if (orRes.ok) {
            return new Response(orRes.body, {
              status: 200,
              headers: {
                'Content-Type': stream ? 'text/event-stream' : 'application/json',
                'Cache-Control': 'no-cache',
                'X-AI-Engine': 'OpenRouter-DeepSeek-R1-Free',
                ...getCorsHeaders(),
              },
            });
          }
          console.warn(`[EDGE-PROXY] OpenRouter returned ${orRes.status}. Escalating to Cloudflare Workers AI...`);
        } catch (e) {
          console.warn('[EDGE-PROXY] OpenRouter error:', e.message);
        }
      }

      // ========================================================================
      // CASCADE PROVIDER 3: Cloudflare Workers AI Native Edge (@cf/meta/llama-3.1-8b-instruct)
      // ========================================================================
      if (env.AI) {
        try {
          const cfAiRes = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            stream: stream,
          });

          if (stream) {
            return new Response(cfAiRes, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-AI-Engine': 'Cloudflare-Workers-AI-Llama-8b',
                ...getCorsHeaders(),
              },
            });
          } else {
            return new Response(JSON.stringify({ result: cfAiRes.response, engine: 'Cloudflare Workers AI' }), {
              headers: {
                'Content-Type': 'application/json',
                'X-AI-Engine': 'Cloudflare-Workers-AI',
                ...getCorsHeaders(),
              },
            });
          }
        } catch (e) {
          console.warn('[EDGE-PROXY] Cloudflare Workers AI error:', e.message);
        }
      }

      // ========================================================================
      // CASCADE PROVIDER 4: GitHub Models API (OpenAI gpt-4o-mini via GitHub PAT)
      // ========================================================================
      if (env.GITHUB_TOKEN || env.GH_MODELS_TOKEN) {
        try {
          const ghRes = await callGitHubModels(prompt, systemPrompt, env, stream);
          if (ghRes.ok) {
            return new Response(ghRes.body, {
              status: 200,
              headers: {
                'Content-Type': stream ? 'text/event-stream' : 'application/json',
                'Cache-Control': 'no-cache',
                'X-AI-Engine': 'GitHub-Models-gpt-4o-mini',
                ...getCorsHeaders(),
              },
            });
          }
          console.warn(`[EDGE-PROXY] GitHub Models returned ${ghRes.status}. Escalating to Gemini 2.0 Flash...`);
        } catch (e) {
          console.warn('[EDGE-PROXY] GitHub Models error:', e.message);
        }
      }

      // ========================================================================
      // CASCADE PROVIDER 5: Google Gemini 2.0 Flash (1M Context, 1,500 RPD)
      // ========================================================================
      if (env.GEMINI_API_KEY) {
        const geminiResponse = await callGeminiFlash(prompt, systemPrompt, env, stream);
        return new Response(geminiResponse.body, {
          status: geminiResponse.status,
          headers: {
            'Content-Type': stream ? 'text/event-stream' : 'application/json',
            'Cache-Control': 'no-cache',
            'X-AI-Engine': 'Gemini-2.0-Flash-Fallback',
            ...getCorsHeaders(),
          },
        });
      }

      return new Response(JSON.stringify({
        error: 'No valid AI provider secret keys configured in Cloudflare Worker environment.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      });

    } catch (globalErr) {
      console.error('[EDGE-PROXY-FATAL]', globalErr.message);
      return new Response(JSON.stringify({
        error: 'All AI edge providers currently exhausted. Please try again shortly.',
        details: globalErr.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      });
    }
  },
};

/**
 * 1. GROQ LPU CALL
 */
async function callGroqLPU(prompt, systemPrompt, env, stream) {
  return await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2048,
      stream: stream,
    }),
  });
}

/**
 * 2. OPENROUTER FREE TIER CALL (DeepSeek R1 / Llama 3.3 70B)
 */
async function callOpenRouterFree(prompt, systemPrompt, env, stream) {
  return await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://atelion.workspace',
      'X-Title': 'Atelion Zero-Cost AI',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-r1:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2048,
      stream: stream,
    }),
  });
}

/**
 * 3. GITHUB MODELS API CALL (OpenAI gpt-4o-mini)
 */
async function callGitHubModels(prompt, systemPrompt, env, stream) {
  const token = env.GITHUB_TOKEN || env.GH_MODELS_TOKEN;
  return await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2048,
      stream: stream,
    }),
  });
}

/**
 * 4. GEMINI FLASH-LITE FAILOVER CALL (With 503 Auto-Shift to 3.5-flash-lite)
 */
async function callGeminiFlash(prompt, systemPrompt, env, stream, imageBase64 = null) {
  const models = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite'];
  let lastRes = null;

  for (const model of models) {
    try {
      const endpoint = stream
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const parts = [];
      if (imageBase64) {
        const cleanB64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        parts.push({
          inlineData: {
            mimeType,
            data: cleanB64,
          },
        });
      }
      parts.push({ text: prompt });

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (res.status === 503 || res.status === 404) {
        console.warn(`[EDGE-GEMINI] ${model} returned ${res.status}. Shifting to next model...`);
        lastRes = res;
        continue;
      }

      return res;
    } catch (e) {
      console.warn(`[EDGE-GEMINI] Error with ${model}:`, e.message);
    }
  }

  return lastRes || new Response(JSON.stringify({ error: 'Gemini service temporarily unavailable.' }), { status: 503 });
}

/**
 * Global CORS Headers for Edge Access
 */
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };
}
