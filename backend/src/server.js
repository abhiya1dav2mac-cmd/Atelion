const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const passkeyRoutes = require('./routes/passkey');
const vaultRoutes = require('./routes/vault');
const helpdeskRoutes = require('./routes/helpdesk');
const syncRoutes = require('./routes/sync');
const aiRoutes = require('./routes/ai');
const securityRoutes = require('./routes/security');
const { initHelpDeskTables } = require('./services/helpdeskTurso');
const selfHealingMesh = require('./services/selfHealingMesh');
const { zeroTrustHelmet, zeroTrustAuditMiddleware } = require('./middleware/zeroTrustHelmet');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/atelion';

// 1. Zero Trust Security Helmet & Request Validation (NIST SP 800-207)
app.use(zeroTrustHelmet);
app.use(zeroTrustAuditMiddleware);

// 2. Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: '*', // Or specify process.env.CLIENT_URL
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files with Edge CDN-friendly caching for immutable assets
const frontendDistPath = path.join(__dirname, '../../frontend');
app.use(
  express.static(frontendDistPath, {
    maxAge: '1y',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        // HTML is always revalidated
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        // Static assets (JS, CSS, images) are cached immutably at the edge
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// Edge CDN Security & Cache-Key Isolation Matrix: All private API endpoints strictly bypass CDN
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, private');
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/passkey', passkeyRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/helpdesk', helpdeskRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/security', securityRoutes);

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Atelion AI Workspace Backend',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Fallback to frontend index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('<h1>Atelion API Server Running</h1><p>Visit /api/health for system status.</p>');
    }
  });
});

// Start HTTP Server immediately if run directly
let server = null;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`[ATELION] 🌐 Server running smoothly on http://localhost:${PORT}`);
  });
}

// Connect to Databases in Background
async function initDatabases() {
  // 1. Initialize Turso Isolated Help Desk
  try {
    await initHelpDeskTables();
  } catch (tErr) {
    console.error('[TURSO-INIT-WARN]', tErr.message);
  }

  // 2. Connect to Primary Database (MongoDB Atlas)
  try {
    console.log('[ATELION] 🚀 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('[ATELION] ✅ MongoDB Connected successfully to database:', mongoose.connection.name);
  } catch (err) {
    console.error('[ATELION] ❌ MongoDB Connection Error:', err.message);
    console.log('[ATELION] ⚠️ Primary DB offline. Running in degraded mode with memory caching.');
  }
  // 3. Start Autonomous Self-Healing Multi-Vault Scrubber
  try {
    selfHealingMesh.startBackgroundScrubber(300000); // 5 min interval
  } catch (sErr) {
    console.warn('[SELF-HEALER-WARN]', sErr.message);
  }
}

initDatabases();

module.exports = app;

