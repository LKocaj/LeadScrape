import type { ReactNode } from 'react';
import { Card } from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  subtitle?: string;
}

export function StatsCard({ title, value, icon, subtitle }: StatsCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-navy-600">{title}</p>
          <p className="text-3xl font-bold text-navy-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-navy-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-3 bg-navy-100 text-navy-600">{icon}</div>
        )}
      </div>
    </Card>
  );
}
