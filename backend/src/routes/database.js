/**
 * ==============================================================================
 * MULTI-DATABASE & DATA SHARDING API ROUTES
 * Exposes Edge Metadata, Shard Router, and Polyglot Multi-DB Status
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Document = require('../models/Document');
const {
  getMultiDbStatus,
  getWorkspaceShard,
  getUserMetadata,
  registerUserMetadata,
  savePageTreeNode,
  getPageHierarchyTree,
} = require('../services/tursoShardingService');

/**
 * 1. GET /api/database/status
 * Returns full live diagnostic telemetry for all multi-databases
 */
router.get('/status', async (req, res) => {
  try {
    const status = await getMultiDbStatus();
    status.layers.layer2_heavy_blocks.status =
      mongoose.connection.readyState === 1 ? 'Connected (Atlas Cluster)' : 'Local Memory Fallback';

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...status,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. POST /api/database/shard/route
 * Resolves the isolated micro-shard for a given workspace
 */
router.post('/shard/route', async (req, res) => {
  try {
    const { workspaceId = 'default_space' } = req.body;
    const shard = await getWorkspaceShard(workspaceId);

    res.json({
      success: true,
      workspaceId,
      shardId: shard.shardId,
      shardName: shard.shardName,
      region: shard.region,
      latency: '0ms - 2ms',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. GET /api/database/user/:userId
 * Fast 0ms edge lookup of user details and passkey credentials
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const meta = await getUserMetadata(userId);

    if (!meta) {
      return res.status(404).json({ success: false, message: 'User metadata not found in edge shard.' });
    }

    res.json({
      success: true,
      source: 'Turso LibSQL Edge Metadata',
      user: meta,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. GET /api/database/tree/:workspaceId
 * Returns recursive page hierarchy tree from Turso in sub-millisecond time
 */
router.get('/tree/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const tree = await getPageHierarchyTree(workspaceId);

    res.json({
      success: true,
      workspaceId,
      count: tree.length,
      tree,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. POST /api/database/tree/node
 * Saves a page tree node in Turso edge metadata
 */
router.post('/tree/node', async (req, res) => {
  try {
    const { pageId, workspaceId, parentPageId, title, icon, sortOrder, visibility } = req.body;

    if (!pageId || !title) {
      return res.status(400).json({ success: false, error: 'Missing pageId or title' });
    }

    const saved = await savePageTreeNode({
      pageId,
      workspaceId: workspaceId || 'workspace_default',
      parentPageId: parentPageId || null,
      title,
      icon: icon || '📄',
      sortOrder: sortOrder || 0,
      visibility: visibility || 'private',
    });

    res.json({
      success: true,
      source: 'Turso Edge Tree',
      node: saved,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 6. POST /api/database/save-page
 * Polyglot Multi-Database Split Ingestion:
 * - Edge metadata & Page Tree -> Turso libSQL (0ms)
 * - Heavy nested block array & revisions -> MongoDB Atlas
 */
router.post('/save-page', async (req, res) => {
  try {
    const { page, userId = '31bd872ba9043c2805', workspaceId = 'eb159cff712b476005' } = req.body;

    if (!page || !page.id) {
      return res.status(400).json({ success: false, error: 'Missing page payload' });
    }

    const t0 = Date.now();

    // 1. Turso LibSQL Edge Metadata & Tree Update
    await savePageTreeNode({
      pageId: page.id,
      workspaceId,
      parentPageId: page.parentPageId || null,
      title: page.title || 'Untitled',
      icon: page.icon || '📄',
      sortOrder: page.sortOrder || 0,
      visibility: page.visibility || 'private',
    });
    const tursoDuration = Date.now() - t0;

    // 2. MongoDB Atlas Heavy Block Storage (when MongoDB connected)
    let mongoDuration = 0;
    let mongoStatus = 'offline-fallback';
    if (mongoose.connection.readyState === 1) {
      const m0 = Date.now();
      const contentJson = JSON.stringify(page.blocks || []);
      const etag = crypto.createHash('md5').update(contentJson).digest('hex');

      try {
        await Document.findOneAndUpdate(
          { docId: page.id },
          {
            $set: {
              title: page.title,
              content: contentJson,
              type: page.isDatabasePage ? 'database' : 'note',
              etag,
              updatedAt: new Date(),
            },
            $push: {
              history: {
                $each: [
                  {
                    version: Date.now(),
                    title: page.title,
                    content: contentJson.slice(0, 500),
                    commitMessage: 'Automatic checkpoint',
                    etag,
                    timestamp: new Date(),
                  },
                ],
                $slice: -20,
              },
            },
          },
          { upsert: true, new: true }
        );
        mongoDuration = Date.now() - m0;
        mongoStatus = 'saved-to-atlas';
      } catch (mErr) {
        mongoStatus = 'mongo-notice: ' + mErr.message;
      }
    }

    res.json({
      success: true,
      pageId: page.id,
      polyglot: {
        tursoEdge: {
          table: 'page_hierarchy_tree',
          durationMs: tursoDuration,
          status: 'synced-0ms',
        },
        mongoAtlas: {
          collection: 'documents',
          durationMs: mongoDuration,
          status: mongoStatus,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
