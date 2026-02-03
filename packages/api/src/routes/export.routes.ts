import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exportToXlsx, exportToCsv, exportToInstantly } from '../../../../src/export/xlsx.exporter.js';
import { findLeads } from '../../../../src/storage/lead.repository.js';
import type { LeadFilters, LeadStatus, Trade, LeadSource } from '../../../../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportRouter = Router();

function parseFilters(query: Record<string, unknown>): LeadFilters {
  const filters: LeadFilters = {};

  if (query.status) {
    filters.status = query.status as LeadStatus;
  }
  if (query.trade) {
    filters.trade = query.trade as Trade;
  }
  if (query.source) {
    filters.source = query.source as LeadSource;
  }
  if (query.hasEmail === 'true') {
    filters.hasEmail = true;
  }
  if (query.hasPhone === 'true') {
    filters.hasPhone = true;
  }

  return filters;
}

// POST /api/export/xlsx - Export to Excel
exportRouter.post('/xlsx', async (req, res): Promise<void> => {
  const filters = parseFilters(req.body.filters || {});
  const leads = findLeads(filters);

  if (leads.length === 0) {
    res.status(400).json({
      success: false,
      error: 'No leads match the specified filters',
    });
    return;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `leads-export-${timestamp}.xlsx`;
  const exportPath = path.join(__dirname, '../../../../../data/exports', filename);

  await exportToXlsx(exportPath, filters);

  res.json({
    success: true,
    data: {
      filename,
      count: leads.length,
      downloadUrl: `/api/export/download/${filename}`,
    },
  });
});

// POST /api/export/csv - Export to CSV
exportRouter.post('/csv', async (req, res): Promise<void> => {
  const filters = parseFilters(req.body.filters || {});
  const leads = findLeads(filters);

  if (leads.length === 0) {
    res.status(400).json({
      success: false,
      error: 'No leads match the specified filters',
    });
    return;
  }

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `leads-export-${timestamp}.csv`;
  const exportPath = path.join(__dirname, '../../../../../data/exports', filename);

  await exportToCsv(exportPath, filters);

  res.json({
    success: true,
    data: {
      filename,
      count: leads.length,
      downloadUrl: `/api/export/download/${filename}`,
    },
  });
});

// POST /api/export/instantly - Export to Instantly-compatible CSV
exportRouter.post('/instantly', async (req, res): Promise<void> => {
  const filters = parseFilters(req.body.filters || {});

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `leads-instantly-${timestamp}.csv`;
  const exportPath = path.join(__dirname, '../../../../../data/exports', filename);

  const result = await exportToInstantly(exportPath, filters);

  if (result.count === 0) {
    res.status(400).json({
      success: false,
      error: 'No leads with email addresses match the specified filters',
      skipped: result.skipped,
    });
    return;
  }

  res.json({
    success: true,
    data: {
      filename,
      count: result.count,
      skipped: result.skipped,
      downloadUrl: `/api/export/download/${filename}`,
    },
  });
});

// GET /api/export/download/:filename - Download export file
exportRouter.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../../../../data/exports', filename);

  res.download(filePath, filename, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }
  });
});

// GET /api/export/preview - Preview export count
exportRouter.get('/preview', (req, res) => {
  const filters = parseFilters(req.query as Record<string, unknown>);
  const leads = findLeads(filters);

  res.json({
    success: true,
    data: {
      count: leads.length,
    },
  });
});
