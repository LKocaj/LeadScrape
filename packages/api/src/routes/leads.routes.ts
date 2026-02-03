import { Router } from 'express';
import {
  findLeads,
  getLeadById,
  updateLead,
  deleteLead,
  findPotentialDuplicates,
} from '../../../../src/storage/lead.repository.js';
import type { LeadFilters, LeadStatus, Trade, LeadSource } from '../../../../src/types/index.js';

export const leadsRouter = Router();

// GET /api/leads - List leads with filters
leadsRouter.get('/', (req, res) => {
  const filters: LeadFilters = {};

  if (req.query.status) {
    filters.status = req.query.status as LeadStatus;
  }
  if (req.query.trade) {
    filters.trade = req.query.trade as Trade;
  }
  if (req.query.source) {
    filters.source = req.query.source as LeadSource;
  }
  if (req.query.hasEmail === 'true') {
    filters.hasEmail = true;
  }
  if (req.query.hasPhone === 'true') {
    filters.hasPhone = true;
  }
  if (req.query.hasWebsite === 'true') {
    filters.hasWebsite = true;
  }
  if (req.query.needsEnrichment === 'true') {
    filters.needsEnrichment = true;
  }
  if (req.query.limit) {
    filters.limit = parseInt(req.query.limit as string, 10);
  }
  if (req.query.offset) {
    filters.offset = parseInt(req.query.offset as string, 10);
  }

  const leads = findLeads(filters);

  res.json({
    success: true,
    data: leads,
    meta: {
      total: leads.length,
      limit: filters.limit,
      offset: filters.offset || 0,
    },
  });
});

// GET /api/leads/:id - Get single lead
leadsRouter.get('/:id', (req, res): void => {
  const lead = getLeadById(req.params.id);

  if (!lead) {
    res.status(404).json({
      success: false,
      error: 'Lead not found',
    });
    return;
  }

  res.json({
    success: true,
    data: lead,
  });
});

// PATCH /api/leads/:id - Update lead
leadsRouter.patch('/:id', (req, res): void => {
  const success = updateLead(req.params.id, req.body);

  if (!success) {
    res.status(404).json({
      success: false,
      error: 'Lead not found',
    });
    return;
  }

  const lead = getLeadById(req.params.id);

  res.json({
    success: true,
    data: lead,
  });
});

// DELETE /api/leads/:id - Delete lead
leadsRouter.delete('/:id', (req, res): void => {
  const success = deleteLead(req.params.id);

  if (!success) {
    res.status(404).json({
      success: false,
      error: 'Lead not found',
    });
    return;
  }

  res.json({
    success: true,
    data: null,
  });
});

// GET /api/leads/:id/duplicates - Find potential duplicates
leadsRouter.get('/:id/duplicates', (req, res): void => {
  const lead = getLeadById(req.params.id);

  if (!lead) {
    res.status(404).json({
      success: false,
      error: 'Lead not found',
    });
    return;
  }

  const duplicates = findPotentialDuplicates(lead);

  res.json({
    success: true,
    data: duplicates,
  });
});
