import type { LeadStatus } from '../../types';

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
