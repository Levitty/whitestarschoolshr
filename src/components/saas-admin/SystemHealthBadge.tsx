import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SystemHealthBadgeProps {
  status?: 'operational' | 'degraded' | 'outage';
}

const SystemHealthBadge = ({ status = 'operational' }: SystemHealthBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'operational':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          label: 'Operational',
        };
      case 'degraded':
        return {
          color: 'bg-amber-500',
          textColor: 'text-amber-600',
          bgColor: 'bg-amber-50',
          label: 'Degraded',
        };
      case 'outage':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Outage',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
      <span className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
      <CheckCircle className={`h-4 w-4 ${config.textColor}`} />
    </div>
  );
};

export default SystemHealthBadge;
