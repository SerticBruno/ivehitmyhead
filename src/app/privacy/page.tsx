import type { Metadata } from 'next';
import { LegalPageShell } from '@/components/legal/LegalPageShell';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'Privacy policy for IVEHITMYHEAD. Placeholder until final legal copy is published.',
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy policy">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200 border-2 border-amber-700/40 dark:border-amber-500/40 p-3 bg-amber-50 dark:bg-amber-950/30">
        Draft / placeholder. Replace this page with counsel-approved privacy policy text before treating it as
        legally binding.
      </p>
      <p className="mt-6">
        <strong className="text-gray-900 dark:text-white">Overview.</strong> This site may collect technical
        data typical of web apps (for example logs, cookies where used, and information you submit such as
        uploads or account details if you sign in). Third-party services (for example hosting, media CDN, and
        database/auth providers) may process data under their own terms.
      </p>
      <p>
        <strong className="text-gray-900 dark:text-white">Newsletter.</strong> If you subscribe to email
        updates, we use the address only for that purpose unless we say otherwise at signup and in the final
        policy.
      </p>
      <p>
        <strong className="text-gray-900 dark:text-white">Contact.</strong> Questions about privacy can be sent
        via the contact page once final policy and processes are in place.
      </p>
    </LegalPageShell>
  );
}
