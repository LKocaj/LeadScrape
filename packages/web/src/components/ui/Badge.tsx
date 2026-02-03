import type { LeadStatus, Trade } from '../../types';

interface BadgeProps {
  status: LeadStatus;
}

const statusStyles: Record<LeadStatus, string> = {
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Enriched: 'bg-purple-50 text-purple-700 border-purple-200',
  Verified: 'bg-green-50 text-green-700 border-green-200',
  Exported: 'bg-amber-50 text-amber-700 border-amber-200',
  Invalid: 'bg-red-50 text-red-700 border-red-200',
  Duplicate: 'bg-gray-100 text-gray-700 border-gray-300',
};

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

// Trade badge with distinct colors for each trade type
interface TradeBadgeProps {
  trade: Trade;
}

const tradeStyles: Partial<Record<Trade, { bg: string; text: string; border: string; icon: string }>> = {
  // Home Services - Blue/Cyan family
  HVAC: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300', icon: '❄️' },
  Plumbing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', icon: '🔧' },
  Electrical: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', icon: '⚡' },
  Roofing: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', icon: '🏠' },
  'General Contractor': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', icon: '🔨' },
  Landscaping: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', icon: '🌿' },
  Painting: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300', icon: '🎨' },
  Flooring: { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-300', icon: '🪵' },
  'Pest Control': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-300', icon: '🐛' },
  Cleaning: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300', icon: '🧹' },
  'Windows & Doors': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', icon: '🪟' },
  'Garage Door': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300', icon: '🚗' },
  Fencing: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', icon: '🏗️' },
  Concrete: { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-400', icon: '🧱' },
  Siding: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300', icon: '🏡' },
  Insulation: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300', icon: '🧤' },
  Solar: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-400', icon: '☀️' },
  'Pool & Spa': { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-400', icon: '🏊' },
  'Tree Service': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400', icon: '🌳' },
  Handyman: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', icon: '🛠️' },
  'Appliance Repair': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', icon: '🔌' },
  Locksmith: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-400', icon: '🔑' },
  Moving: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300', icon: '📦' },
  // Auto
  'Auto Repair': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-400', icon: '🔧' },
  'Auto Body': { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-400', icon: '🚙' },
  'Auto Detailing': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', icon: '✨' },
  Towing: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-400', icon: '🚛' },
  // Healthcare - Red/Pink family
  Dental: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300', icon: '🦷' },
  Medical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', icon: '🏥' },
  Chiropractic: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300', icon: '🦴' },
  Veterinary: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', icon: '🐾' },
  Pharmacy: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', icon: '💊' },
  // Professional Services - Purple/Indigo family
  Legal: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', icon: '⚖️' },
  Accounting: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', icon: '📊' },
  Insurance: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', icon: '🛡️' },
  'Real Estate': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300', icon: '🏢' },
  Marketing: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300', icon: '📢' },
  'IT Services': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300', icon: '💻' },
  Consulting: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', icon: '💼' },
  // Food & Hospitality - Warm colors
  Restaurant: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', icon: '🍽️' },
  Catering: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', icon: '🍴' },
  Bakery: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300', icon: '🥐' },
  Hotel: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', icon: '🏨' },
  // Retail & Personal
  Retail: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-300', icon: '🛍️' },
  'E-commerce': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-300', icon: '🛒' },
  'Salon & Spa': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300', icon: '💇' },
  Fitness: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', icon: '💪' },
  Photography: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-400', icon: '📸' },
  'Pet Services': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', icon: '🐕' },
  Tutoring: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', icon: '📚' },
  Daycare: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300', icon: '👶' },
  // Other
  Manufacturing: { bg: 'bg-zinc-100', text: 'text-zinc-700', border: 'border-zinc-400', icon: '🏭' },
  Construction: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-400', icon: '🏗️' },
  Transportation: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-400', icon: '🚚' },
  Nonprofit: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', icon: '💚' },
  Other: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300', icon: '📋' },
  Unknown: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300', icon: '❓' },
};

const defaultStyle = { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-300', icon: '📋' };

export function TradeBadge({ trade }: TradeBadgeProps) {
  const style = tradeStyles[trade] || defaultStyle;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded ${style.bg} ${style.text} ${style.border}`}
    >
      <span>{style.icon}</span>
      {trade}
    </span>
  );
}
