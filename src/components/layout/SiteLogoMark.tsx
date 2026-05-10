import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const LOGO_PATH = '/ihmhlogo/ihmhlogo.png';

/** Compact brand mark for navbar / footer — pairs with the IVEHITMYHEAD wordmark. */
export function SiteLogoMark({
  className,
  priority = false,
}: {
  className?: string;
  /** Prefer true for the sticky header so the mark loads with the first paint. */
  priority?: boolean;
}) {
  return (
    <Image
      src={LOGO_PATH}
      alt=""
      width={40}
      height={40}
      className={cn('shrink-0 object-contain', className)}
      aria-hidden
      priority={priority}
    />
  );
}
