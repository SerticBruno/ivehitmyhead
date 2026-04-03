import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { getSiteOrigin } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How IVEHITMYHEAD collects, uses, and shares personal information when you use the website and related services.',
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@ivehitmyhead.com';
const LAST_UPDATED = 'April 3, 2026';

export default function PrivacyPage() {
  const siteOrigin = getSiteOrigin();

  return (
    <LegalPageShell title="Privacy policy">
      <p className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">
        Last updated: {LAST_UPDATED}
      </p>
      <p>
        This Privacy Policy describes how IVEHITMYHEAD (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
        handles information when you visit {siteOrigin} (the &quot;Site&quot;) or use related features such as
        browsing memes, optional accounts, newsletter signup, and interactions like likes or comments.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Information we collect
      </h2>
      <p>
        <strong className="text-gray-900 dark:text-white">Information you provide.</strong> If you create an
        account, we collect account details processed by our authentication provider (for example email address
        and credentials). If you sign up for our newsletter, we collect the email address you submit. If you
        post comments or similar content on the Site, we store the content you submit and associate it with
        your account where applicable.
      </p>
      <p>
        <strong className="text-gray-900 dark:text-white">Information collected automatically.</strong> Like
        most websites, we and our hosting and infrastructure providers may collect technical data such as IP
        address, browser type, device characteristics, general location derived from IP, pages viewed, and
        timestamps. We use a browser cookie (for example a session identifier) to support features such as
        remembering interaction state for memes you have liked when you are not signed in.
      </p>
      <p>
        <strong className="text-gray-900 dark:text-white">Meme generator.</strong> The meme generator runs in
        your browser; images you create there are not sent to our servers unless you separately choose to share
        or upload them through a feature that explicitly transmits files or data to us.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        How we use information
      </h2>
      <p>We use the information above to:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Operate, maintain, and improve the Site and its features</li>
        <li>Authenticate users, enforce access rules (including admin-only publishing tools), and secure the Site</li>
        <li>Display content, process interactions (such as views, likes, and comments), and personalize your experience where applicable</li>
        <li>Send newsletter or transactional messages when you have signed up or when we need to communicate about the service</li>
        <li>Comply with law, respond to lawful requests, and protect rights, safety, and integrity of users and the Site</li>
        <li>Analyze usage in aggregate or de-identified form where permitted</li>
      </ul>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Legal bases (EEA, UK, and similar regions)
      </h2>
      <p>
        Where required by law, we rely on one or more of the following: performance of a contract with you,
        our legitimate interests (such as securing and improving the Site, provided those interests are not
        overridden by your rights), your consent (for example newsletter signup where consent is the
        appropriate basis), and compliance with legal obligations.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        How we share information
      </h2>
      <p>
        We use service providers to host and run the Site. Categories of providers may include cloud hosting
        and deployment, database and authentication, media storage and delivery (for example for meme images),
        and email or audience tools for newsletter signups. These providers process information on our behalf
        under contractual terms and only as needed to provide their services.
      </p>
      <p>
        If newsletter delivery is configured, your signup may be processed through a third-party email or
        automation provider or a webhook you configure for your deployment; those parties process signup data
        under their own policies as well as our instructions where applicable.
      </p>
      <p>
        We may disclose information if we believe in good faith that disclosure is required by law, to enforce
        our Terms of Service, or to protect the rights, property, or safety of IVEHITMYHEAD, our users, or
        others. We may also share information in connection with a merger, acquisition, or sale of assets,
        subject to appropriate confidentiality safeguards.
      </p>
      <p>We do not sell your personal information in the conventional sense of selling lists of personal data for money.</p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Retention
      </h2>
      <p>
        We retain information for as long as necessary to provide the Site, comply with legal obligations,
        resolve disputes, and enforce our agreements. Retention periods vary depending on the type of data and
        the purpose for which it was collected.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Security
      </h2>
      <p>
        We take reasonable technical and organizational measures designed to protect personal information.
        No method of transmission or storage is completely secure; we cannot guarantee absolute security.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Your choices and rights
      </h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete, or export certain personal
        information, or to object to or restrict certain processing. You may withdraw consent where processing
        is based on consent (for example unsubscribing from marketing emails). To exercise these rights, contact
        us using the information below. You may also have the right to lodge a complaint with a supervisory
        authority.
      </p>
      <p>
        You can control cookies through your browser settings. Blocking or deleting cookies may affect Site
        functionality (for example interaction features that rely on a session cookie).
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Children
      </h2>
      <p>
        The Site is not directed to children under 13 (or the minimum age required in your jurisdiction), and we
        do not knowingly collect personal information from children. If you believe we have collected
        information from a child, please contact us and we will take appropriate steps to delete it.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        International transfers
      </h2>
      <p>
        We and our service providers may process information in the United States and other countries where
        privacy laws may differ from those in your region. Where required, we use appropriate safeguards (such
        as standard contractual clauses) for cross-border transfers.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Third-party sites and content
      </h2>
      <p>
        The Site may link to third-party websites or embed third-party content. This policy does not apply to
        those third parties; their practices are governed by their own policies.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Changes to this policy
      </h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the updated version on this page and
        revise the &quot;Last updated&quot; date. If changes are material, we will provide additional notice
        as appropriate.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Contact
      </h2>
      <p>
        Questions about this Privacy Policy:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">
          {CONTACT_EMAIL}
        </a>{' '}
        or our{' '}
        <Link href="/contact" className="font-semibold underline">
          contact page
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
