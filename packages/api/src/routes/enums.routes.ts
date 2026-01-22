import { Router } from 'express';
import { Trade, LeadSource, LeadStatus } from '../../../../src/types/index.js';

export const enumsRouter = Router();

// GET /api/enums/trades
enumsRouter.get('/trades', (_req, res) => {
  res.json({
    success: true,
    data: Object.values(Trade),
  });
});

// GET /api/enums/sources
enumsRouter.get('/sources', (_req, res) => {
  res.json({
    success: true,
    data: Object.values(LeadSource),
  });
});

// GET /api/enums/statuses
enumsRouter.get('/statuses', (_req, res) => {
  res.json({
    success: true,
    data: Object.values(LeadStatus),
  });
});

// GET /api/enums - Get all enums
enumsRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      trades: Object.values(Trade),
      sources: Object.values(LeadSource),
      statuses: Object.values(LeadStatus),
    },
  });
});
