/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and DoS attacks
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const clientId = this.getClientIdentifier(req);
    const now = Date.now();
    
    if (!this.store[clientId]) {
      this.store[clientId] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      next();
      return;
    }

    const clientData = this.store[clientId];
    
    if (now > clientData.resetTime) {
      // Reset the window
      clientData.count = 1;
      clientData.resetTime = now + this.windowMs;
      next();
      return;
    }

    clientData.count++;

    if (clientData.count > this.maxRequests) {
      console.log(`⚠️ Rate limit exceeded for ${clientId}: ${clientData.count} requests`);
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Maximum ${this.maxRequests} requests per minute allowed.`,
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
      return;
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (this.maxRequests - clientData.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000).toString());
    
    next();
  };

  private getClientIdentifier(req: Request): string {
    // Use IP address as primary identifier
    const ip = req.ip || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection as any)?.socket?.remoteAddress ||
               'unknown';
    
    // Include user agent to differentiate clients from same IP
    const userAgent = req.get('User-Agent') || 'unknown';
    
    return `${ip}:${userAgent.substring(0, 50)}`;
  }

  getStats(): { totalClients: number; activeClients: number } {
    const now = Date.now();
    const activeClients = Object.values(this.store).filter(
      data => data.resetTime > now
    ).length;
    
    return {
      totalClients: Object.keys(this.store).length,
      activeClients
    };
  }
}

// Create rate limiter instances for different endpoints
export const generalRateLimit = new RateLimiter(100, 60000);  // 100 requests per minute
export const strictRateLimit = new RateLimiter(30, 60000);   // 30 requests per minute for sensitive endpoints
export const authRateLimit = new RateLimiter(10, 60000);     // 10 requests per minute for auth endpoints

export default RateLimiter;