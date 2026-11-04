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
const { initHelpDeskTables } = require('./services/helpdeskTurso');
const selfHealingMesh = require('./services/selfHealingMesh');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/atelion';

// Middleware
app.use(
  cors({
    origin: '*', // Or specify process.env.CLIENT_URL
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files if present
const frontendDistPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendDistPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/passkey', passkeyRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/helpdesk', helpdeskRoutes);
app.use('/api/sync', syncRoutes);

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

// Start HTTP Server immediately for instant responsiveness
const server = app.listen(PORT, () => {
  console.log(`[ATELION] 🌐 Server running smoothly on http://localhost:${PORT}`);
});

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

