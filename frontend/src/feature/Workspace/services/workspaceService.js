/**
 * ==============================================================================
 * ATELION WORKSPACE SERVICE
 * Manages Notion-style hierarchical document tree, block data, and local-first persistence.
 * Zero-latency 0ms local storage with background Turso / Cloud sync.
 * ==============================================================================
 */

const STORAGE_KEY = 'atelion_notion_pages';

export const STUDENT_PAGES = [
  {
    id: 'page_student_hub',
    title: '📚 Course Notes & Lecture Hub',
    icon: '📚',
    cover: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4F46E5 100%)',
    favorite: true,
    updatedAt: 'Just now',
    blocks: [
      { id: 'b_sh_1', type: 'callout', content: 'Welcome to your Student Study Hub! Organize lecture notes, solve equations with LaTeX, and use Circle to Search AI (bottom right) for instant step-by-step doubt explanations.', icon: '🎓' },
      { id: 'b_sh_2', type: 'heading_1', content: 'Weekly Study Checklist' },
      { id: 'b_sh_3', type: 'todo', content: 'Revise Schrödinger wave equation derivation for Physics Quiz', checked: true },
      { id: 'b_sh_4', type: 'todo', content: 'Implement Graph Dijkstra algorithm in C++/Python', checked: false },
      { id: 'b_sh_5', type: 'todo', content: 'Circle to Search: OCR handwritten notes from lecture 14', checked: false },
      { id: 'b_sh_6', type: 'heading_2', content: 'Active Course Syllabi & References' },
      { id: 'b_sh_7', type: 'paragraph', content: 'Type "/" anywhere to insert LaTeX formulas, todo checklists, code blocks or relational database views.' },
    ],
  },
  {
    id: 'page_math',
    title: '🧪 Quantum Physics & Applied Mathematics',
    icon: '🧪',
    cover: 'linear-gradient(135deg, #042F2E 0%, #0F766E 50%, #14B8A6 100%)',
    favorite: true,
    updatedAt: '10 mins ago',
    blocks: [
      { id: 'b_m1', type: 'callout', content: 'Equations are rendered using high-precision LaTeX math syntax with zero-latency KaTeX rendering.', icon: '⚛️' },
      { id: 'b_m2', type: 'heading_1', content: 'Fundamental Physical Equations' },
      { id: 'b_m3', type: 'math', content: 'E = m c^2' },
      { id: 'b_m4', type: 'paragraph', content: 'Einstein\'s mass-energy equivalence formula demonstrates that mass and energy are mutually convertible.' },
      { id: 'b_m5', type: 'heading_2', content: 'Schrödinger Wave Equation' },
      { id: 'b_m6', type: 'math', content: 'i \\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)' },
      { id: 'b_m7', type: 'heading_2', content: 'Gaussian Integral' },
      { id: 'b_m8', type: 'math', content: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' },
    ],
  },
  {
    id: 'page_student_db',
    title: '🗂️ Academic Course & Exam Tracker',
    icon: '🗂️',
    cover: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #10B981 100%)',
    favorite: false,
    updatedAt: '30 mins ago',
    isDatabasePage: true,
    blocks: [
      { id: 'b_sdb_desc', type: 'callout', content: 'Track assignments, semester milestones, and exam targets with Formulas 2.0 dynamic progress bars. Switch to Kanban Board or Gallery View below.', icon: '📊' },
      { id: 'b_sdb_embed', type: 'database' },
    ],
  },
];

