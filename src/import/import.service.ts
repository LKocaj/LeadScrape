/**
 * Import service - handles CSV/XLSX file parsing and lead creation
 */

import ExcelJS from 'exceljs';
import { createLogger } from '../utils/logger.js';
import { createLead, findPotentialDuplicates, updateLead } from '../storage/lead.repository.js';
import { importRowSchema, KNOWN_COLUMN_MAPPINGS, type ImportConfig, type ImportRow, type ColumnMapping } from './import.schema.js';
import type { RawLead, Lead, Trade, LeadSource } from '../types/index.js';

const logger = createLogger('import-service');

/**
 * Result of parsing a file
 */
export interface ParseResult {
  fileId: string;
  filename: string;
  rowCount: number;
  columns: string[];
  suggestedMapping: ColumnMapping;
  sampleRows: Record<string, string>[];
}

/**
 * Result of validating a single row
 */
export interface RowValidation {
  rowNumber: number;
  isValid: boolean;
  data?: ImportRow;
  errors?: Record<string, string[]>;
}

/**
 * Result of importing a single row
 */
export interface ImportRowResult {
  rowNumber: number;
  status: 'created' | 'skipped' | 'merged' | 'replaced' | 'error';
  leadId?: string;
  errors?: string[];
  duplicateOf?: string;
}

/**
 * Overall import result
 */
export interface ImportResult {
  totalRows: number;
  created: number;
  skipped: number;
  merged: number;
  replaced: number;
  errors: number;
  rows: ImportRowResult[];
}

// In-memory storage for uploaded files (in production, use disk or cloud storage)
const uploadedFiles = new Map<string, { rows: Record<string, string>[]; columns: string[] }>();

/**
 * Parse an uploaded file and return metadata
 */
export async function parseFile(
  buffer: Buffer,
  filename: string,
  fileId: string
): Promise<ParseResult> {
  const extension = filename.toLowerCase().split('.').pop();

  let rows: Record<string, string>[];
  let columns: string[];

  if (extension === 'csv') {
    const result = await parseCsv(buffer);
    rows = result.rows;
    columns = result.columns;
  } else if (extension === 'xlsx' || extension === 'xls') {
    const result = await parseXlsx(buffer);
    rows = result.rows;
    columns = result.columns;
  } else {
    throw new Error(`Unsupported file format: ${extension}`);
  }

  // Store for later use
  uploadedFiles.set(fileId, { rows, columns });

  // Auto-detect column mapping
  const suggestedMapping = suggestColumnMapping(columns);

  // Get sample rows (first 5)
  const sampleRows = rows.slice(0, 5);

  logger.info(`Parsed file ${filename}: ${rows.length} rows, ${columns.length} columns`);

  return {
    fileId,
    filename,
    rowCount: rows.length,
    columns,
    suggestedMapping,
    sampleRows,
  };
}

/**
 * Parse CSV buffer
 */
async function parseCsv(buffer: Buffer): Promise<{ rows: Record<string, string>[]; columns: string[] }> {
  const content = buffer.toString('utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim());

  logger.debug(`CSV has ${lines.length} non-empty lines`);

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header row
  const columns = parseCSVLine(lines[0] ?? '');
  logger.debug(`CSV columns: ${JSON.stringify(columns)}`);

  // Parse data rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i] ?? '');
    const row: Record<string, string> = {};
    let hasData = false;
    for (let j = 0; j < columns.length; j++) {
      const value = values[j] ?? '';
      row[columns[j] ?? `column_${j}`] = value;
      if (value) hasData = true;
    }
    // Only add rows with actual data
    if (hasData) {
      rows.push(row);
    }
  }

  logger.debug(`Parsed ${rows.length} CSV data rows`);
  if (rows.length > 0) {
    logger.debug(`First row sample: ${JSON.stringify(rows[0])}`);
  }

  return { rows, columns };
}

/**
 * Parse a single CSV line handling quotes
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parse XLSX buffer using ExcelJS
 */
