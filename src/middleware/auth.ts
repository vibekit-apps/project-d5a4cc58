import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      code: 'CONFIG_ERROR',
      details: 'API key not configured'
    });
  }

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      code: 'MISSING_API_KEY',
      details: 'Include X-API-Key header with your request'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }

  next();
};