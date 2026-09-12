import * as React from 'react';
import { cn } from '../../lib/utils.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pending' | 'inProgress' | 'completed' | 'secondary';
}

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const variants = {
    default: 'bg-slate-900 text-white',
    secondary: 'bg-slate-100 text-slate-800',
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    inProgress: 'bg-blue-100 text-blue-800 border border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export { Badge };
export default Badge;
