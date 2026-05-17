'use client';

import React from 'react';
import { ContactForm } from '@/components/contact/ContactForm';
import { Button } from '@/components/ui';
import { getPublicFacebookUrl, getPublicInstagramUrl } from '@/lib/socialUrls';

const frameClass =
  'border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]';

type ContactSectionProps = {
  title: string;
  description: React.ReactNode;
  className?: string;
  showSocialLinks?: boolean;
};

export function ContactSection({
  title,
  description,
  className,
  showSocialLinks = true,
}: ContactSectionProps) {
  const instagramUrl = getPublicInstagramUrl();
  const facebookUrl = getPublicFacebookUrl();

  return (
    <section className={className ?? 'text-center pb-4'}>
      <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
        {description}
      </p>
      <ContactForm innerClassName={`p-6 md:p-8 ${frameClass}`} className="max-w-2xl" />
      {showSocialLinks ? (
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Button
            variant="outline"
            className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 font-bold uppercase tracking-wide"
            onClick={() => window.open(instagramUrl, '_blank')}
          >
            Instagram
          </Button>
          <Button
            variant="outline"
            className="rounded-none border-2 border-zinc-700 dark:border-zinc-400 font-bold uppercase tracking-wide"
            onClick={() => window.open(facebookUrl, '_blank')}
          >
            Facebook
          </Button>
        </div>
      ) : null}
    </section>
  );
}
