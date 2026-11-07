/**
 * ==============================================================================
 * DRAFT SNAPSHOT MODEL (WITH MONGODB NATIVE TTL INDEX)
 * Automatic Time-To-Live (TTL) Lifecycle Management for 100,000+ Concurrent Users.
 * ==============================================================================
 * Keystroke autosaves & incremental drafts are kept for 7 days, after which
 * MongoDB Atlas's background TTL thread automatically purges them to prevent
 * storage bloat and unnecessary cluster costs.
 */

const mongoose = require('mongoose');

const DraftSnapshotSchema = new mongoose.Schema(
  {
    docId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    workspaceId: {
      type: String,
      default: 'workspace_default',
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Draft',
    },
    blocks: {
      type: Array,
      default: [],
    },
    etag: {
      type: String,
    },
    clientTimestamp: {
      type: Number,
      default: Date.now,
    },
    // MongoDB Native TTL: Document is permanently removed once expiresAt <= current date
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 Days TTL
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user + doc drafts lookup
DraftSnapshotSchema.index({ userId: 1, docId: 1, createdAt: -1 });

module.exports = mongoose.model('DraftSnapshot', DraftSnapshotSchema);
