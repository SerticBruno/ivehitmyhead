import { Facebook, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPublicFacebookUrl,
  getPublicInstagramHandle,
  getPublicInstagramUrl,
  SITE_FACEBOOK_LABEL,
} from '@/lib/socialUrls';

const linkClass =
  'inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100';

type NewsletterSocialLinksProps = {
  className?: string;
  align?: 'start' | 'center';
};

export function NewsletterSocialLinks({ className, align = 'center' }: NewsletterSocialLinksProps) {
  const instagramUrl = getPublicInstagramUrl();
  const facebookUrl = getPublicFacebookUrl();
  const instagramHandle = getPublicInstagramHandle();

  if (!instagramUrl && !facebookUrl) return null;

  return (
    <div
      className={cn(
        'mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-700',
        align === 'center' && 'text-center',
        className,
      )}
    >
      <p className="mb-2 text-s text-gray-600 dark:text-gray-400">You can also follow us on social</p>
      <div className={cn('flex flex-wrap items-center gap-4', align === 'center' && 'justify-center')}>
        {instagramUrl ? (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <Instagram className="h-4 w-4 shrink-0" aria-hidden />
            <span>@{instagramHandle}</span>
          </a>
        ) : null}
        {facebookUrl ? (
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <Facebook className="h-4 w-4 shrink-0" aria-hidden />
            <span>{SITE_FACEBOOK_LABEL}</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