async function parseXlsx(buffer: Buffer): Promise<{ rows: Record<string, string>[]; columns: string[] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  logger.debug(`Workbook has ${workbook.worksheets.length} worksheets`);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('No worksheets found in Excel file');
  }

  logger.debug(`Reading worksheet: "${worksheet.name}", rowCount: ${worksheet.rowCount}, columnCount: ${worksheet.columnCount}`);

  const columns: string[] = [];
  const rows: Record<string, string>[] = [];

  // Get header row - use actualColumnCount to determine extent
  const headerRow = worksheet.getRow(1);
  const columnCount = worksheet.columnCount || 20; // fallback to 20 columns

  for (let colNumber = 1; colNumber <= columnCount; colNumber++) {
    const cell = headerRow.getCell(colNumber);
    const value = cell.text?.toString().trim();
    if (value) {
      columns[colNumber - 1] = value;
    } else if (colNumber <= columns.length || columns.some((_, i) => i >= colNumber)) {
      columns[colNumber - 1] = `column_${colNumber}`;
    }
  }

  // Remove trailing empty columns
  while (columns.length > 0 && !columns[columns.length - 1]) {
    columns.pop();
  }

  logger.debug(`Detected columns: ${JSON.stringify(columns)}`);

  // Get data rows
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const rowData: Record<string, string> = {};
    let hasData = false;

    for (let colNumber = 1; colNumber <= columns.length; colNumber++) {
      const cell = row.getCell(colNumber);
      const columnName = columns[colNumber - 1] ?? `column_${colNumber}`;
      const value = cell.text?.toString().trim() ?? '';
      rowData[columnName] = value;
      if (value) hasData = true;
    }

    // Only add rows that have at least some data
    if (hasData) {
      rows.push(rowData);
    }
  });

  logger.debug(`Parsed ${rows.length} data rows`);
  if (rows.length > 0) {
    logger.debug(`First row sample: ${JSON.stringify(rows[0])}`);
  }

  return { rows, columns };
}

/**
 * Suggest column mapping based on header names
 */
function suggestColumnMapping(columns: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};

  for (const column of columns) {
    const normalizedColumn = column.toLowerCase().trim();
    const mappedField = KNOWN_COLUMN_MAPPINGS[normalizedColumn];
    if (mappedField) {
      mapping[column] = mappedField;
    }
  }

  return mapping;
}

/**
 * Preview import with validation
 */
