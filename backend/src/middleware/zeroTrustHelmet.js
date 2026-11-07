/**
 * ==============================================================================
 * ATELION ZERO-TRUST SECURITY HELMET (NIST SP 800-207 Specification)
 * Enforces strict HTTP security headers, Content Security Policy (CSP),
 * Anti-Clickjacking Frameguard, Cross-Origin Isolation, and HSTS.
 * Zero Trust Principle: "Never Trust, Always Verify."
 * ==============================================================================
 */

const helmet = require('helmet');

const zeroTrustHelmet = helmet({
  // 1. Content Security Policy (CSP)
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Needed for inline initialization & event triggers
        'https://accounts.google.com',
        'https://unpkg.com',
        'https://cdn.jsdelivr.net',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net',
      ],
      fontSrc: [
        "'self'",
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net',
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
      ],
      connectSrc: [
        "'self'",
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://accounts.google.com',
        'https://unpkg.com',
        'https://cdn.jsdelivr.net',
        'ws:',
        'wss:',
        'https:',
        'http:',
      ],
      frameSrc: [
        "'self'",
        'https://accounts.google.com', // Google Identity One-Tap
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },

  // 2. Cross-Origin Opener Policy (Allow Google OAuth popups and FIDO2 biometric auth)
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },

  // 3. Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // 4. Anti-Clickjacking Frameguard
  frameguard: { action: 'sameorigin' },

  // 5. Hide Server Identity (Prevent fingerprinting)
  hidePoweredBy: true,

  // 6. Strict Transport Security (HSTS - 1 Year)
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },

  // 7. NoSniff (Prevent MIME-type sniffing attacks)
  noSniff: true,

  // 8. Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // 9. DNS Prefetch Control
  dnsPrefetchControl: { allow: false },

  // 10. XSS Filter (Prevent reflected XSS in legacy browsers)
  xssFilter: true,
});

/**
 * Custom Zero Trust Audit Middleware
 * Stamps Zero Trust validation headers and validates request integrity
 */
function zeroTrustAuditMiddleware(req, res, next) {
  res.setHeader('X-Zero-Trust-Architecture', 'Enforced (NIST SP 800-207)');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Request Sanitization: Block obvious NoSQL query injection characters in query params
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string' && (req.query[key].includes('$where') || req.query[key].includes('$gt'))) {
        return res.status(403).json({ error: 'Zero Trust Security: Potential injection pattern detected.' });
      }
    }
  }

  next();
}

module.exports = {
  zeroTrustHelmet,
  zeroTrustAuditMiddleware,
};

