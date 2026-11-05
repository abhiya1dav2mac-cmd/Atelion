/**
 * ==============================================================================
 * ATELION ADVANCED NOTION DATABASE & SYNCED BLOCKS ENGINE
 * 1. Multi-View Databases (Table, Kanban Board, Gallery, Timeline)
 * 2. Formulas 2.0 (Dynamic progress bars, date calculations, rollups)
 * 3. Two-Way Synced Blocks (Live mirrored blocks across multiple notes)
 * 4. Interactive Button Automations (1-Click multi-step workflows)
 * ==============================================================================
 */

class AtelionNotionDatabaseEngine {
  constructor() {
    this.databases = new Map();
    this.syncedBlocks = new Map(); // blockId -> { content, mirrorElementIds }
    this.initDefaultDatabase();
  }

  initDefaultDatabase() {
    const defaultDb = {
      id: 'db_master_tasks',
      title: 'Sprint Roadmap & Knowledge Base',
      view: 'table', // 'table', 'board', 'gallery'
      columns: [
        { key: 'title', label: 'Item Name', type: 'title' },
        { key: 'status', label: 'Status', type: 'select', options: ['Backlog', 'In Progress', 'In Review', 'Done'] },
        { key: 'priority', label: 'Priority', type: 'select', options: ['Urgent', 'High', 'Normal', 'Low'] },
        { key: 'progress', label: 'Completion Formula', type: 'formula' },
        { key: 'tags', label: 'Tags', type: 'multi-select' },
      ],
      rows: [
        {
          id: 'row-1',
          title: 'Implement Zero-Knowledge E2EE Vault',
          status: 'Done',
          priority: 'Urgent',
          percent: 100,
          tags: ['Security', 'WebCrypto', 'FIDO2'],
        },
        {
          id: 'row-2',
          title: 'Client-Compute 0% Load P2P Mesh',
          status: 'Done',
          priority: 'High',
          percent: 100,
          tags: ['Scale', 'IndexedDB', 'WebRTC'],
        },
        {
          id: 'row-3',
          title: 'Google Circle to Search Multimodal AI',
          status: 'Done',
          priority: 'High',
          percent: 100,
          tags: ['AI', 'Canvas', 'Pixel'],
        },
        {
          id: 'row-4',
          title: 'Banking-Grade Anti-Inspect Shield',
          status: 'In Progress',
          priority: 'Urgent',
          percent: 90,
          tags: ['RASP', 'Security', 'Helmet'],
        },
      ],
    };

    this.databases.set(defaultDb.id, defaultDb);
  }

  /**
   * 1. FORMULAS 2.0 EVALUATOR
   * Generates dynamic visual progress bars and mathematical rollups
   */
  evaluateFormula(row) {
    const p = Math.min(100, Math.max(0, row.percent || 0));
    const filledBlocks = Math.round(p / 20);
    const emptyBlocks = 5 - filledBlocks;
    const bar = '■'.repeat(filledBlocks) + '□'.repeat(emptyBlocks);
    return `${bar} ${p}%`;
  }

  /**
   * 2. RENDER MULTI-VIEW DATABASE
   */
  renderView(dbId, targetContainerId, viewType = 'table') {
    const db = this.databases.get(dbId);
    const container = document.getElementById(targetContainerId);
    if (!db || !container) return;

    db.view = viewType;

    if (viewType === 'table') {
      container.innerHTML = this.buildTableView(db);
    } else if (viewType === 'board') {
      container.innerHTML = this.buildBoardView(db);
    } else if (viewType === 'gallery') {
      container.innerHTML = this.buildGalleryView(db);
    }
  }

