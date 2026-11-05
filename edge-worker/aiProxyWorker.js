/**
 * ==============================================================================
 * ATELION EDGE AI ROUTER - CLOUDFLARE WORKER PROXY
 * "Zero-Server-Load" Architecture (Groq LPU Primary + Gemini 2.0 Flash Failover)
 * ==============================================================================
 * Features:
 * 1. 0% CPU & 0% RAM on Main Server (Render / VPS is completely bypassed).
 * 2. Groq LPU Ultra-Speed (~800 tokens/sec via llama-3.1-8b-instant).
 * 3. 14,400 Free Daily Requests from Groq + 1,500 Free Requests from Gemini = 15,900 RPD!
 * 4. Automatic 429/503 Failover to Google Gemini 2.0 Flash.
 * 5. SSE (Server-Sent Events) live streaming directly to client browser.
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
      const systemPrompt = body.systemPrompt || 'You are Atelion AI, an ultra-fast academic and coding workspace assistant.';
      const stream = body.stream !== false;

      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Missing prompt in request body.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
        });
      }

      // Step 2: Attempt Primary Route - Groq LPU (Ultra-Fast 800 tokens/sec)
      try {
        const groqResponse = await callGroqLPU(prompt, systemPrompt, env, stream);
        if (groqResponse.ok) {
          // Stream or return Groq response directly to student browser
          return new Response(groqResponse.body, {
            status: 200,
            headers: {
              'Content-Type': stream ? 'text/event-stream' : 'application/json',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'X-AI-Engine': 'Groq-LPU-llama-3.1-8b',
              ...getCorsHeaders(),
            },
          });
        }
        console.warn(`[EDGE-PROXY] Groq returned status ${groqResponse.status}. Triggering Gemini 2.0 Flash Failover...`);
      } catch (groqErr) {
        console.warn('[EDGE-PROXY] Groq fetch error:', groqErr.message);
      }

      // Step 3: Secondary Failover - Google Gemini 2.0 Flash (1M Context, 1,500 RPD)
      console.log('[EDGE-PROXY] 🔄 Engaging Gemini 2.0 Flash Failover Engine...');
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
 * 1. GROQ LPU CALL (OpenAI Compatible Format)
 */
async function callGroqLPU(prompt, systemPrompt, env, stream) {
  const groqApiKey = env.GROQ_API_KEY;
  if (!groqApiKey) throw new Error('GROQ_API_KEY secret not configured in Cloudflare Worker.');

  return await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', // 14,400 RPD, ~800 tokens/sec
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
 * 2. GEMINI 2.0 FLASH FAILOVER CALL
 */
async function callGeminiFlash(prompt, systemPrompt, env, stream) {
  const geminiApiKey = env.GEMINI_API_KEY;
  if (!geminiApiKey) throw new Error('GEMINI_API_KEY secret not configured in Cloudflare Worker.');

  const endpoint = stream
    ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${geminiApiKey}`
    : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  return await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2048,
      },
    }),
  });
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
