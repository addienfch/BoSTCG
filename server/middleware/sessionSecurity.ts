/**
 * Session Security Middleware
 * Implements secure session management and authentication
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface SessionData {
  id: string;
  userId?: string;
  walletAddress?: string;
  createdAt: Date;
  lastAccess: Date;
  ipAddress: string;
  userAgent: string;
}

class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private readonly sessionTimeout = 30 * 60 * 1000; // 30 minutes
  private readonly maxSessions = 1000;

  constructor() {
    // Cleanup expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create new session
   */
  createSession(req: Request): string {
    const sessionId = this.generateSessionId();
    const session: SessionData = {
      id: sessionId,
      createdAt: new Date(),
      lastAccess: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    };

    // Cleanup if too many sessions
    if (this.sessions.size >= this.maxSessions) {
      this.cleanupOldestSessions();
    }

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Validate and refresh session
   */
  validateSession(sessionId: string, req: Request): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const now = new Date();
    const timeSinceLastAccess = now.getTime() - session.lastAccess.getTime();

    // Check if session expired
    if (timeSinceLastAccess > this.sessionTimeout) {
      this.sessions.delete(sessionId);
      return false;
    }

    // Validate IP and User-Agent for additional security
    const currentIp = req.ip || req.connection.remoteAddress || 'unknown';
    const currentUserAgent = req.get('User-Agent') || 'unknown';

    if (session.ipAddress !== currentIp || session.userAgent !== currentUserAgent) {
      // Suspicious activity - invalidate session
      this.sessions.delete(sessionId);
      return false;
    }

    // Update last access time
    session.lastAccess = now;
    return true;
  }

  /**
   * Associate wallet with session
   */
  associateWallet(sessionId: string, walletAddress: string, userId?: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.walletAddress = walletAddress;
    session.userId = userId;
    return true;
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Destroy session
   */
  destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Cleanup expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    this.sessions.forEach((session, sessionId) => {
      const timeSinceLastAccess = now.getTime() - session.lastAccess.getTime();
      if (timeSinceLastAccess > this.sessionTimeout) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach(sessionId => {
      this.sessions.delete(sessionId);
    });

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  /**
   * Cleanup oldest sessions when limit reached
   */
  private cleanupOldestSessions(): void {
    const sessionsArray = Array.from(this.sessions.entries());
    sessionsArray.sort((a, b) => a[1].lastAccess.getTime() - b[1].lastAccess.getTime());
    
    // Remove oldest 10% of sessions
    const toRemove = Math.floor(this.maxSessions * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.sessions.delete(sessionsArray[i][0]);
    }
  }

  /**
   * Get session statistics
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    averageSessionAge: number;
  } {
    const now = new Date();
    let activeSessions = 0;
    let totalAge = 0;

    this.sessions.forEach(session => {
      const timeSinceLastAccess = now.getTime() - session.lastAccess.getTime();
      if (timeSinceLastAccess <= this.sessionTimeout) {
        activeSessions++;
      }
      totalAge += now.getTime() - session.createdAt.getTime();
    });

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      averageSessionAge: this.sessions.size > 0 ? totalAge / this.sessions.size : 0
    };
  }
}

export const sessionManager = new SessionManager();

/**
 * Session authentication middleware
 */
export const sessionAuth = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

  if (!sessionId) {
    // Create new session for first-time visitors
    const newSessionId = sessionManager.createSession(req);
    res.cookie('sessionId', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000 // 30 minutes
    });
    req.sessionId = newSessionId;
  } else {
    // Validate existing session
    if (sessionManager.validateSession(sessionId, req)) {
      req.sessionId = sessionId;
    } else {
      // Invalid session - create new one
      const newSessionId = sessionManager.createSession(req);
      res.cookie('sessionId', newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 60 * 1000
      });
      req.sessionId = newSessionId;
    }
  }

  next();
};

/**
 * Wallet authentication middleware
 */
export const walletAuth = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.sessionId;
  if (!sessionId) {
    res.status(401).json({ error: 'No valid session' });
    return;
  }

  const session = sessionManager.getSession(sessionId);
  if (!session || !session.walletAddress) {
    res.status(401).json({ error: 'Wallet not connected' });
    return;
  }

  req.walletAddress = session.walletAddress;
  req.userId = session.userId;
  next();
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      walletAddress?: string;
      userId?: string;
    }
  }
}