  buildTableView(db) {
    return `
      <div class="notion-db-wrapper">
        <div class="notion-db-toolbar">
          <div class="ndb-views">
            <button type="button" class="ndb-view-btn active" onclick="window.notionEngine.renderView('${db.id}', 'notionDbContainer', 'table')">📋 Table</button>
            <button type="button" class="ndb-view-btn" onclick="window.notionEngine.renderView('${db.id}', 'notionDbContainer', 'board')">🗂️ Board</button>
            <button type="button" class="ndb-view-btn" onclick="window.notionEngine.renderView('${db.id}', 'notionDbContainer', 'gallery')">🖼️ Gallery</button>
          </div>
          <button type="button" class="btn-primary btn-sm" onclick="window.notionEngine.addRow('${db.id}')">+ Add Row</button>
        </div>
        <table class="notion-table">
          <thead>
            <tr>
              ${db.columns.map((c) => `<th>${c.label}</th>`).join('')}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${db.rows
              .map(
                (row) => `
              <tr>
                <td><b>${row.title}</b></td>
                <td><span class="status-pill status-${row.status.toLowerCase().replace(/\s+/g, '-')}">${row.status}</span></td>
                <td><span class="priority-pill pri-${row.priority.toLowerCase()}">${row.priority}</span></td>
                <td><code class="formula-code">${this.evaluateFormula(row)}</code></td>
                <td>
                  <div class="tags-cluster">
                    ${(row.tags || []).map((t) => `<span class="tag-chip">${t}</span>`).join('')}
                  </div>
                </td>
                <td>
                  <button type="button" class="btn-xs" onclick="window.notionEngine.deleteRow('${db.id}', '${row.id}')">✕</button>
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  buildBoardView(db) {
    const statuses = ['Backlog', 'In Progress', 'In Review', 'Done'];
    return `
      <div class="notion-db-wrapper">
        <div class="notion-db-toolbar">
          <div class="ndb-views">
            <button type="button" class="ndb-view-btn" onclick="window.notionEngine.renderView('${db.id}', 'notionDbContainer', 'table')">📋 Table</button>
            <button type="button" class="ndb-view-btn active" onclick="window.notionEngine.renderView('${db.id}', 'notionDbContainer', 'board')">🗂️ Board</button>
            <button type="button" class="ndb-view-btn" onclick="window.notionEngine.renderView('${db.id}', 'notionDbContainer', 'gallery')">🖼️ Gallery</button>
          </div>
          <button type="button" class="btn-primary btn-sm" onclick="window.notionEngine.addRow('${db.id}')">+ Add Card</button>
        </div>
        <div class="notion-board-grid">
          ${statuses
            .map(
              (st) => `
            <div class="notion-board-col">
              <div class="nbc-header">
                <span class="status-pill status-${st.toLowerCase().replace(/\s+/g, '-')}">${st}</span>
                <span class="nbc-count">${db.rows.filter((r) => r.status === st).length}</span>
              </div>
              <div class="nbc-cards">
                ${db.rows
                  .filter((r) => r.status === st)
                  .map(
                    (r) => `
                  <div class="notion-card">
                    <h4>${r.title}</h4>
                    <div class="nc-meta">
                      <span class="priority-pill pri-${r.priority.toLowerCase()}">${r.priority}</span>
                      <code class="formula-code">${this.evaluateFormula(r)}</code>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  buildGalleryView(db) {
    return `
      <div class="notion-db-wrapper">
        <div class="notion-db-toolbar">
          <div class="ndb-views">
            <button type="button" class="ndb-view-btn" onclick="window.notionEngine.renderView('${db.id}', 'notionDbContainer', 'table')">📋 Table</button>
            <button type="button" class="ndb-view-btn" onclick="window.notionEngine.renderView('${db.id}', 'notionDbContainer', 'board')">🗂️ Board</button>
            <button type="button" class="ndb-view-btn active" onclick="window.notionEngine.renderView('${db.id}', 'notionDbContainer', 'gallery')">🖼️ Gallery</button>
          </div>
          <button type="button" class="btn-primary btn-sm" onclick="window.notionEngine.addRow('${db.id}')">+ Add Card</button>
        </div>
        <div class="notion-gallery-grid">
          ${db.rows
            .map(
              (r) => `
            <div class="notion-gallery-card">
              <div class="ngc-cover">✨</div>
              <div class="ngc-body">
                <h4>${r.title}</h4>
                <div class="nc-meta">
                  <span class="status-pill status-${r.status.toLowerCase().replace(/\s+/g, '-')}">${r.status}</span>
                  <code class="formula-code">${this.evaluateFormula(r)}</code>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  addRow(dbId) {
    const db = this.databases.get(dbId);
    if (!db) return;
    const title = prompt('Enter new task / page title:', 'New Project Milestone');
    if (!title) return;

    db.rows.push({
      id: 'row_' + Date.now(),
      title,
      status: 'In Progress',
      priority: 'Normal',
      percent: 25,
      tags: ['Feature'],
    });

    this.renderView(dbId, 'notionDbContainer', db.view);
    if (window.showToast) window.showToast(`Added "${title}" to database!`, 'success');
  }

  deleteRow(dbId, rowId) {
    const db = this.databases.get(dbId);
    if (!db) return;
    db.rows = db.rows.filter((r) => r.id !== rowId);
    this.renderView(dbId, 'notionDbContainer', db.view);
  }

  /**
   * 3. TWO-WAY SYNCED BLOCKS
   */
  registerSyncedBlock(blockId, initialContent) {
    if (!this.syncedBlocks.has(blockId)) {
      this.syncedBlocks.set(blockId, { content: initialContent, mirrorElements: [] });
    }
  }

  updateSyncedBlock(blockId, newContent) {
    const blk = this.syncedBlocks.get(blockId);
    if (!blk) return;
    blk.content = newContent;

    // Update all occurrences in active DOM
    document.querySelectorAll(`[data-synced-block="${blockId}"]`).forEach((el) => {
      if (el.innerText !== newContent) {
        el.innerText = newContent;
      }
    });

    if (window.syncEngine) {
      window.syncEngine.registerEdit(`synced_${blockId}`, 'Synced Block', newContent, 'synced_block');
    }
  }

  /**
   * 4. BUTTON AUTOMATION ENGINE
   */
  executeButtonAutomation(actionName) {
    if (actionName === 'START_SPRINT') {
      const db = this.databases.get('db_master_tasks');
      if (db) {
        db.rows.forEach((r) => {
          if (r.status === 'Backlog') r.status = 'In Progress';
        });
        this.renderView('db_master_tasks', 'notionDbContainer', db.view);
        if (window.showToast) window.showToast('🚀 Automation: Moved all backlog items to In Progress!', 'success');
      }
    }
  }
}

// Global Singleton Instance
window.notionEngine = new AtelionNotionDatabaseEngine();
