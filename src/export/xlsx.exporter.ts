/**
 * XLSX export using ExcelJS
 */

import ExcelJS from 'exceljs';
import { mkdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';
import { formatPhoneDisplay, formatFullAddress } from '../utils/formatters.js';
import { LeadStatus, type Lead, type ExportLead, type LeadFilters } from '../types/index.js';
import { findLeads, updateLead } from '../storage/lead.repository.js';

const logger = createLogger('xlsx-exporter');

/**
 * Export leads to XLSX format
 */
export async function exportToXlsx(
  outputPath?: string,
  filters?: LeadFilters
): Promise<{ path: string; count: number }> {
  // Determine output path
  const finalPath = outputPath ?? getDefaultOutputPath();

  // Ensure directory exists
  const dir = dirname(finalPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  // Get leads to export
  const leads = findLeads(filters);

  if (leads.length === 0) {
    logger.info('No leads to export');
    return { path: finalPath, count: 0 };
  }

  logger.info(`Exporting ${leads.length} leads to ${finalPath}`);

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'OnCall Automation Lead Scraper';
  workbook.created = new Date();

  // Create worksheet
  const worksheet = workbook.addWorksheet('Leads', {
    properties: { tabColor: { argb: '00D4FF' } },
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  // Define columns matching OnCall template
  worksheet.columns = [
    { header: 'Company Name', key: 'companyName', width: 30 },
    { header: 'Contact Name', key: 'contactName', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Website', key: 'website', width: 35 },
    { header: 'Address', key: 'address', width: 40 },
    { header: 'Trade', key: 'trade', width: 15 },
    { header: 'Source', key: 'source', width: 15 },
    { header: 'Notes', key: 'notes', width: 40 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0A1628' }, // Dark blue matching OnCall theme
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 25;

  // Add data rows
  for (const lead of leads) {
    const row = worksheet.addRow(leadToExportRow(lead));
    row.alignment = { vertical: 'middle', wrapText: true };

    // Color code by status
    const statusColor = getStatusColor(lead.status);
    if (statusColor) {
      row.getCell('status').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColor },
      };
    }
  }

  // Add alternating row colors
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        if (!cell.fill || (cell.fill as ExcelJS.FillPattern).pattern !== 'solid') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F5F5' },
          };
        }
      });
    }
  });

  // Add borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    });
  });

  // Add auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: leads.length + 1, column: 10 },
  };

  // Save file
  await workbook.xlsx.writeFile(finalPath);

  // Update leads status to Exported
  for (const lead of leads) {
    if (lead.status !== LeadStatus.EXPORTED) {
      updateLead(lead.id, { status: LeadStatus.EXPORTED });
    }
  }

  logger.info(`Successfully exported ${leads.length} leads to ${finalPath}`);
  return { path: finalPath, count: leads.length };
}

/**
 * Convert Lead to export row format
 */
function leadToExportRow(lead: Lead): ExportLead {
  return {
    'Company Name': lead.companyName,
    'Contact Name': lead.contactName ?? '',
    Email: lead.email ?? '',
    Phone: formatPhoneDisplay(lead.phone),
    Website: lead.website ?? '',
    Address: formatFullAddress({
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zipCode: lead.zipCode,
    }),
    Trade: lead.trade,
    Source: lead.source,
    Notes: lead.notes ?? '',
    Status: lead.status,
  };
}

/**
 * Get color for status cell
 */
function getStatusColor(status: string): string | undefined {
  const colors: Record<string, string> = {
    New: 'FFE3F2FD', // Light blue
    Enriched: 'FFF3E5F5', // Light purple
    Verified: 'FFE8F5E9', // Light green
    Exported: 'FFFFF3E0', // Light orange
    Invalid: 'FFFFEBEE', // Light red
    Duplicate: 'FFECEFF1', // Light gray
  };
  return colors[status];
}

/**
 * Get default output path with timestamp
 */
function getDefaultOutputPath(): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return resolve(config.EXPORT_PATH, `leads-${timestamp}.xlsx`);
}

/**
 * Export to CSV as fallback
 */
export async function exportToCsv(
  outputPath?: string,
  filters?: LeadFilters
): Promise<{ path: string; count: number }> {
  const finalPath = outputPath ?? getDefaultOutputPath().replace('.xlsx', '.csv');

  // Ensure directory exists
  const dir = dirname(finalPath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  // Get leads
  const leads = findLeads(filters);

  if (leads.length === 0) {
    logger.info('No leads to export');
    return { path: finalPath, count: 0 };
  }

  // Build CSV
  const headers = [
    'Company Name',
    'Contact Name',
    'Email',
    'Phone',
    'Website',
    'Address',
    'Trade',
    'Source',
    'Notes',
    'Status',
  ];

  const rows = leads.map((lead) => {
    const exportLead = leadToExportRow(lead);
    return headers
      .map((header) => {
        const value = exportLead[header as keyof ExportLead];
        // Escape quotes and wrap in quotes if contains comma
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');

  // Write file
  const { writeFile } = await import('fs/promises');
  await writeFile(finalPath, csv, 'utf-8');

  logger.info(`Successfully exported ${leads.length} leads to ${finalPath}`);
  return { path: finalPath, count: leads.length };
}
