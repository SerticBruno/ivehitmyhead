import React from 'react';
import { cn } from '@/lib/utils';

interface StableWidthLabelProps {
  /** Widest label — reserves width so visible text can change without shifting layout */
  reserve: string;
  children: React.ReactNode;
  className?: string;
}

export function StableWidthLabel({ reserve, children, className }: StableWidthLabelProps) {
  return (
    <span className={cn('inline-grid', className)}>
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden="true">
        {reserve}
      </span>
      <span className="col-start-1 row-start-1 whitespace-nowrap">{children}</span>
    </span>
  );
}
