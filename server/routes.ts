import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generalRateLimit, strictRateLimit, authRateLimit } from "./middleware/rateLimiter";
import { sessionManager } from "./middleware/sessionSecurity";

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware - apply rate limiting to all routes
  app.use('/api', generalRateLimit.middleware);
  
  // Strict rate limiting for sensitive endpoints
  app.use('/api/auth', authRateLimit.middleware);
  app.use('/api/admin', strictRateLimit.middleware);
  app.use('/api/wallet', strictRateLimit.middleware);

  // Input validation and sanitization middleware
  app.use((req, res, next) => {
    // Basic input sanitization
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          // Remove potentially dangerous characters
          req.body[key] = req.body[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
        }
      }
    }
    next();
  });

  // CORS configuration
  app.use((req, res, next) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://*.replit.dev',
      'https://*.replit.app'
    ];
    
    const origin = req.headers.origin;
    if (origin && allowedOrigins.some(allowed => {
      return allowed.includes('*') ? 
        new RegExp(allowed.replace('*', '.*')).test(origin) : 
        allowed === origin;
    })) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // API endpoint examples with validation
  app.get('/api/health', (req, res) => {
    const rateLimitStats = generalRateLimit.getStats();
    const sessionStats = sessionManager.getStats();
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      rateLimitStats,
      sessionStats,
      security: {
        cspEnabled: true,
        sessionManagement: true,
        inputValidation: true,
        rateLimiting: true
      }
    });
  });

  // Session management endpoints
  app.post('/api/session/wallet', (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const sessionId = req.sessionId;
    if (!sessionId) {
      return res.status(401).json({ error: 'No session found' });
    }

    const success = sessionManager.associateWallet(sessionId, walletAddress);
    if (success) {
      res.json({ success: true, message: 'Wallet associated with session' });
    } else {
      res.status(500).json({ error: 'Failed to associate wallet' });
    }
  });

  app.delete('/api/session', (req, res) => {
    const sessionId = req.sessionId;
    if (sessionId) {
      sessionManager.destroySession(sessionId);
      res.clearCookie('sessionId');
    }
    res.json({ success: true, message: 'Session destroyed' });
  });

  app.post('/api/validate-input', (req, res) => {
    const { input } = req.body;
    
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    if (input.length > 1000) {
      return res.status(400).json({ error: 'Input too long' });
    }
    
    // Additional validation can be added here
    res.json({ message: 'Input validated', sanitized: input });
  });

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