export const INITIAL_PAGES = [
  {
    id: 'page_roadmap',
    title: '🚀 Engineering & AI Product Roadmap 2026',
    icon: '🚀',
    cover: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #3B82F6 100%)',
    favorite: true,
    updatedAt: 'Just now',
    blocks: [
      { id: 'b_1', type: 'callout', content: 'Welcome to Atelion Workspace! This is a next-gen collaborative knowledge operating system with block-based editing, real-time Turso Edge caching, and Formulas 2.0 databases.', icon: '💡' },
      { id: 'b_2', type: 'heading_1', content: 'Q1 Core Deliverables' },
      { id: 'b_3', type: 'todo', content: 'Deploy Cloudflare Worker AI Proxy (Groq LPU + Gemini Flash-Lite)', checked: true },
      { id: 'b_4', type: 'todo', content: 'Implement Dedicated Turso Edge Database for Circle to Search caching', checked: true },
      { id: 'b_5', type: 'todo', content: 'Launch Notion-style multi-view relational database engine', checked: true },
      { id: 'b_6', type: 'todo', content: 'Zero-knowledge biometric passkey enrollment & E2EE vault', checked: false },
      { id: 'b_7', type: 'heading_2', content: 'Architecture Specifications' },
      { id: 'b_8', type: 'code', content: '// Cloudflare Edge Proxy with Dual Failover\nexport default {\n  async fetch(req, env) {\n    return await callGroqLPU(prompt, env);\n  }\n};', language: 'javascript' },
    ],
  },
  {
    id: 'page_database',
    title: '🗄️ Master Sprint & Project Database',
    icon: '🗄️',
    cover: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)',
    favorite: true,
    updatedAt: '2 mins ago',
    isDatabasePage: true,
    blocks: [
      { id: 'b_db_desc', type: 'callout', content: 'Relational Multi-View Database with Formulas 2.0 dynamic progress calculation. Switch between Table View, Kanban Board, and Gallery View below.', icon: '📊' },
      { id: 'b_db_embed', type: 'database' },
    ],
  },
  {
    id: 'page_math',
    title: '🧪 Quantum Physics & Applied Mathematics',
    icon: '🧪',
    cover: 'linear-gradient(135deg, #042F2E 0%, #0F766E 50%, #14B8A6 100%)',
    favorite: false,
    updatedAt: '1 hour ago',
    blocks: [
      { id: 'b_m1', type: 'callout', content: 'Equations are rendered using high-precision LaTeX math syntax with zero-latency KaTeX rendering.', icon: '⚛️' },
      { id: 'b_m2', type: 'heading_1', content: 'Fundamental Physical Equations' },
      { id: 'b_m3', type: 'math', content: 'E = m c^2' },
      { id: 'b_m4', type: 'paragraph', content: 'Einstein\'s mass-energy equivalence formula demonstrates that mass and energy are mutually convertible.' },
      { id: 'b_m5', type: 'heading_2', content: 'Schrödinger Wave Equation' },
      { id: 'b_m6', type: 'math', content: 'i \\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)' },
      { id: 'b_m7', type: 'heading_2', content: 'Gaussian Integral' },
      { id: 'b_m8', type: 'math', content: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}' },
    ],
  },
  {
    id: 'page_vault',
    title: '🔐 Private End-to-End Encrypted Vault',
    icon: '🔐',
    cover: 'linear-gradient(135deg, #450A0A 0%, #991B1B 50%, #DC2626 100%)',
    favorite: false,
    updatedAt: 'Yesterday',
    blocks: [
      { id: 'b_v1', type: 'callout', content: 'This page is secured with client-side WebCrypto (AES-GCM-256 + PBKDF2 100,000 rounds). The server only ever sees encrypted ciphertext.', icon: '🛡️' },
      { id: 'b_v2', type: 'heading_1', content: 'Confidential Production Seed Keys' },
      { id: 'b_v3', type: 'code', content: 'VAULT_MASTER_PEPPER="d84f93b2a7109c04"\nTURSO_RECOVERY_PHRASE="matrix-edge-shield-orbital-titan"', language: 'bash' },
      { id: 'b_v4', type: 'todo', content: 'Verify automated backup scrubbing interval (5 mins)', checked: true },
      { id: 'b_v5', type: 'todo', content: 'Audit hardware WebAuthn passkey tokens', checked: true },
    ],
  },
];

