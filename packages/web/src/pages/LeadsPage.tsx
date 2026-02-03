import { useEffect, useState, useCallback } from 'react';
import { Trash2, ChevronLeft, ChevronRight, CheckSquare, Square, Download, Mail, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, TradeBadge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import type { Lead, LeadFilters, LeadStatus, Trade, LeadSource } from '../types';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Enriched', label: 'Enriched' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Exported', label: 'Exported' },
  { value: 'Invalid', label: 'Invalid' },
  { value: 'Duplicate', label: 'Duplicate' },
];

const tradeOptions = [
  // Home Services
  { value: 'HVAC', label: '❄️ HVAC' },
  { value: 'Plumbing', label: '🔧 Plumbing' },
  { value: 'Electrical', label: '⚡ Electrical' },
  { value: 'Roofing', label: '🏠 Roofing' },
  { value: 'General Contractor', label: '🔨 General Contractor' },
  { value: 'Landscaping', label: '🌿 Landscaping' },
  { value: 'Painting', label: '🎨 Painting' },
  { value: 'Flooring', label: '🪵 Flooring' },
  { value: 'Pest Control', label: '🐛 Pest Control' },
  { value: 'Cleaning', label: '🧹 Cleaning' },
  { value: 'Windows & Doors', label: '🪟 Windows & Doors' },
  { value: 'Garage Door', label: '🚪 Garage Door' },
  { value: 'Fencing', label: '🏗️ Fencing' },
  { value: 'Concrete', label: '🧱 Concrete' },
  { value: 'Siding', label: '🏡 Siding' },
  { value: 'Insulation', label: '🧤 Insulation' },
  { value: 'Solar', label: '☀️ Solar' },
  { value: 'Pool & Spa', label: '🏊 Pool & Spa' },
  { value: 'Tree Service', label: '🌳 Tree Service' },
  { value: 'Handyman', label: '🛠️ Handyman' },
  { value: 'Appliance Repair', label: '🔌 Appliance Repair' },
  { value: 'Locksmith', label: '🔑 Locksmith' },
  { value: 'Moving', label: '📦 Moving' },
  // Auto
  { value: 'Auto Repair', label: '🔧 Auto Repair' },
  { value: 'Auto Body', label: '🚙 Auto Body' },
  { value: 'Auto Detailing', label: '✨ Auto Detailing' },
  { value: 'Towing', label: '🚛 Towing' },
  // Healthcare
  { value: 'Dental', label: '🦷 Dental' },
  { value: 'Medical', label: '🏥 Medical' },
  { value: 'Chiropractic', label: '🦴 Chiropractic' },
  { value: 'Veterinary', label: '🐾 Veterinary' },
  { value: 'Pharmacy', label: '💊 Pharmacy' },
  // Professional Services
  { value: 'Legal', label: '⚖️ Legal' },
  { value: 'Accounting', label: '📊 Accounting' },
  { value: 'Insurance', label: '🛡️ Insurance' },
  { value: 'Real Estate', label: '🏢 Real Estate' },
  { value: 'Marketing', label: '📢 Marketing' },
  { value: 'IT Services', label: '💻 IT Services' },
  { value: 'Consulting', label: '💼 Consulting' },
  // Food & Hospitality
  { value: 'Restaurant', label: '🍽️ Restaurant' },
  { value: 'Catering', label: '🍴 Catering' },
  { value: 'Bakery', label: '🥐 Bakery' },
  { value: 'Hotel', label: '🏨 Hotel' },
  // Retail & Personal Services
  { value: 'Retail', label: '🛍️ Retail' },
  { value: 'E-commerce', label: '🛒 E-commerce' },
  { value: 'Salon & Spa', label: '💇 Salon & Spa' },
  { value: 'Fitness', label: '💪 Fitness' },
  { value: 'Photography', label: '📷 Photography' },
  { value: 'Pet Services', label: '🐕 Pet Services' },
  // Education & Childcare
  { value: 'Tutoring', label: '📚 Tutoring' },
  { value: 'Daycare', label: '👶 Daycare' },
  // Other
  { value: 'Construction', label: '🏗️ Construction' },
  { value: 'Manufacturing', label: '🏭 Manufacturing' },
  { value: 'Transportation', label: '🚚 Transportation' },
  { value: 'Nonprofit', label: '❤️ Nonprofit' },
  { value: 'Other', label: '📋 Other' },
];

