/**
 * ==============================================================================
 * ATELION ZERO-KNOWLEDGE E2EE VAULT CRYPTO ENGINE
 * Powered by WebCrypto API (AES-GCM-256 + PBKDF2 100,000 rounds)
 * ==============================================================================
 * Core Principles:
 * 1. Encryption and decryption occur 100% inside the client browser.
 * 2. Unencrypted plaintext NEVER leaves the user's device.
 * 3. The server and database only ever see unreadable ciphertext and random IVs.
 */

class AtelionVaultCrypto {
  /**
   * Convert Buffer / Uint8Array to Base64URL string
   */
  static bufferToBase64Url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Convert Base64URL string to ArrayBuffer
   */
  static base64UrlToBuffer(base64url) {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate 16-byte cryptographically secure random salt
   */
  static generateSalt() {
    const salt = new Uint8Array(16);
    window.crypto.getRandomValues(salt);
    return this.bufferToBase64Url(salt);
  }

  /**
   * Derive AES-GCM-256 CryptoKey using PBKDF2 (100,000 iterations of SHA-256)
   */
  static async deriveKey(passphraseOrSeed, saltBase64) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphraseOrSeed),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const saltBuffer = this.base64UrlToBuffer(saltBase64);

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false, // non-exportable key for maximum memory security
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a plaintext string using AES-GCM-256
   */
  static async encryptString(plaintext, cryptoKey) {
    const iv = new Uint8Array(12);
    window.crypto.getRandomValues(iv); // 96-bit unique IV

    const encoded = new TextEncoder().encode(plaintext);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      cryptoKey,
      encoded
    );

    return {
      ciphertext: this.bufferToBase64Url(ciphertextBuffer),
      iv: this.bufferToBase64Url(iv),
    };
  }

  /**
   * Decrypt a ciphertext string using AES-GCM-256
   */
  static async decryptString(ciphertextBase64, ivBase64, cryptoKey) {
    const ciphertextBuffer = this.base64UrlToBuffer(ciphertextBase64);
    const ivBuffer = this.base64UrlToBuffer(ivBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer,
      },
      cryptoKey,
      ciphertextBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Encrypt a complete document package (Title + Content)
   */
  static async encryptDocument({ title, content, passphraseOrSeed, existingSalt = null }) {
    const salt = existingSalt || this.generateSalt();
    const key = await this.deriveKey(passphraseOrSeed, salt);

    const titleEncrypted = await this.encryptString(title, key);
    const contentEncrypted = await this.encryptString(content, key);

    return {
      salt,
      titleCipher: titleEncrypted.ciphertext,
      titleIv: titleEncrypted.iv,
      ciphertext: contentEncrypted.ciphertext,
      iv: contentEncrypted.iv,
    };
  }

  /**
   * Decrypt a complete document package
   */
  static async decryptDocument({ titleCipher, titleIv, ciphertext, iv, salt, passphraseOrSeed }) {
    const key = await this.deriveKey(passphraseOrSeed, salt);

    // If title has its own IV, use it; otherwise use document IV
    const resolvedTitleIv = titleIv || iv;
    const title = await this.decryptString(titleCipher, resolvedTitleIv, key);
    const content = await this.decryptString(ciphertext, iv, key);

    return { title, content };
  }
}

// Attach to window for global access
window.AtelionVaultCrypto = AtelionVaultCrypto;
