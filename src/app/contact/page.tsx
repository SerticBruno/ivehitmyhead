import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact IVEHITMYHEAD for feedback, bugs, or general chaos.',
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@ivehitmyhead.com';

export default function ContactPage() {
  const mailto = `mailto:${CONTACT_EMAIL}`;

  return (
    <LegalPageShell title="Contact">
      <p>
        Found a bug, have a suggestion, or want to say hi? Use the email below. We read messages when the
        universe allows.
      </p>
      <p className="mt-6">
        <a
          href={mailto}
          className="inline-flex items-center justify-center border-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950 px-4 py-2 text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
      <p className="mt-6 text-gray-600 dark:text-gray-400">
        Social links (when published) live in the site footer.
      </p>
      <p className="mt-4">
        <Link href="/help" className="font-semibold underline">
          Help center
        </Link>
      </p>
    </LegalPageShell>
  );
}