const sourceOptions = [
  { value: 'Google Maps', label: 'Google Maps' },
  { value: 'Yelp', label: 'Yelp' },
  { value: 'HomeAdvisor', label: 'HomeAdvisor' },
  { value: 'Angi', label: 'Angi' },
  { value: 'Thumbtack', label: 'Thumbtack' },
  { value: 'BBB', label: 'BBB' },
];

// Row border colors by trade category for visual scanning
const tradeBorderColors: Partial<Record<Trade, string>> = {
  // Home Services - Blue/Green spectrum
  HVAC: 'border-l-4 border-l-sky-400',
  Plumbing: 'border-l-4 border-l-blue-400',
  Electrical: 'border-l-4 border-l-amber-400',
  Roofing: 'border-l-4 border-l-orange-400',
  'General Contractor': 'border-l-4 border-l-emerald-400',
  Landscaping: 'border-l-4 border-l-green-400',
  Painting: 'border-l-4 border-l-violet-400',
  Flooring: 'border-l-4 border-l-amber-500',
  'Pest Control': 'border-l-4 border-l-lime-400',
  Cleaning: 'border-l-4 border-l-cyan-400',
  'Windows & Doors': 'border-l-4 border-l-slate-400',
  'Garage Door': 'border-l-4 border-l-stone-400',
  Fencing: 'border-l-4 border-l-amber-600',
  Concrete: 'border-l-4 border-l-stone-500',
  Siding: 'border-l-4 border-l-teal-400',
  Insulation: 'border-l-4 border-l-rose-300',
  Solar: 'border-l-4 border-l-yellow-400',
  'Pool & Spa': 'border-l-4 border-l-blue-500',
  'Tree Service': 'border-l-4 border-l-green-600',
  Handyman: 'border-l-4 border-l-orange-300',
  'Appliance Repair': 'border-l-4 border-l-zinc-400',
  Locksmith: 'border-l-4 border-l-yellow-600',
  Moving: 'border-l-4 border-l-amber-400',
  // Auto - Slate/Gray
  'Auto Repair': 'border-l-4 border-l-slate-400',
  'Auto Body': 'border-l-4 border-l-zinc-400',
  'Auto Detailing': 'border-l-4 border-l-slate-500',
  Towing: 'border-l-4 border-l-gray-500',
  // Healthcare - Red/Pink/Blue
  Dental: 'border-l-4 border-l-sky-400',
  Medical: 'border-l-4 border-l-red-400',
  Chiropractic: 'border-l-4 border-l-teal-400',
  Veterinary: 'border-l-4 border-l-amber-400',
  Pharmacy: 'border-l-4 border-l-green-400',
  // Professional - Purple/Indigo
  Legal: 'border-l-4 border-l-indigo-400',
  Accounting: 'border-l-4 border-l-emerald-400',
  Insurance: 'border-l-4 border-l-blue-400',
  'Real Estate': 'border-l-4 border-l-violet-400',
  Marketing: 'border-l-4 border-l-pink-400',
  'IT Services': 'border-l-4 border-l-cyan-400',
  Consulting: 'border-l-4 border-l-purple-400',
  // Food & Hospitality - Warm
  Restaurant: 'border-l-4 border-l-orange-400',
  Catering: 'border-l-4 border-l-orange-300',
  Bakery: 'border-l-4 border-l-amber-300',
  Hotel: 'border-l-4 border-l-indigo-400',
  // Retail & Personal - Pink/Purple
  Retail: 'border-l-4 border-l-fuchsia-400',
  'E-commerce': 'border-l-4 border-l-violet-500',
  'Salon & Spa': 'border-l-4 border-l-pink-400',
  Fitness: 'border-l-4 border-l-red-400',
  Photography: 'border-l-4 border-l-rose-400',
  'Pet Services': 'border-l-4 border-l-amber-400',
  // Education
  Tutoring: 'border-l-4 border-l-blue-300',
  Daycare: 'border-l-4 border-l-pink-300',
  // Other
  Construction: 'border-l-4 border-l-orange-500',
  Manufacturing: 'border-l-4 border-l-zinc-500',
  Transportation: 'border-l-4 border-l-slate-500',
  Nonprofit: 'border-l-4 border-l-rose-500',
  Other: 'border-l-4 border-l-gray-400',
};
const defaultBorderColor = 'border-l-4 border-l-gray-300';

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState<{
    current: number;
    total: number;
    enrichedSoFar: number;
  } | null>(null);
  const [enrichmentStatus, setEnrichmentStatus] = useState<{
    totalLeads: number;
    withEmail: number;
    withoutEmail: number;
    enrichable: number;
  } | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getLeads({
        ...filters,
        limit: pageSize,
        offset: page * pageSize,
      });
      setLeads(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  const fetchEnrichmentStatus = useCallback(async () => {
    try {
      const res = await api.getEnrichmentStatus();
      setEnrichmentStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch enrichment status:', err);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchEnrichmentStatus();
  }, [fetchEnrichmentStatus]);

  const handleFilterChange = (key: keyof LeadFilters, value: string | boolean) => {
    setPage(0);
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    setDeleting(id);
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const handleExportInstantly = async () => {
    setExporting(true);
    try {
      const result = await api.exportInstantly(filters);
      const skippedMsg = result.data.skipped > 0 ? ` (${result.data.skipped} skipped - no email)` : '';
      alert(`Exported ${result.data.count} leads to Instantly format${skippedMsg}`);
      // Trigger download
      window.location.href = result.data.downloadUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleEnrichEmails = async () => {
    const leadsToEnrich = selectedIds.size > 0
      ? leads.filter(l => selectedIds.has(l.id) && !l.email && l.website)
      : leads.filter(l => !l.email && l.website);

    if (leadsToEnrich.length === 0) {
      alert('No leads to enrich. Select leads that have a website but no email.');
      return;
    }

    const batchCount = Math.ceil(leadsToEnrich.length / 50);
    const confirmed = confirm(
      `Enrich ${leadsToEnrich.length} leads by scraping their websites for email addresses?` +
      (batchCount > 1 ? `\n\nThis will run in ${batchCount} batches of 50.` : '') +
      `\n\nThis may take a few moments.`
    );
    if (!confirmed) return;

    setEnriching(true);
    try {
      // Process in batches of 50
      const BATCH_SIZE = 50;
      const leadIds = leadsToEnrich.map(l => l.id);
      const totalStats = {
        total: 0,
        enriched: 0,
        skipped: 0,
        failed: 0,
        alreadyHadEmail: 0,
        noWebsite: 0,
      };

      // Initialize progress
      setEnrichmentProgress({ current: 0, total: leadIds.length, enrichedSoFar: 0 });

      for (let i = 0; i < leadIds.length; i += BATCH_SIZE) {
        const batch = leadIds.slice(i, i + BATCH_SIZE);

        // Update progress before batch starts
        setEnrichmentProgress({
          current: i,
          total: leadIds.length,
          enrichedSoFar: totalStats.enriched,
        });

        const result = await api.enrichBatch(batch);
        const { stats } = result.data;

        totalStats.total += stats.total;
        totalStats.enriched += stats.enriched;
        totalStats.skipped += stats.skipped;
        totalStats.failed += stats.failed;
        totalStats.alreadyHadEmail += stats.alreadyHadEmail;
        totalStats.noWebsite += stats.noWebsite;

        // Update progress after batch completes
        setEnrichmentProgress({
          current: Math.min(i + BATCH_SIZE, leadIds.length),
          total: leadIds.length,
          enrichedSoFar: totalStats.enriched,
        });
      }

      alert(
        `Enrichment complete!\n\n` +
        `Found emails: ${totalStats.enriched}\n` +
        `Already had email: ${totalStats.alreadyHadEmail}\n` +
        `No website: ${totalStats.noWebsite}\n` +
        `Failed: ${totalStats.failed}`
      );

      // Refresh leads list and enrichment status
      await fetchLeads();
      await fetchEnrichmentStatus();
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Enrichment failed');
    } finally {
      setEnriching(false);
      setEnrichmentProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <div className="flex items-end gap-4 flex-wrap">
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
            <Checkbox
              label="Has Website"
              checked={filters.hasWebsite || false}
              onChange={(v) => handleFilterChange('hasWebsite', v)}
            />
            <Checkbox
              label="Needs Email"
              checked={filters.needsEnrichment || false}
              onChange={(v) => handleFilterChange('needsEnrichment', v)}
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setFilters({});
                setPage(0);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {leads.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-navy-600">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : `${leads.length} leads shown`}
              </span>
              {!enriching && enrichmentStatus && enrichmentStatus.enrichable > 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  <Mail size={12} className="inline mr-1" />
                  {enrichmentStatus.enrichable} leads can be enriched
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEnrichEmails}
                disabled={enriching}
              >
                {enriching ? <Spinner size="sm" /> : <Sparkles size={16} />}
                {selectedIds.size > 0 ? 'Enrich Selected' : 'Find Emails'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportInstantly}
                disabled={exporting}
              >
                {exporting ? <Spinner size="sm" /> : <Download size={16} />}
                Export to Instantly
              </Button>
            </div>
          </div>

          {/* Enrichment Progress Bar */}
          {enriching && enrichmentProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-600">
                  <Sparkles size={14} className="inline mr-1 text-amber-500" />
                  Enriching leads...
                </span>
                <span className="text-navy-500">
                  {enrichmentProgress.current} / {enrichmentProgress.total} processed
                  {enrichmentProgress.enrichedSoFar > 0 && (
                    <span className="text-green-600 ml-2">
                      ({enrichmentProgress.enrichedSoFar} emails found)
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 overflow-hidden">
                <div
                  className="bg-oncall-500 h-2 transition-all duration-300"
                  style={{
                    width: `${Math.round((enrichmentProgress.current / enrichmentProgress.total) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-6">
            <p className="text-navy-500">No leads found matching your filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-navy-900 text-white text-left text-sm">
                    <th className="px-4 py-3 font-semibold w-10">
                      <button onClick={toggleSelectAll} className="text-white hover:text-oncall-300">
                        {selectedIds.size === leads.length ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Website</th>
                    <th className="px-4 py-3 font-semibold">Trade</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className={`border-b border-gray-200 hover:bg-gray-50 ${tradeBorderColors[lead.trade] || defaultBorderColor} ${selectedIds.has(lead.id) ? 'bg-oncall-50' : ''}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(lead.id)} className="text-navy-500 hover:text-oncall-600">
                          {selectedIds.has(lead.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy-900">{lead.companyName}</div>
                        {lead.city && lead.state && (
                          <div className="text-xs text-navy-500">
                            {lead.city}, {lead.state}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-700">
                        {lead.contactName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {lead.email ? (
                          <span className="text-navy-700">{lead.email}</span>
                        ) : lead.website ? (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">
                            <Sparkles size={10} className="inline mr-1" />
                            Can enrich
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-700">
                        {lead.phone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {lead.website ? (
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[150px]"
                            title={lead.website}
                          >
                            {lead.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <TradeBadge trade={lead.trade} />
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-700">{lead.source}</td>
                      <td className="px-4 py-3">
                        <Badge status={lead.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(lead.id)}
                            disabled={deleting === lead.id}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            title="Delete lead"
                          >
                            {deleting === lead.id ? (
                              <Spinner size="sm" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <p className="text-sm text-navy-600">
                  Showing {page * pageSize + 1} - {page * pageSize + leads.length}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-navy-500">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(0);
                    }}
                    className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={leads.length < pageSize}
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