export const STUDENT_DATABASE_ITEMS = [
  { id: 'st_1', title: 'Calculus III: Multivariable Integration Proofs', status: 'Done', priority: 'P0 Urgent', progress: 100, assignee: 'Student', due: 'Nov 10' },
  { id: 'st_2', title: 'Data Structures: Red-Black Tree Implementation', status: 'In Progress', priority: 'P1 High', progress: 80, assignee: 'Student', due: 'Nov 12' },
  { id: 'st_3', title: 'Organic Chemistry: Reaction Mechanism Notes', status: 'In Progress', priority: 'P1 High', progress: 60, assignee: 'Student', due: 'Nov 15' },
  { id: 'st_4', title: 'Physics Lab: Photoelectric Effect Report', status: 'To Do', priority: 'P2 Normal', progress: 25, assignee: 'Student', due: 'Nov 18' },
];

export const INITIAL_DATABASE_ITEMS = [
  { id: 't_1', title: 'Implement Groq LPU Edge Streaming', status: 'Done', priority: 'P0 Urgent', progress: 100, assignee: 'Alex', due: 'Nov 8' },
  { id: 't_2', title: 'Dedicated Turso DB Circle Search Cache', status: 'Done', priority: 'P0 Urgent', progress: 100, assignee: 'Lead Architect', due: 'Nov 9' },
  { id: 't_3', title: 'Gemini Flash-Lite 503 Auto-Shift Failover', status: 'In Progress', priority: 'P1 High', progress: 85, assignee: 'Elena', due: 'Nov 12' },
  { id: 't_4', title: 'Notion Block Editor Slash Command Menu', status: 'In Progress', priority: 'P1 High', progress: 75, assignee: 'Devin', due: 'Nov 14' },
  { id: 't_5', title: 'Mobile Touch Lasso for Circle to Search', status: 'To Do', priority: 'P2 Normal', progress: 20, assignee: 'Alex', due: 'Nov 18' },
  { id: 't_6', title: 'WebCrypto PBKDF2 Master Key Rotation', status: 'To Do', priority: 'P2 Normal', progress: 10, assignee: 'Security', due: 'Nov 22' },
];

export const workspaceService = {
  getPages(role) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {}

    const seed = role === 'student' ? STUDENT_PAGES : INITIAL_PAGES;
    this.savePages(seed);
    return seed;
  },

  savePages(pages) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    } catch {}
  },

  getDatabaseItems(role) {
    try {
      const data = localStorage.getItem('atelion_db_items');
      if (data) return JSON.parse(data);
    } catch {}

    const seed = role === 'student' ? STUDENT_DATABASE_ITEMS : INITIAL_DATABASE_ITEMS;
    this.saveDatabaseItems(seed);
    return seed;
  },

  saveDatabaseItems(items) {
    try {
      localStorage.setItem('atelion_db_items', JSON.stringify(items));
    } catch {}
  },

  createPage(title = 'Untitled Note', icon = '📄') {
    const pages = this.getPages();
    const newPage = {
      id: 'page_' + Date.now(),
      title,
      icon,
      cover: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
      favorite: false,
      updatedAt: 'Just now',
      blocks: [
        { id: 'b_' + Date.now(), type: 'paragraph', content: 'Type "/" for commands or start writing directly...' }
      ]
    };
    pages.unshift(newPage);
    this.savePages(pages);
    return newPage;
  },

  updatePage(pageId, updates) {
    const pages = this.getPages();
    const idx = pages.findIndex(p => p.id === pageId);
    if (idx !== -1) {
      pages[idx] = { ...pages[idx], ...updates, updatedAt: 'Just now' };
      this.savePages(pages);
      return pages[idx];
    }
    return null;
  },

  deletePage(pageId) {
    const pages = this.getPages().filter(p => p.id !== pageId);
    this.savePages(pages);
    return pages;
  }
};
