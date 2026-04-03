import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'Terms of service for IVEHITMYHEAD. Placeholder until final legal copy is published.',
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of service">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200 border-2 border-amber-700/40 dark:border-amber-500/40 p-3 bg-amber-50 dark:bg-amber-950/30">
        Draft / placeholder. Replace this page with counsel-approved terms before treating it as legally
        binding.
      </p>
      <p className="mt-6">
        <strong className="text-gray-900 dark:text-white">Use of the site.</strong> By using IVEHITMYHEAD you
        agree not to abuse the service, upload unlawful content, or attempt to disrupt or compromise the site
        or other users. We may remove content or restrict access when needed.
      </p>
      <p>
        <strong className="text-gray-900 dark:text-white">Content.</strong> You are responsible for content
        you upload or create. Respect copyright and others&apos; rights. The site is provided as-is, without
        warranties to the maximum extent permitted by law.
      </p>
      <p>
        <strong className="text-gray-900 dark:text-white">Changes.</strong> These terms may be updated; the
        posted version on this page will apply going forward unless stated otherwise.
      </p>
    </LegalPageShell>
  );
}
