import { Router, Request, Response } from 'express';

const router = Router();
const startTime = Date.now();

router.get('/', (req: Request, res: Response) => {
  const uptime = Date.now() - startTime;
  const uptimeSeconds = Math.floor(uptime / 1000);
  
  res.json({
    status: 'ok',
    uptime: `${uptimeSeconds}s`,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

export { router as healthRoutes };