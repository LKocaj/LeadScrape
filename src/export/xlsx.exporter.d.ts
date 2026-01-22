/**
 * XLSX export using ExcelJS
 */
import { type LeadFilters } from '../types/index.js';
/**
 * Export leads to XLSX format
 */
export declare function exportToXlsx(outputPath?: string, filters?: LeadFilters): Promise<{
    path: string;
    count: number;
}>;
/**
 * Export to CSV as fallback
 */
export declare function exportToCsv(outputPath?: string, filters?: LeadFilters): Promise<{
    path: string;
    count: number;
}>;
//# sourceMappingURL=xlsx.exporter.d.ts.map