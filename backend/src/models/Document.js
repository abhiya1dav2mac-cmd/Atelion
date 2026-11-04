const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    docId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Document',
    },
    content: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'note',
    },
    version: {
      type: Number,
      default: 1,
    },
    merkleRoot: {
      type: String,
      default: '',
    },
    etag: {
      type: String,
      index: true,
    },
    history: [
      {
        version: Number,
        title: String,
        content: String,
        commitMessage: String,
        commitSha: String,
        etag: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user doc retrieval
DocumentSchema.index({ userId: 1, docId: 1 }, { unique: true });

module.exports = mongoose.model('Document', DocumentSchema);

