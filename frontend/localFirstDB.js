/**
 * ==============================================================================
 * ATELION LOCAL-FIRST INDEXEDDB ENGINE
 * Database: AtelionClientDB_v1
 * Stores documents, queues, and offline drafts directly in browser IndexedDB.
 * Result: 0 Server reads, 0 Server CPU usage for active editing.
 * ==============================================================================
 */

class AtelionLocalFirstDB {
  constructor() {
    this.dbName = 'AtelionClientDB_v1';
    this.version = 1;
    this.db = null;
    this.readyPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        // 1. Documents Store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          docStore.createIndex('isDirty', 'isDirty', { unique: false });
        }

        // 2. Offline Sync Queue Store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const queueStore = db.createObjectStore('syncQueue', { keyPath: 'opId' });
          queueStore.createIndex('docId', 'docId', { unique: false });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 3. Telemetry & Zero-Load Metrics Store
        if (!db.objectStoreNames.contains('metrics')) {
          db.createObjectStore('metrics', { keyPath: 'key' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('[LOCAL-DB] Failed to open IndexedDB:', e.target.error);
        reject(e.target.error);
      };
    });
  }

  async saveLocalDoc({ id, title, content, type = 'note', isDirty = true }) {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('documents', 'readwrite');
      const store = tx.objectStore('documents');

      const doc = {
        id,
        title: title || 'Untitled Document',
        content: content || '',
        type,
        isDirty,
        version: Date.now(),
        updatedAt: new Date().toISOString(),
      };

      const req = store.put(doc);
      req.onsuccess = () => resolve(doc);
      req.onerror = () => reject(req.error);
    });
  }

  async getLocalDoc(id) {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllLocalDocs() {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('documents', 'readonly');
      const store = tx.objectStore('documents');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteLocalDoc(id) {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('documents', 'readwrite');
      const store = tx.objectStore('documents');
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async queueSyncOperation({ docId, action, delta, compressedPayload = null }) {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');

      const op = {
        opId: 'op_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        docId,
        action,
        delta,
        compressedPayload,
        timestamp: Date.now(),
        status: 'pending',
      };

      const req = store.put(op);
      req.onsuccess = () => resolve(op);
      req.onerror = () => reject(req.error);
    });
  }

  async getPendingSyncOps() {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readonly');
      const store = tx.objectStore('syncQueue');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async removeSyncedOps(opIds) {
    await this.readyPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('syncQueue', 'readwrite');
      const store = tx.objectStore('syncQueue');
      opIds.forEach((id) => store.delete(id));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}

window.localFirstDB = new AtelionLocalFirstDB();

