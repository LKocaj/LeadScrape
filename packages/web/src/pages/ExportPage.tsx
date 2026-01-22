import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import type { LeadFilters, LeadStatus, Trade, LeadSource, ExportResult } from '../types';

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Enriched', label: 'Enriched' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Exported', label: 'Exported' },
];

const tradeOptions = [
  { value: 'HVAC', label: 'HVAC' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Roofing', label: 'Roofing' },
  { value: 'General Contractor', label: 'General Contractor' },
];

const sourceOptions = [
  { value: 'Google Maps', label: 'Google Maps' },
  { value: 'Yelp', label: 'Yelp' },
  { value: 'HomeAdvisor', label: 'HomeAdvisor' },
  { value: 'Angi', label: 'Angi' },
  { value: 'Thumbtack', label: 'Thumbtack' },
  { value: 'BBB', label: 'BBB' },
];

export function ExportPage() {
  const [filters, setFilters] = useState<LeadFilters>({});
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPreview() {
      try {
        const res = await api.getExportPreview(filters);
        setPreviewCount(res.data.count);
      } catch {
        setPreviewCount(null);
      }
    }
    fetchPreview();
  }, [filters]);

  const handleFilterChange = (key: keyof LeadFilters, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setResult(null);
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setResult(null);

    try {
      const res = format === 'xlsx' ? await api.exportXlsx(filters) : await api.exportCsv(filters);
      setResult(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Filter Leads</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={(filters.status as string) || ''}
            onChange={(v) => handleFilterChange('status', v as LeadStatus)}
            placeholder="All statuses"
          />
          <Select
            label="Trade"
            options={tradeOptions}
            value={(filters.trade as string) || ''}
            onChange={(v) => handleFilterChange('trade', v as Trade)}
            placeholder="All trades"
          />
          <Select
            label="Source"
            options={sourceOptions}
            value={(filters.source as string) || ''}
            onChange={(v) => handleFilterChange('source', v as LeadSource)}
            placeholder="All sources"
          />
          <div className="flex items-end gap-4">
            <Checkbox
              label="Has Email"
              checked={filters.hasEmail || false}
              onChange={(v) => handleFilterChange('hasEmail', v)}
            />
            <Checkbox
              label="Has Phone"
              checked={filters.hasPhone || false}
              onChange={(v) => handleFilterChange('hasPhone', v)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Export Format</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setFormat('xlsx')}
            className={`flex items-center gap-3 p-4 border-2 transition-colors ${
              format === 'xlsx'
                ? 'border-navy-900 bg-navy-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileSpreadsheet size={24} className={format === 'xlsx' ? 'text-navy-900' : 'text-gray-500'} />
            <div className="text-left">
              <p className={`font-medium ${format === 'xlsx' ? 'text-navy-900' : 'text-gray-700'}`}>
                Excel (.xlsx)
              </p>
              <p className="text-sm text-gray-500">Best for editing and filtering</p>
            </div>
          </button>
          <button
            onClick={() => setFormat('csv')}
            className={`flex items-center gap-3 p-4 border-2 transition-colors ${
              format === 'csv'
                ? 'border-navy-900 bg-navy-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <FileText size={24} className={format === 'csv' ? 'text-navy-900' : 'text-gray-500'} />
            <div className="text-left">
              <p className={`font-medium ${format === 'csv' ? 'text-navy-900' : 'text-gray-700'}`}>
                CSV (.csv)
              </p>
              <p className="text-sm text-gray-500">Universal format</p>
            </div>
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-navy-900">Ready to Export</h3>
            {previewCount !== null && (
              <p className="text-navy-600 mt-1">
                {previewCount} leads match your filters
              </p>
            )}
          </div>
          <Button onClick={handleExport} disabled={exporting || previewCount === 0} size="lg">
            {exporting ? (
              <>
                <Spinner size="sm" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={20} />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {result && (
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-700">Export Complete</p>
              <p className="text-green-600 mt-1">
                {result.count} leads exported to {result.filename}
              </p>
            </div>
            <a
              href={result.downloadUrl}
              download
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Download size={20} />
              Download
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
