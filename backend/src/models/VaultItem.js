const mongoose = require('mongoose');

const VaultItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['document', 'note', 'credential', 'snippet'],
      default: 'document',
    },
    keyId: {
      type: String,
      default: 'master-prf-key',
    },
    // The salt used by the browser to derive the AES-256-GCM encryption key
    salt: {
      type: String,
      required: true,
    },
    // Initialization vector (12 bytes base64)
    iv: {
      type: String,
      required: true,
    },
    // Encrypted document title (Blind to the database!)
    titleCipher: {
      type: String,
      required: true,
    },
    // AES-GCM-256 Encrypted Payload (Base64)
    ciphertext: {
      type: String,
      required: true,
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    isEncrypted: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('VaultItem', VaultItemSchema);
