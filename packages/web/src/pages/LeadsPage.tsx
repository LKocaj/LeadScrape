import { useEffect, useState, useCallback } from 'react';
import { Trash2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import type { Lead, LeadFilters, LeadStatus, Trade, LeadSource } from '../types';

const PAGE_SIZE = 20;

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Enriched', label: 'Enriched' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Exported', label: 'Exported' },
  { value: 'Invalid', label: 'Invalid' },
  { value: 'Duplicate', label: 'Duplicate' },
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

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getLeads({
        ...filters,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setLeads(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

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
                    <th className="px-4 py-3 font-semibold">Company</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Trade</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50">
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
                      <td className="px-4 py-3 text-sm text-navy-700">
                        {lead.email || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-700">
                        {lead.phone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-navy-700">{lead.trade}</td>
                      <td className="px-4 py-3 text-sm text-navy-700">{lead.source}</td>
                      <td className="px-4 py-3">
                        <Badge status={lead.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {lead.website && (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-navy-500 hover:text-navy-700"
                            >
                              <ExternalLink size={16} />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(lead.id)}
                            disabled={deleting === lead.id}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
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
              <p className="text-sm text-navy-600">
                Showing {page * PAGE_SIZE + 1} - {page * PAGE_SIZE + leads.length}
              </p>
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
                  disabled={leads.length < PAGE_SIZE}
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
