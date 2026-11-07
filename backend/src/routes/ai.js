/**
 * ==============================================================================
 * ATELION CIRCLE TO SEARCH - MULTIMODAL FREEHAND PENCIL & MULTI-TURN CHAT ROUTE
 * Backed by DEDICATED TURSO EDGE DATABASE & MULTI-PROVIDER AI CASCADE
 * Supports:
 *  1. Direct Freehand Pencil Search (Home & Read PDF — underline, bracket,
 *     diagram, circuit, chemical ring, or handwritten math -> direct result)
 *  2. Multi-Turn Follow-Up + Any Other Question Chatbox & Inline Pencil Pad
 * ==============================================================================
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const {
  getCachedSearch,
  saveSearchCache,
  saveSearchHistory,
  getUserHistory,
  toggleBookmark,
} = require('../services/circleSearchTurso');
const { queryMultiProviderCascade } = require('../services/multiProviderAiCascade');

/**
 * Build deterministic cache key combining text + visual sketch fingerprint
 */
function buildCircleCacheKey(queryText, imageBase64) {
  const cleanText = (queryText || '').trim();
  if (!imageBase64) return cleanText;
  const imgHash = crypto.createHash('sha1').update(imageBase64).digest('hex').slice(0, 16);
  return `${cleanText || 'freehand_sketch'}::vision_${imgHash}`;
}

/**
 * POST /api/ai/circle-search
 * Direct Freehand Pencil Result for BOTH Home Circle Search & Read PDF Circle Search
 */
router.post('/circle-search', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      queryText: rawQueryText = '',
      text = '',
      imageBase64 = null,
      gestureType = 'freehand-structure',
      source = 'home',
      pageTitle = '',
      userId,
    } = req.body;
    const queryText = rawQueryText || text || '';

    if (!queryText && !imageBase64) {
      return res.status(400).json({ error: 'Circle to Search requires freehand sketch crop or text.' });
    }

    const cacheKey = buildCircleCacheKey(queryText, imageBase64);

    // 1. Check Dedicated Turso Edge Cache first (sub-5ms hit)
    const cachedHit = cacheKey ? await getCachedSearch(cacheKey) : null;
    if (cachedHit) {
      return res.json({
        success: true,
        query: queryText || 'Freehand Pencil Selection',
        gestureType,
        source,
        cached: true,
        database: 'Turso Dedicated Circle Search DB',
        hitCount: cachedHit.hitCount,
        aiEngine: cachedHit.engine,
        solution: cachedHit.result?.explanation || cachedHit.result?.summary || '',
        result: cachedHit.result,
        processingTimeMs: Date.now() - startTime,
        timestamp: Date.now(),
      });
    }

    // 2. Construct rich multimodal prompt for ANY freehand structure / shape
    const structuredPrompt = queryText
      ? `Source: ${source === 'pdf' ? 'PDF Document Reader' : 'Workspace Note'}${pageTitle ? ` ("${pageTitle}")` : ''}.\n` +
        `User freehand pencil gesture (${gestureType}) selected/underlined:\n"${queryText}"\n\n` +
        `Provide a clear, structured explanation, convert/render all mathematical or chemical equations in standard LaTeX ($...$ and $$...$$), and highlight key takeaways.`
      : `Source: ${source === 'pdf' ? 'PDF Document Reader' : 'Workspace Freehand Canvas'}${pageTitle ? ` ("${pageTitle}")` : ''}.\n` +
        `The user drew or highlighted a structure/diagram/circuit/chemical ring/handwritten math formula using the Freehand Pencil (${gestureType}). ` +
        `Recognize the structure or handwritten math, write its exact equations in LaTeX ($...$ / $$...$$), and explain step-by-step.`;

    const aiResult = await queryMultiProviderCascade({
      prompt: queryText || structuredPrompt,
      imageBase64,
      queryType: imageBase64 ? 'vision-ocr' : 'circle-search',
      initialContext: queryText,
    });
    const aiEngine = aiResult.provider || 'Atelion Multi-Provider Cascade';

    // 3. Save to Dedicated Turso Cache asynchronously
    if (cacheKey) {
      saveSearchCache({
        queryText: cacheKey,
        queryType: aiResult.type || 'circle-search',
        aiResult,
        aiEngine,
      }).catch(() => {});
    }

    // 4. Save to User History in Turso
    if (userId) {
      saveSearchHistory({
        userId,
        queryText: queryText || `[Pencil ${gestureType}] ${aiResult.title || 'Visual Structure'}`,
        queryType: aiResult.type || 'vision-ocr',
        aiTitle: aiResult.title,
        aiSummary: aiResult.summary,
      }).catch(() => {});
    }

    res.json({
      success: true,
      query: queryText || 'Freehand Pencil Structure',
      gestureType,
      source,
      cached: false,
      database: 'Turso Dedicated Circle Search DB',
      aiEngine,
      solution: aiResult.explanation || aiResult.summary || '',
      result: aiResult,
      processingTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[CIRCLE-SEARCH-ERROR]', err.message);
    res.status(500).json({ error: 'Failed to process Circle to Search query.' });
  }
});

