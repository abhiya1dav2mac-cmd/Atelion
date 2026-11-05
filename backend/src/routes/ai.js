/**
 * ==============================================================================
 * ATELION CIRCLE TO SEARCH - MULTIMODAL & SEMANTIC AI SEARCH ROUTE
 * Backed by DEDICATED TURSO EDGE DATABASE & SOLUTION 2 MULTI-PROVIDER CASCADE
 * (0% CPU, 0% RAM on Render 512MB Host Server)
 * ==============================================================================
 */

const express = require('express');
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
 * POST /api/ai/circle-search
 * High-speed Circle to Search with Dedicated Turso Edge Cache & Multi-Provider Cascade
 */
router.post('/circle-search', async (req, res) => {
  const startTime = Date.now();
  try {
    const { queryText, imageBase64, userId } = req.body;

    if (!queryText && !imageBase64) {
      return res.status(400).json({ error: 'Circle to Search requires query text or visual crop data.' });
    }

    // 1. Check Dedicated Turso Edge Cache first (sub-5ms hit - 0 tokens burned)
    const cachedHit = await getCachedSearch(queryText);
    if (cachedHit) {
      return res.json({
        success: true,
        query: queryText,
        cached: true,
        database: 'Turso Dedicated Circle Search DB',
        hitCount: cachedHit.hitCount,
        aiEngine: cachedHit.engine,
        result: cachedHit.result,
        processingTimeMs: Date.now() - startTime,
        timestamp: Date.now(),
      });
    }

    // 2. Cache Miss: Execute Multi-Provider Free AI Cascade
    // If Image/Diagram -> Gemini Flash-Lite Vision with 503 Auto-Shift
    // If Text -> Groq LPU (~800 tok/s) with 429 Fallback to Gemini Flash-Lite
    const aiResult = await queryMultiProviderCascade({
      prompt: queryText,
      imageBase64,
      queryType: imageBase64 ? 'vision-ocr' : 'circle-search',
    });
    const aiEngine = aiResult.provider || 'Atelion Multi-Provider Cascade';

    // 3. Save to Dedicated Turso Cache asynchronously (Zero user wait time)
    saveSearchCache({
      queryText,
      queryType: aiResult.type,
      aiResult,
      aiEngine,
    }).catch(() => {});

    // 4. Save to User History in Turso
    if (userId) {
      saveSearchHistory({
        userId,
        queryText,
        queryType: aiResult.type,
        aiTitle: aiResult.title,
        aiSummary: aiResult.summary,
      }).catch(() => {});
    }

    res.json({
      success: true,
      query: queryText,
      cached: false,
      database: 'Turso Dedicated Circle Search DB (Cached for next lookup)',
      aiEngine,
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
 * POST /api/ai/ask
 * General AI Assistant Query with 0% Render Load (Multi-Provider Cloud Cascade)
 */
router.post('/ask', async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt, systemPrompt, userId } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    // Check Turso Cache
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

    const aiResult = await queryMultiProviderCascade({ prompt, systemPrompt });

    // Cache into Turso
    saveSearchCache({
      queryText: prompt,
      queryType: 'assistant',
      aiResult,
      aiEngine: aiResult.provider,
    }).catch(() => {});

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
 * Fetch past circle to search lookups from dedicated Turso database
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
 * Toggle bookmark status for a search history item in Turso
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
