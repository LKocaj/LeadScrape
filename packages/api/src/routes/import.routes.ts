/**
 * Import routes - handle file uploads and lead imports
 */

import { Router } from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';
import {
  parseFile,
  previewImport,
  executeImport,
  getStoredFile,
} from '../../../../src/import/import.service.js';
import {
  importConfigSchema,
  LEAD_FIELDS,
  KNOWN_COLUMN_MAPPINGS,
} from '../../../../src/import/import.schema.js';
import { Trade, LeadSource } from '../../../../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const importRouter = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/csv',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
});

/**
 * POST /api/import/upload
 * Upload a file and get column detection results
 */
importRouter.post('/upload', upload.single('file'), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
    return;
  }

  try {
    const fileId = nanoid();
    const result = await parseFile(req.file.buffer, req.file.originalname, fileId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to parse file',
    });
  }
});

/**
 * POST /api/import/preview
 * Preview import with column mapping (first N rows)
 */
importRouter.post('/preview', (req, res): void => {
  const { fileId, columnMapping, limit = 10 } = req.body;

  if (!fileId || !columnMapping) {
    res.status(400).json({
      success: false,
      error: 'Missing fileId or columnMapping',
    });
    return;
  }

  try {
    const preview = previewImport(fileId, columnMapping, limit);

    res.json({
      success: true,
      data: {
        rows: preview,
        validCount: preview.filter(r => r.isValid).length,
        invalidCount: preview.filter(r => !r.isValid).length,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to preview import',
    });
  }
});

/**
 * POST /api/import/execute
 * Execute the import with confirmed configuration
 */
importRouter.post('/execute', async (req, res): Promise<void> => {
  const validation = importConfigSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      error: 'Invalid import configuration',
      details: validation.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const result = await executeImport(validation.data);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Import failed',
    });
  }
});

/**
 * GET /api/import/template/:format
 * Download a sample import template
 */
importRouter.get('/template/:format', async (req, res): Promise<void> => {
  const format = req.params.format?.toLowerCase();

  if (format !== 'csv' && format !== 'xlsx') {
    res.status(400).json({
      success: false,
      error: 'Invalid format. Use csv or xlsx.',
    });
    return;
  }

  const headers = [
    'Company Name',
    'Contact Name',
    'Email',
    'Phone',
    'Website',
    'Address',
    'City',
    'State',
    'Zip Code',
    'Trade',
    'Source',
    'Rating',
    'Review Count',
    'Notes',
  ];

  const sampleData = [
    [
      'ABC Plumbing Inc.',
      'John Smith',
      'john@abcplumbing.com',
      '(555) 123-4567',
      'https://abcplumbing.com',
      '123 Main St',
      'Austin',
      'TX',
      '78701',
      'Plumbing',
      'Manual',
      '4.5',
      '120',
      'Great reviews',
    ],
    [
      'XYZ HVAC Services',
      'Jane Doe',
      'jane@xyzhvac.com',
      '555-987-6543',
      'www.xyzhvac.com',
      '456 Oak Ave',
      'Dallas',
      'TX',
      '75201',
      'HVAC',
      'Manual',
      '4.8',
      '85',
      '',
    ],
  ];

  if (format === 'csv') {
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row =>
        row.map(cell => {
          if (cell.includes(',') || cell.includes('"')) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lead-import-template.csv"');
    res.send(csvContent);
  } else {
    // XLSX format
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OnCall Automation Lead Scraper';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Leads Template', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });

    // Add headers
    worksheet.columns = headers.map((header, i) => ({
      header,
      key: `col${i}`,
      width: 20,
    }));

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0A1628' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add sample data
    for (const rowData of sampleData) {
      worksheet.addRow(rowData);
    }

    // Add instructions sheet
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.getCell('A1').value = 'Import Instructions';
    instructionsSheet.getCell('A1').font = { bold: true, size: 14 };

    instructionsSheet.getCell('A3').value = 'Required Fields:';
    instructionsSheet.getCell('A3').font = { bold: true };
    instructionsSheet.getCell('A4').value = '- Company Name (required)';

    instructionsSheet.getCell('A6').value = 'Trade Options:';
    instructionsSheet.getCell('A6').font = { bold: true };
    Object.values(Trade).forEach((trade, i) => {
      instructionsSheet.getCell(`A${7 + i}`).value = `- ${trade}`;
    });

    instructionsSheet.getCell('A14').value = 'Source Options:';
    instructionsSheet.getCell('A14').font = { bold: true };
    Object.values(LeadSource).forEach((source, i) => {
      instructionsSheet.getCell(`A${15 + i}`).value = `- ${source}`;
    });

    instructionsSheet.getColumn('A').width = 30;

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="lead-import-template.xlsx"');
    res.send(Buffer.from(buffer));
  }
});

/**
 * GET /api/import/fields
 * Get available lead fields for mapping
 */
importRouter.get('/fields', (_req, res) => {
  res.json({
    success: true,
    data: {
      fields: LEAD_FIELDS,
      knownMappings: KNOWN_COLUMN_MAPPINGS,
      trades: Object.values(Trade),
      sources: Object.values(LeadSource),
    },
  });
});

/**
 * GET /api/import/status/:fileId
 * Check if a file is still stored and ready for import
 */
importRouter.get('/status/:fileId', (req, res) => {
  const fileData = getStoredFile(req.params.fileId);

  if (!fileData) {
    res.status(404).json({
      success: false,
      error: 'File not found or expired. Please upload again.',
    });
    return;
  }

  res.json({
    success: true,
    data: fileData,
  });
});
