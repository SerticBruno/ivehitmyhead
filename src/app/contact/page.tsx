import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/contact/ContactForm';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { getPublicFacebookUrl, getPublicInstagramUrl } from '@/lib/socialUrls';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact IVEHITMYHEAD for feedback, bugs, or general chaos.',
};

export default function ContactPage() {
  const instagramUrl = getPublicInstagramUrl();
  const facebookUrl = getPublicFacebookUrl();

  return (
    <LegalPageShell title="Contact">
      <p>
        Found a bug, have a suggestion, or want to say hi? Use the form below. We read messages when the universe
        allows.
      </p>
      <div className="mt-8">
        <ContactForm className="mx-0 max-w-none" />
      </div>
      <p className="mt-6 text-gray-600 dark:text-gray-400">
        Find us on{' '}
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-900 underline dark:text-white"
        >
          Instagram
        </a>{' '}
        and{' '}
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-900 underline dark:text-white"
        >
          Facebook
        </a>
        , or use the icons in the site footer.
      </p>
      <p className="mt-4">
        <Link href="/help" className="font-semibold underline">
          Help center
        </Link>
      </p>
    </LegalPageShell>
  );
}
