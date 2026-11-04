const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const VaultItem = require('../models/VaultItem');

// All vault operations require authenticated session
router.use(authenticateToken);

// ==============================================================================
// 1. LIST ENCRYPTED VAULT ITEMS (METADATA + CIPHERTEXT)
// ==============================================================================
router.get('/items', async (req, res) => {
  try {
    const items = await VaultItem.find({ userId: req.user.userId })
      .select('_id titleCipher itemType salt iv sizeBytes createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: items.length,
      zeroKnowledgeGuaranteed: true,
      items,
    });
  } catch (err) {
    console.error('[VAULT-LIST-ERROR]', err.message);
    res.status(500).json({ error: 'Failed to retrieve vault items.' });
  }
});

// ==============================================================================
// 2. CREATE NEW ENCRYPTED VAULT ITEM
// ==============================================================================
router.post('/items', async (req, res) => {
  try {
    const { titleCipher, ciphertext, iv, salt, itemType, keyId } = req.body;

    if (!ciphertext || !iv || !salt || !titleCipher) {
      return res.status(400).json({
        error: 'Missing required E2EE parameters: titleCipher, ciphertext, iv, and salt are mandatory.',
      });
    }

    const sizeBytes = Buffer.byteLength(ciphertext, 'utf8');

    const item = new VaultItem({
      userId: req.user.userId,
      titleCipher,
      ciphertext,
      iv,
      salt,
      itemType: itemType || 'document',
      keyId: keyId || 'master-prf-key',
      sizeBytes,
      isEncrypted: true,
    });

    await item.save();

    console.log(`[E2EE-VAULT] 🔒 Zero-knowledge encrypted item stored for user ${req.user.email} (${sizeBytes} bytes)`);

    res.status(201).json({
      success: true,
      message: 'Document encrypted on device and securely stored in Zero-Knowledge Vault.',
      item: {
        id: item._id,
        titleCipher: item.titleCipher,
        itemType: item.itemType,
        sizeBytes: item.sizeBytes,
        createdAt: item.createdAt,
      },
    });
  } catch (err) {
    console.error('[VAULT-CREATE-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to save encrypted document.' });
  }
});

// ==============================================================================
// 3. GET SINGLE ENCRYPTED VAULT ITEM (FOR CLIENT-SIDE DECRYPTION)
// ==============================================================================
router.get('/items/:id', async (req, res) => {
  try {
    const item = await VaultItem.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!item) {
      return res.status(404).json({ error: 'Encrypted document not found.' });
    }

    res.json({
      success: true,
      zeroKnowledge: true,
      item,
    });
  } catch (err) {
    console.error('[VAULT-GET-ERROR]', err.message);
    res.status(500).json({ error: 'Failed to retrieve encrypted document.' });
  }
});

// ==============================================================================
// 4. UPDATE ENCRYPTED VAULT ITEM
// ==============================================================================
router.put('/items/:id', async (req, res) => {
  try {
    const { titleCipher, ciphertext, iv, salt, itemType } = req.body;

    const item = await VaultItem.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!item) {
      return res.status(404).json({ error: 'Encrypted document not found.' });
    }

    if (titleCipher) item.titleCipher = titleCipher;
    if (ciphertext) {
      item.ciphertext = ciphertext;
      item.sizeBytes = Buffer.byteLength(ciphertext, 'utf8');
    }
    if (iv) item.iv = iv;
    if (salt) item.salt = salt;
    if (itemType) item.itemType = itemType;

    await item.save();

    console.log(`[E2EE-VAULT] 🔄 Encrypted item updated for user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Encrypted document updated successfully.',
      item: {
        id: item._id,
        titleCipher: item.titleCipher,
        sizeBytes: item.sizeBytes,
        updatedAt: item.updatedAt,
      },
    });
  } catch (err) {
    console.error('[VAULT-UPDATE-ERROR]', err.message);
    res.status(500).json({ error: err.message || 'Failed to update encrypted document.' });
  }
});

// ==============================================================================
// 5. DELETE ENCRYPTED VAULT ITEM
// ==============================================================================
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await VaultItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!item) {
      return res.status(404).json({ error: 'Encrypted document not found.' });
    }

    console.log(`[E2EE-VAULT] 🗑️ Encrypted item deleted for user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Encrypted document purged from database.',
    });
  } catch (err) {
    console.error('[VAULT-DELETE-ERROR]', err.message);
    res.status(500).json({ error: 'Failed to delete vault item.' });
  }
});

module.exports = router;
