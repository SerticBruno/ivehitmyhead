import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Help',
  description: 'How to browse the archive and use the meme generator on IVEHITMYHEAD.',
};

export default function HelpPage() {
  return (
    <LegalPageShell title="Help center">
      <p>
        Quick orientation for a site that refuses to take itself seriously. If something breaks, it might be
        a feature. Probably not.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Browse memes
      </h2>
      <p>
        Open the{' '}
        <Link href="/memes" className="font-semibold underline">
          memes feed
        </Link>{' '}
        to scroll the archive. Use filters on desktop (sidebar) or the mobile bars to narrow by category, sort,
        or time window.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        New memes on the site
      </h2>
      <p>
        Library uploads are limited to site operators. There is no public upload page. Use the{' '}
        <Link href="/meme-generator" className="font-semibold underline">
          meme generator
        </Link>{' '}
        to create your own images locally, or enjoy what is already in the{' '}
        <Link href="/memes" className="font-semibold underline">
          feed
        </Link>
        .
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Meme generator
      </h2>
      <p>
        The{' '}
        <Link href="/meme-generator" className="font-semibold underline">
          generator
        </Link>{' '}
        uses templates and a canvas-style editor. Pick a template, edit text (and images where supported), then
        export or save per the controls in the UI.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Still stuck?
      </h2>
      <p>
        See{' '}
        <Link href="/contact" className="font-semibold underline">
          Contact
        </Link>{' '}
        to reach out.
      </p>
    </LegalPageShell>
  );
}
