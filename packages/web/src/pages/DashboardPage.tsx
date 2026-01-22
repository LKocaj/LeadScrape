import { useEffect, useState } from 'react';
import { Users, Mail, Phone, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { StatsCard } from '../components/dashboard/StatsCard';
import { api } from '../services/api';
import type { Stats, Lead, LeadStatus } from '../types';

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, leadsRes] = await Promise.all([
          api.getStats(),
          api.getLeads({ limit: 5 }),
        ]);
        setStats(statsRes.data);
        setRecentLeads(leadsRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  const emailCount = recentLeads.filter((l) => l.email).length;
  const phoneCount = recentLeads.filter((l) => l.phone).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Leads"
          value={stats?.total || 0}
          icon={<Users size={24} />}
        />
        <StatsCard
          title="New Leads"
          value={stats?.byStatus['New'] || 0}
          icon={<TrendingUp size={24} />}
          subtitle="Ready to enrich"
        />
        <StatsCard
          title="With Email"
          value={emailCount}
          icon={<Mail size={24} />}
        />
        <StatsCard
          title="With Phone"
          value={phoneCount}
          icon={<Phone size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-4">By Status</h3>
          <div className="space-y-3">
            {stats &&
              Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge status={status as LeadStatus} />
                  <span className="font-medium text-navy-900">{count}</span>
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-4">By Source</h3>
          <div className="space-y-3">
            {stats &&
              Object.entries(stats.bySource).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm text-navy-700">{source}</span>
                  <span className="font-medium text-navy-900">{count}</span>
                </div>
              ))}
            {stats && Object.keys(stats.bySource).length === 0 && (
              <p className="text-navy-500 text-sm">No leads yet</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Recent Leads</h3>
        {recentLeads.length === 0 ? (
          <p className="text-navy-500">No leads yet. Start scraping to populate your database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy-900 text-white text-left text-sm">
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Trade</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-navy-900">
                      {lead.companyName}
                    </td>
                    <td className="px-4 py-3 text-sm text-navy-700">{lead.trade}</td>
                    <td className="px-4 py-3 text-sm text-navy-700">{lead.source}</td>
                    <td className="px-4 py-3">
                      <Badge status={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
