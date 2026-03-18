import { Request, Response, NextFunction } from 'express';

interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitData>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Clean up old entries
  for (const [ip, data] of rateLimitMap.entries()) {
    if (data.resetTime < now) {
      rateLimitMap.delete(ip);
    }
  }

  const clientData = rateLimitMap.get(clientIp);
  
  if (!clientData) {
    rateLimitMap.set(clientIp, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    return next();
  }

  if (clientData.resetTime < now) {
    clientData.count = 1;
    clientData.resetTime = now + WINDOW_MS;
    return next();
  }

  clientData.count += 1;

  if (clientData.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
      details: {
        limit: MAX_REQUESTS,
        windowMs: WINDOW_MS,
        resetTime: new Date(clientData.resetTime).toISOString()
      }
    });
  }

  next();
};