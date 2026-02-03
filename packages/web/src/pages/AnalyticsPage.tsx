import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import type { AnalyticsOverview, TimelineData, SourceMetrics } from '../types';

const COLORS = ['#0A1628', '#00D4FF', '#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const periodOptions = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

export function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [sources, setSources] = useState<SourceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineDays, setTimelineDays] = useState('30');

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, sourcesRes] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getAnalyticsSources(),
        ]);
        setOverview(overviewRes.data);
        setSources(sourcesRes.data.sources);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await api.getAnalyticsTimeline(parseInt(timelineDays), 'day');
        setTimeline(res.data.timeline);
      } catch {
        // Ignore timeline errors
      }
    }
    fetchTimeline();
  }, [timelineDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (!overview) return null;

  // Prepare chart data
  const statusData = Object.entries(overview.byStatus).map(([name, value]) => ({ name, value }));
  const sourceData = Object.entries(overview.bySource).map(([name, value]) => ({ name, value }));
  const tradeData = Object.entries(overview.byTrade).map(([name, value]) => ({ name, value }));

  const qualityData = [
    { name: 'Email', value: overview.quality.emailRate },
    { name: 'Phone', value: overview.quality.phoneRate },
    { name: 'Website', value: overview.quality.websiteRate },
    { name: 'Address', value: overview.quality.addressRate },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={overview.total}
          icon={<Building2 className="text-navy-600" />}
        />
        <StatsCard
          title="This Week"
          value={overview.trends.thisWeek}
          change={overview.trends.changePercent}
          subtitle={`vs ${overview.trends.lastWeek} last week`}
        />
        <StatsCard
          title="With Email"
          value={`${overview.quality.emailRate.toFixed(1)}%`}
          icon={<Mail className="text-green-600" />}
          change={overview.trends.emailChangePercent}
        />
        <StatsCard
          title="With Phone"
          value={`${overview.quality.phoneRate.toFixed(1)}%`}
          icon={<Phone className="text-blue-600" />}
        />
      </div>

      {/* Timeline Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy-900">Leads Over Time</h3>
          <Select
            options={periodOptions}
            value={timelineDays}
            onChange={setTimelineDays}
          />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString();
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0A1628"
                strokeWidth={2}
                dot={{ fill: '#0A1628', r: 3 }}
                name="Leads"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-4">By Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent && percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                  }
                  labelLine={false}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Source Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-4">By Source</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#00D4FF" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Data Quality */}
      <Card>
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Data Quality</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {qualityData.map((item) => (
            <div key={item.name} className="text-center">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-2">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke={item.value >= 70 ? '#22C55E' : item.value >= 40 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(item.value / 100) * 226} 226`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-lg font-semibold">{item.value.toFixed(0)}%</span>
              </div>
              <p className="text-sm text-gray-600">{item.name}</p>
            </div>
          ))}
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={qualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Bar dataKey="value" name="Rate">
                {qualityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.value >= 70 ? '#22C55E' : entry.value >= 40 ? '#F59E0B' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Source Comparison Table */}
      <Card>
        <h3 className="text-lg font-semibold text-navy-900 mb-4">Source Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-medium text-gray-700">Source</th>
                <th className="text-right p-3 font-medium text-gray-700">Total</th>
                <th className="text-right p-3 font-medium text-gray-700">Email Rate</th>
                <th className="text-right p-3 font-medium text-gray-700">Phone Rate</th>
                <th className="text-right p-3 font-medium text-gray-700">Website Rate</th>
                <th className="text-right p-3 font-medium text-gray-700">Avg Rating</th>
                <th className="text-right p-3 font-medium text-gray-700">Duplicate Rate</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.source} className="border-t border-gray-200">
                  <td className="p-3 font-medium text-navy-900">{source.source}</td>
                  <td className="p-3 text-right">{source.total}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`${
                        source.emailRate >= 70
                          ? 'text-green-600'
                          : source.emailRate >= 40
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {source.emailRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`${
                        source.phoneRate >= 70
                          ? 'text-green-600'
                          : source.phoneRate >= 40
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {source.phoneRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-right">{source.websiteRate.toFixed(1)}%</td>
                  <td className="p-3 text-right">
                    {source.averageRating > 0 ? source.averageRating.toFixed(1) : '-'}
                  </td>
                  <td className="p-3 text-right text-gray-500">{source.duplicateRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Trade Distribution */}
      {tradeData.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-navy-900 mb-4">By Trade</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tradeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0A1628" name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  change,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: number;
  subtitle?: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-navy-900">{value}</p>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 text-sm mt-1 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
            </div>
          )}
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2 bg-gray-100">{icon}</div>
        )}
      </div>
    </Card>
  );
}
