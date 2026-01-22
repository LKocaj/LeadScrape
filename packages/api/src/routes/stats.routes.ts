import { Router } from 'express';
import {
  countLeadsByStatus,
  countLeadsBySource,
  countLeadsByTrade,
  getTotalLeadCount,
} from '../../../../src/storage/lead.repository.js';

export const statsRouter = Router();

// GET /api/stats - Get all statistics
statsRouter.get('/', (_req, res) => {
  const stats = {
    total: getTotalLeadCount(),
    byStatus: countLeadsByStatus(),
    bySource: countLeadsBySource(),
    byTrade: countLeadsByTrade(),
  };

  res.json({
    success: true,
    data: stats,
  });
});

// GET /api/stats/by-status
statsRouter.get('/by-status', (_req, res) => {
  res.json({
    success: true,
    data: countLeadsByStatus(),
  });
});

// GET /api/stats/by-source
statsRouter.get('/by-source', (_req, res) => {
  res.json({
    success: true,
    data: countLeadsBySource(),
  });
});

// GET /api/stats/by-trade
statsRouter.get('/by-trade', (_req, res) => {
  res.json({
    success: true,
    data: countLeadsByTrade(),
  });
});

// GET /api/stats/total
statsRouter.get('/total', (_req, res) => {
  res.json({
    success: true,
    data: getTotalLeadCount(),
  });
});
