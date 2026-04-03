import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { getSiteOrigin } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Terms of service',
  description:
    'Terms governing your use of IVEHITMYHEAD, including accounts, content, acceptable use, and limitations of liability.',
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@ivehitmyhead.com';
const LAST_UPDATED = 'April 3, 2026';

export default function TermsPage() {
  const siteOrigin = getSiteOrigin();

  return (
    <LegalPageShell title="Terms of service">
      <p className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">
        Last updated: {LAST_UPDATED}
      </p>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the website at {siteOrigin}
        and related services (collectively, the &quot;Service&quot;) operated by IVEHITMYHEAD
        (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using the Service, you agree to
        these Terms. If you do not agree, do not use the Service.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Eligibility and accounts
      </h2>
      <p>
        You must be old enough to form a binding contract in your jurisdiction and meet any minimum age
        requirements that apply in your region (including, where applicable, not using the Service if you are
        under 13). If you create an account, you agree to provide accurate information and keep your credentials
        confidential. You are responsible for activity under your account. We may suspend or terminate accounts
        that violate these Terms or pose risk to the Service or other users.
      </p>
      <p>
        Publishing memes to the public library and certain administrative functions may be limited to
        authorized operators. Features available to you depend on your role and how the Service is configured.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        License to use the Service
      </h2>
      <p>
        Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to
        access and use the Service for personal, non-commercial entertainment purposes unless we agree
        otherwise in writing.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        User content and conduct
      </h2>
      <p>
        The Service may allow you to submit or post content (for example comments or, where permitted, images or
        other media). You retain ownership of your content, but you grant us a worldwide, non-exclusive,
        royalty-free license to host, store, reproduce, display, distribute, and create technical copies of
        your content as needed to operate, promote, and improve the Service. You may revoke this license as to
        future use by removing your content where the Service allows, subject to reasonable backup and
        retention practices.
      </p>
      <p>You agree not to use the Service to:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Violate any applicable law or regulation</li>
        <li>Infringe intellectual property, privacy, publicity, or other rights of any person</li>
        <li>Upload or distribute malware, spam, or deceptive or harmful content</li>
        <li>Harass, threaten, defame, or discriminate against others</li>
        <li>Attempt unauthorized access to the Service, other accounts, or our systems</li>
        <li>Scrape, crawl, or harvest data in bulk without our prior written consent, except as allowed by public search engines for indexing public pages</li>
        <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
        <li>Use the Service for high-risk activities where failure could lead to death, injury, or environmental damage</li>
      </ul>
      <p>
        We may remove or restrict content, disable features, or take other moderation actions at our discretion,
        including when we believe content violates these Terms or applicable law. We are not obligated to
        monitor all content but may do so.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Intellectual property on the Service
      </h2>
      <p>
        The Service, including its design, branding, software, and compilation of content, is owned by us or our
        licensors and is protected by intellectual property laws. Except for the limited license above, no
        rights are granted to you. Memes and other materials displayed on the Service may be owned by us or
        third parties; unauthorized copying or redistribution may violate copyright or other laws.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Copyright complaints
      </h2>
      <p>
        If you believe material on the Service infringes your copyright, send a notice to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">
          {CONTACT_EMAIL}
        </a>{' '}
        with the information typically required under applicable law (for example identification of the work,
        the material you claim is infringing, your contact details, and a good-faith statement). We may remove
        or disable access to material we believe in good faith is infringing and may terminate repeat
        infringers where appropriate.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Disclaimers
      </h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND,
        WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
        PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
        ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. CONTENT ON THE SERVICE IS FOR ENTERTAINMENT; IT IS NOT
        PROFESSIONAL ADVICE.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Limitation of liability
      </h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL IVEHITMYHEAD OR ITS SUPPLIERS OR LICENSORS BE
        LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
        PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR
        INABILITY TO USE THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY
        OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO
        THE SERVICE OR THESE TERMS IS LIMITED TO THE GREATER OF (A) THE AMOUNT YOU PAID US FOR THE SERVICE IN
        THE TWELVE MONTHS BEFORE THE CLAIM (IF ANY) OR (B) ONE HUNDRED U.S. DOLLARS (US $100). SOME
        JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN THOSE JURISDICTIONS, OUR LIABILITY IS LIMITED TO THE
        MAXIMUM EXTENT PERMITTED BY LAW.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Indemnity
      </h2>
      <p>
        You agree to defend, indemnify, and hold harmless IVEHITMYHEAD and its affiliates, officers, directors,
        employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or
        debt, and expenses (including reasonable attorneys&apos; fees) arising from your use of the Service,
        your content, your violation of these Terms, or your violation of any third-party right.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Changes to the Service and Terms
      </h2>
      <p>
        We may modify, suspend, or discontinue the Service (or any part of it) at any time. We may update these
        Terms by posting a revised version on this page and updating the &quot;Last updated&quot; date. If we
        make material changes, we will provide additional notice where appropriate. Your continued use after the
        effective date of changes constitutes acceptance of the revised Terms. If you do not agree, stop using
        the Service.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Termination
      </h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate your access to the Service for
        any reason, including violation of these Terms, with or without notice. Provisions that by their nature
        should survive termination (including ownership, disclaimers, limitation of liability, indemnity, and
        governing law) will survive.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Governing law and disputes
      </h2>
      <p>
        These Terms are governed by the laws of the United States, without regard to conflict-of-law
        principles that would require the laws of another jurisdiction, except where mandatory laws of your
        country or state of residence apply despite this choice. For disputes arising from these Terms or the
        Service, you and we consent to the personal jurisdiction of the state and federal courts located in
        the United States, subject to any non-waivable right you may have to bring claims in your local courts.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        General
      </h2>
      <p>
        These Terms constitute the entire agreement between you and us regarding the Service and supersede prior
        agreements on the subject. If any provision is found unenforceable, the remaining provisions remain in
        effect. Our failure to enforce a provision is not a waiver. You may not assign these Terms without our
        consent; we may assign them in connection with a merger, acquisition, or sale of assets.
      </p>

      <h2 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white mt-8 mb-3">
        Contact
      </h2>
      <p>
        Questions about these Terms:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">
          {CONTACT_EMAIL}
        </a>{' '}
        or our{' '}
        <Link href="/contact" className="font-semibold underline">
          contact page
        </Link>
        . See also our{' '}
        <Link href="/privacy" className="font-semibold underline">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalPageShell>
  );
}
