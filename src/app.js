require('dotenv').config();
const express = require('express');
const { requestLogger, logger } = require('./middleware/logger');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// ── Middleware ──────────────────────────────────
app.use(express.json());        // JSON Body parsen
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);         // Alle Requests loggen

// ── Healthcheck Endpoint ────────────────────────
// Zweck: Load Balancer / Monitoring prüft ob der Server läuft
app.get('/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes mit Versionierung ────────────────
// api/v1 → saubere Trennung für zukünftige v2
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/students`, studentRoutes);

// ── 404 Handler ─────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ─────────────────────────
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;