import { useState, useCallback } from 'react';
import { Upload, ArrowRight, ArrowLeft, Check, AlertCircle, FileText, FileSpreadsheet } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import type {
  ImportUploadResult,
  ImportPreviewResult,
  ImportConfig,
  ImportResult,
  Trade,
  LeadSource,
} from '../types';

type Step = 'upload' | 'mapping' | 'options' | 'preview' | 'results';

const tradeOptions = [
  { value: '', label: 'Select default...' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Roofing', label: 'Roofing' },
  { value: 'General Contractor', label: 'General Contractor' },
  { value: 'Unknown', label: 'Unknown' },
];

const sourceOptions = [
  { value: '', label: 'Select default...' },
  { value: 'Manual', label: 'Manual' },
  { value: 'Google Maps', label: 'Google Maps' },
  { value: 'Yelp', label: 'Yelp' },
  { value: 'HomeAdvisor', label: 'HomeAdvisor' },
  { value: 'Angi', label: 'Angi' },
  { value: 'Thumbtack', label: 'Thumbtack' },
  { value: 'BBB', label: 'BBB' },
];

const leadFields = [
  { key: '', label: 'Ignore this column' },
  { key: 'companyName', label: 'Company Name *' },
  { key: 'contactName', label: 'Contact Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'website', label: 'Website' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zipCode', label: 'Zip Code' },
  { key: 'trade', label: 'Trade' },
  { key: 'source', label: 'Source' },
  { key: 'rating', label: 'Rating' },
  { key: 'reviewCount', label: 'Review Count' },
  { key: 'notes', label: 'Notes' },
];

export function ImportPage() {
  const [step, setStep] = useState<Step>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImportUploadResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'merge' | 'replace'>('skip');
  const [defaultTrade, setDefaultTrade] = useState<Trade | ''>('');
  const [defaultSource, setDefaultSource] = useState<LeadSource | ''>('Manual');
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const res = await api.uploadImportFile(file);
      setUploadResult(res.data);
      setColumnMapping(res.data.suggestedMapping);
      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleMappingChange = (fileColumn: string, leadField: string) => {
    setColumnMapping(prev => {
      const newMapping = { ...prev };
      if (leadField === '') {
        delete newMapping[fileColumn];
      } else {
        newMapping[fileColumn] = leadField;
      }
      return newMapping;
    });
  };

  const handlePreview = async () => {
    if (!uploadResult) return;

    setPreviewLoading(true);
    setError(null);

    try {
      const res = await api.previewImport(uploadResult.fileId, columnMapping, 10);
      setPreviewResult(res.data);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImport = async () => {
    if (!uploadResult) return;

    setImporting(true);
    setError(null);

    try {
      const config: ImportConfig = {
        fileId: uploadResult.fileId,
        columnMapping,
        duplicateHandling,
        defaultTrade: defaultTrade || undefined,
        defaultSource: defaultSource || 'Manual',
      };

      const res = await api.executeImport(config);
      setImportResult(res.data);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setStep('upload');
    setUploadResult(null);
    setColumnMapping({});
    setDuplicateHandling('skip');
    setDefaultTrade('');
    setDefaultSource('Manual');
    setPreviewResult(null);
    setImportResult(null);
    setError(null);
  };

  const hasCompanyNameMapping = Object.values(columnMapping).includes('companyName');

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {(['upload', 'mapping', 'options', 'preview', 'results'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center text-sm font-medium ${
                step === s
                  ? 'bg-navy-900 text-white'
                  : ['upload', 'mapping', 'options', 'preview', 'results'].indexOf(step) > i
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {['upload', 'mapping', 'options', 'preview', 'results'].indexOf(step) > i ? (
                <Check size={16} />
              ) : (
                i + 1
              )}
            </div>
            {i < 4 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Upload File</h3>

          {/* Download Templates */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Need a template? Download one:</p>
            <div className="flex gap-3">
              <a
                href={api.getImportTemplateUrl('csv')}
                download
                className="inline-flex items-center gap-2 text-sm text-navy-700 hover:text-navy-900"
              >
                <FileText size={18} />
                CSV Template
              </a>
              <a
                href={api.getImportTemplateUrl('xlsx')}
                download
                className="inline-flex items-center gap-2 text-sm text-navy-700 hover:text-navy-900"
              >
                <FileSpreadsheet size={18} />
                Excel Template
              </a>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed p-12 text-center transition-colors ${
              dragOver
                ? 'border-navy-500 bg-navy-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-navy-600">Processing file...</p>
              </div>
            ) : (
              <>
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg text-gray-700 mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to select a file
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 font-medium border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white bg-transparent cursor-pointer transition-colors"
                >
                  Select File
                </label>
                <p className="text-xs text-gray-400 mt-4">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'mapping' && uploadResult && (
        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">Map Columns</h3>
          <p className="text-sm text-gray-600 mb-4">
            Match your file columns to lead fields. Fields with * are required.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700">File Column</th>
                  <th className="text-left p-3 font-medium text-gray-700">Sample Data</th>
                  <th className="text-left p-3 font-medium text-gray-700">Maps To</th>
                </tr>
              </thead>
              <tbody>
                {uploadResult.columns.map(column => (
                  <tr key={column} className="border-t border-gray-200">
                    <td className="p-3 font-medium text-navy-900">{column}</td>
                    <td className="p-3 text-sm text-gray-500 max-w-xs truncate">
                      {uploadResult.sampleRows[0]?.[column] || '-'}
                    </td>
                    <td className="p-3">
                      <select
                        value={columnMapping[column] || ''}
                        onChange={e => handleMappingChange(column, e.target.value)}
                        className="w-full p-2 border border-gray-300 bg-white text-sm focus:border-navy-500 focus:ring-1 focus:ring-navy-500"
                      >
                        {leadFields.map(field => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!hasCompanyNameMapping && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-600" />
              <span className="text-amber-700">Company Name mapping is required</span>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('upload')}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button onClick={() => setStep('options')} disabled={!hasCompanyNameMapping}>
              Next
              <ArrowRight size={18} />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Options */}
      {step === 'options' && (
        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-4">Import Options</h3>

          <div className="space-y-6">
            {/* Duplicate Handling */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Duplicate Handling
              </label>
              <div className="space-y-2">
                {[
                  { value: 'skip', label: 'Skip duplicates', desc: 'Do not import if a matching lead already exists' },
                  { value: 'merge', label: 'Merge data', desc: 'Fill in empty fields on existing leads with imported data' },
                  { value: 'replace', label: 'Replace existing', desc: 'Overwrite existing lead data with imported data' },
                ].map(option => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                      duplicateHandling === option.value
                        ? 'border-navy-500 bg-navy-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="duplicateHandling"
                      value={option.value}
                      checked={duplicateHandling === option.value}
                      onChange={e => setDuplicateHandling(e.target.value as typeof duplicateHandling)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Default Values */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Default Trade (for rows without trade)"
                options={tradeOptions}
                value={defaultTrade}
                onChange={v => setDefaultTrade(v as Trade)}
              />
              <Select
                label="Default Source"
                options={sourceOptions}
                value={defaultSource}
                onChange={v => setDefaultSource(v as LeadSource)}
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('mapping')}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button onClick={handlePreview} disabled={previewLoading}>
              {previewLoading ? (
                <>
                  <Spinner size="sm" />
                  Loading Preview...
                </>
              ) : (
                <>
                  Preview Import
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Preview */}
      {step === 'preview' && previewResult && uploadResult && (
        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">Preview Import</h3>
          <p className="text-sm text-gray-600 mb-4">
            Showing first {previewResult.rows.length} of {uploadResult.rowCount} rows
          </p>

          {/* Summary */}
          <div className="flex gap-4 mb-4">
            <div className="px-4 py-2 bg-green-50 border border-green-200">
              <span className="font-medium text-green-700">{previewResult.validCount}</span>
              <span className="text-green-600 ml-2">valid</span>
            </div>
            <div className="px-4 py-2 bg-red-50 border border-red-200">
              <span className="font-medium text-red-700">{previewResult.invalidCount}</span>
              <span className="text-red-600 ml-2">invalid</span>
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium text-gray-700">Row</th>
                  <th className="text-left p-2 font-medium text-gray-700">Status</th>
                  <th className="text-left p-2 font-medium text-gray-700">Company</th>
                  <th className="text-left p-2 font-medium text-gray-700">Email</th>
                  <th className="text-left p-2 font-medium text-gray-700">Phone</th>
                  <th className="text-left p-2 font-medium text-gray-700">Issues</th>
                </tr>
              </thead>
              <tbody>
                {previewResult.rows.map(row => (
                  <tr
                    key={row.rowNumber}
                    className={`border-t ${row.isValid ? '' : 'bg-red-50'}`}
                  >
                    <td className="p-2 text-gray-500">{row.rowNumber}</td>
                    <td className="p-2">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <Check size={14} /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <AlertCircle size={14} /> Invalid
                        </span>
                      )}
                    </td>
                    <td className="p-2 font-medium">
                      {row.data?.companyName as string || '-'}
                    </td>
                    <td className="p-2">{row.data?.email as string || '-'}</td>
                    <td className="p-2">{row.data?.phone as string || '-'}</td>
                    <td className="p-2 text-red-600 text-xs">
                      {row.errors &&
                        Object.entries(row.errors)
                          .map(([field, errs]) => `${field}: ${(errs as string[]).join(', ')}`)
                          .join('; ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep('options')}>
              <ArrowLeft size={18} />
              Back
            </Button>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? (
                <>
                  <Spinner size="sm" />
                  Importing...
                </>
              ) : (
                <>
                  Import {uploadResult.rowCount} Rows
                  <Check size={18} />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5: Results */}
      {step === 'results' && importResult && (
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 mx-auto flex items-center justify-center mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-navy-900 mb-2">Import Complete</h3>
            <p className="text-gray-600 mb-6">
              Processed {importResult.totalRows} rows
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="p-4 bg-green-50 border border-green-200">
                <p className="text-2xl font-bold text-green-700">{importResult.created}</p>
                <p className="text-sm text-green-600">Created</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">{importResult.merged}</p>
                <p className="text-sm text-blue-600">Merged</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200">
                <p className="text-2xl font-bold text-purple-700">{importResult.replaced}</p>
                <p className="text-sm text-purple-600">Replaced</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200">
                <p className="text-2xl font-bold text-gray-700">{importResult.skipped}</p>
                <p className="text-sm text-gray-600">Skipped</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200">
                <p className="text-2xl font-bold text-red-700">{importResult.errors}</p>
                <p className="text-sm text-red-600">Errors</p>
              </div>
            </div>

            {/* Error Details */}
            {importResult.errors > 0 && (
              <div className="text-left mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Error Details</h4>
                <div className="max-h-48 overflow-y-auto bg-gray-50 p-3 text-sm">
                  {importResult.rows
                    .filter(r => r.status === 'error')
                    .map(r => (
                      <div key={r.rowNumber} className="text-red-600 mb-1">
                        Row {r.rowNumber}: {r.errors?.join(', ')}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={resetImport}>
                Import Another File
              </Button>
              <Button onClick={() => window.location.href = '/leads'}>
                View Leads
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
