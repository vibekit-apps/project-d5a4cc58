import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  req.startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.socket.remoteAddress
    };
    
    console.log(JSON.stringify(logEntry));
  });
  
  next();
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const errorId = req.requestId;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    requestId: errorId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path
  };
  
  console.log(JSON.stringify(logEntry));
  
  if (res.headersSent) {
    return next(err);
  }
  
  const status = err.status || err.statusCode || 500;
  
  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : err.message,
    code: err.code || 'INTERNAL_ERROR',
    details: status === 500 ? { errorId } : err.details
  });
};