export function previewImport(
  fileId: string,
  columnMapping: ColumnMapping,
  limit: number = 10
): RowValidation[] {
  const fileData = uploadedFiles.get(fileId);
  if (!fileData) {
    throw new Error('File not found. Please upload again.');
  }

  const { rows } = fileData;
  const previewRows = rows.slice(0, limit);

  return previewRows.map((row, index) => {
    const mappedRow = mapRowToLead(row, columnMapping);
    const result = importRowSchema.safeParse(mappedRow);

    if (result.success) {
      return {
        rowNumber: index + 2, // +1 for header, +1 for 1-indexed
        isValid: true,
        data: result.data,
      };
    }

    return {
      rowNumber: index + 2,
      isValid: false,
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  });
}

/**
 * Map a raw file row to lead fields using column mapping
 */
function mapRowToLead(
  row: Record<string, string>,
  columnMapping: ColumnMapping
): Record<string, string | undefined> {
  const mapped: Record<string, string | undefined> = {};

  for (const [fileColumn, leadField] of Object.entries(columnMapping)) {
    const value = row[fileColumn];
    if (value !== undefined && value !== '') {
      mapped[leadField] = value;
    }
  }

  return mapped;
}

/**
 * Execute the full import
 */
export async function executeImport(config: ImportConfig): Promise<ImportResult> {
  const fileData = uploadedFiles.get(config.fileId);
  if (!fileData) {
    throw new Error('File not found. Please upload again.');
  }

  const { rows } = fileData;
  const results: ImportRowResult[] = [];
  let created = 0;
  let skipped = 0;
  let merged = 0;
  let replaced = 0;
  let errors = 0;

  logger.info(`Starting import of ${rows.length} rows with duplicate handling: ${config.duplicateHandling}`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const rowNumber = i + 2; // +1 for header, +1 for 1-indexed
    const mappedRow = mapRowToLead(row, config.columnMapping);

    // Apply defaults
    if (config.defaultTrade && !mappedRow.trade) {
      mappedRow.trade = config.defaultTrade;
    }
    if (config.defaultSource && !mappedRow.source) {
      mappedRow.source = config.defaultSource;
    }

    // Validate
    const validation = importRowSchema.safeParse(mappedRow);

    if (!validation.success) {
      results.push({
        rowNumber,
        status: 'error',
        errors: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      });
      errors++;
      continue;
    }

    const importedData = validation.data;

    // Convert to RawLead
    const rawLead: RawLead = {
      companyName: importedData.companyName,
      contactName: importedData.contactName,
      email: importedData.email,
      phone: importedData.phone,
      website: importedData.website,
      address: importedData.address,
      city: importedData.city,
      state: importedData.state,
      zipCode: importedData.zipCode,
      trade: importedData.trade as Trade,
      source: importedData.source as LeadSource,
      sourceUrl: importedData.sourceUrl,
      sourceId: importedData.sourceId,
      rating: importedData.rating,
      reviewCount: importedData.reviewCount,
      scrapedAt: new Date(),
    };

    // Check for duplicates
    const duplicates = findPotentialDuplicates(rawLead);

    if (duplicates.length > 0) {
      const existingLead = duplicates[0]!;

      switch (config.duplicateHandling) {
        case 'skip':
          results.push({
            rowNumber,
            status: 'skipped',
            duplicateOf: existingLead.id,
          });
          skipped++;
          break;

        case 'merge':
          // Merge: only update fields that are empty in existing lead
          const mergeUpdates = getMergeUpdates(existingLead, rawLead);
          if (Object.keys(mergeUpdates).length > 0) {
            updateLead(existingLead.id, mergeUpdates);
            results.push({
              rowNumber,
              status: 'merged',
              leadId: existingLead.id,
            });
            merged++;
          } else {
            results.push({
              rowNumber,
              status: 'skipped',
              duplicateOf: existingLead.id,
            });
            skipped++;
          }
          break;

        case 'replace':
          // Replace: overwrite all fields
          const replaceUpdates = getReplaceUpdates(rawLead);
          updateLead(existingLead.id, replaceUpdates);
          results.push({
            rowNumber,
            status: 'replaced',
            leadId: existingLead.id,
          });
          replaced++;
          break;
      }
    } else {
      // No duplicate - create new lead
      try {
        const lead = await createLead(rawLead);
        results.push({
          rowNumber,
          status: 'created',
          leadId: lead.id,
        });
        created++;
      } catch (err) {
        results.push({
          rowNumber,
          status: 'error',
          errors: [err instanceof Error ? err.message : 'Unknown error'],
        });
        errors++;
      }
    }
  }

  // Clean up stored file
  uploadedFiles.delete(config.fileId);

  logger.info(`Import complete: ${created} created, ${merged} merged, ${replaced} replaced, ${skipped} skipped, ${errors} errors`);

  return {
    totalRows: rows.length,
    created,
    skipped,
    merged,
    replaced,
    errors,
    rows: results,
  };
}

/**
 * Get updates for merge mode (only fill empty fields)
 */
function getMergeUpdates(existing: Lead, incoming: RawLead): Partial<Lead> {
  const updates: Partial<Lead> = {};

  if (!existing.contactName && incoming.contactName) {
    updates.contactName = incoming.contactName;
  }
  if (!existing.email && incoming.email) {
    updates.email = incoming.email;
  }
  if (!existing.phone && incoming.phone) {
    updates.phone = incoming.phone;
  }
  if (!existing.website && incoming.website) {
    updates.website = incoming.website;
  }
  if (!existing.address && incoming.address) {
    updates.address = incoming.address;
  }
  if (!existing.city && incoming.city) {
    updates.city = incoming.city;
  }
  if (!existing.state && incoming.state) {
    updates.state = incoming.state;
  }
  if (!existing.zipCode && incoming.zipCode) {
    updates.zipCode = incoming.zipCode;
  }
  if (!existing.rating && incoming.rating) {
    updates.rating = incoming.rating;
  }
  if (!existing.reviewCount && incoming.reviewCount) {
    updates.reviewCount = incoming.reviewCount;
  }

  return updates;
}

/**
 * Get updates for replace mode (overwrite all fields)
 */
function getReplaceUpdates(incoming: RawLead): Partial<Lead> {
  return {
    companyName: incoming.companyName,
    contactName: incoming.contactName,
    email: incoming.email,
    phone: incoming.phone,
    website: incoming.website,
    address: incoming.address,
    city: incoming.city,
    state: incoming.state,
    zipCode: incoming.zipCode,
    trade: incoming.trade,
    source: incoming.source,
    sourceUrl: incoming.sourceUrl,
    sourceId: incoming.sourceId,
    rating: incoming.rating,
    reviewCount: incoming.reviewCount,
  };
}

/**
 * Get stored file data (for checking if file exists)
 */
export function getStoredFile(fileId: string): { rowCount: number; columns: string[] } | null {
  const fileData = uploadedFiles.get(fileId);
  if (!fileData) return null;
  return {
    rowCount: fileData.rows.length,
    columns: fileData.columns,
  };
}

/**
 * Clean up old stored files (call periodically)
 */
export function cleanupStoredFiles(): void {
  // In production, implement TTL-based cleanup
  // For now, just log
  logger.debug(`Stored files count: ${uploadedFiles.size}`);
}