/**
 * POST /api/ai/circle-search/chat
 * Multi-Turn Follow-Up + Any Other Question Chatbox inside BOTH Circle Search Modals
 * Supports:
 *  - Related follow-ups (💡 Hinglish me samjhao, 📝 Short exam points, 🧮 Numerical example, ❓ Viva questions)
 *  - Any other unrelated / general academic or coding question
 *  - Built-in ✏️ Pencil Pad visual sketch attachments inside the modal
 */
router.post('/circle-search/chat', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      message = '',
      imageBase64 = null,
      initialContext = '',
      history = [],
      source = 'home',
      userId,
    } = req.body;

    if (!message.trim() && !imageBase64) {
      return res.status(400).json({ error: 'Please enter a question or draw on the Pencil Pad.' });
    }

    const systemPrompt =
      `You are Atelion Circle-to-Search Interactive Tutor (${source === 'pdf' ? 'Read PDF Mode' : 'Home Workspace Mode'}).\n` +
      (initialContext
        ? `Initial Circle Search Context: """${String(initialContext).slice(0, 1200)}"""\n`
        : '') +
      `Instructions:\n` +
      `1. If the user's question or Pencil Pad sketch is related to the Initial Circle Search Context or conversation history, answer directly in relation to it.\n` +
      `2. If the user asks ANY OTHER question on a completely new or different topic, smoothly answer that new question thoroughly without restricting them.\n` +
      `3. Format all math, physics, and chemistry formulas cleanly in LaTeX ($...$ for inline, $$...$$ for display blocks).\n` +
      `4. Keep formatting crisp with clear headings and bullet points.`;

    const effectivePrompt =
      message.trim() ||
      'Analyze this new freehand sketch drawn on the Pencil Pad, write any formulas in LaTeX, and explain step-by-step.';

    const aiResult = await queryMultiProviderCascade({
      prompt: effectivePrompt,
      imageBase64,
      systemPrompt,
      queryType: imageBase64 ? 'pencil-pad-vision' : 'circle-followup',
      history: Array.isArray(history) ? history : [],
      initialContext,
    });

    if (userId && message.trim()) {
      saveSearchHistory({
        userId,
        queryText: message.trim().slice(0, 160),
        queryType: 'circle-followup',
        aiTitle: aiResult.title,
        aiSummary: aiResult.summary,
      }).catch(() => {});
    }

    res.json({
      success: true,
      reply: aiResult.explanation || aiResult.summary,
      result: aiResult,
      aiEngine: aiResult.provider,
      processingTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[CIRCLE-CHAT-ERROR]', err.message);
    res.status(500).json({ error: 'Failed to process follow-up question.' });
  }
});

/**
 * POST /api/ai/ask
 * General AI Assistant Query with Multi-Turn Support
 */
router.post('/ask', async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt, systemPrompt, history = [], imageBase64 = null } = req.body;
    if (!prompt && !imageBase64) return res.status(400).json({ error: 'Prompt is required.' });

    if (!imageBase64 && (!history || history.length === 0)) {
      const cached = await getCachedSearch(prompt);
      if (cached) {
        return res.json({
          success: true,
          cached: true,
          result: cached.result,
          aiEngine: cached.engine,
          processingTimeMs: Date.now() - startTime,
        });
      }
    }

    const aiResult = await queryMultiProviderCascade({
      prompt,
      imageBase64,
      systemPrompt,
      history,
    });

    if (prompt && !imageBase64 && (!history || history.length === 0)) {
      saveSearchCache({
        queryText: prompt,
        queryType: 'assistant',
        aiResult,
        aiEngine: aiResult.provider,
      }).catch(() => {});
    }

    res.json({
      success: true,
      cached: false,
      result: aiResult,
      aiEngine: aiResult.provider,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (err) {
    console.error('[AI-ASK-ERROR]', err.message);
    res.status(500).json({ error: 'Failed to generate AI response.' });
  }
});

/**
 * GET /api/ai/circle-search/history
 */
router.get('/circle-search/history', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || 'guest_user';
    const limit = parseInt(req.query.limit, 10) || 25;
    const history = await getUserHistory(userId, limit);

    res.json({
      success: true,
      database: 'Turso Dedicated Circle Search DB',
      userId,
      count: history.length,
      history,
    });
  } catch (err) {
    console.error('[CIRCLE-HISTORY-ERROR]', err.message);
    res.status(500).json({ error: 'Failed to fetch search history from Turso DB.' });
  }
});

/**
 * POST /api/ai/circle-search/bookmark
 */
router.post('/circle-search/bookmark', async (req, res) => {
  try {
    const { id, isBookmarked } = req.body;
    if (!id) return res.status(400).json({ error: 'Search ID is required.' });

    const success = await toggleBookmark(id, isBookmarked !== false);
    res.json({ success, id, isBookmarked: isBookmarked !== false });
  } catch (err) {
    console.error('[CIRCLE-BOOKMARK-ERROR]', err.message);
    res.status(500).json({ error: 'Failed to update bookmark in Turso DB.' });
  }
});

module.exports = router;
