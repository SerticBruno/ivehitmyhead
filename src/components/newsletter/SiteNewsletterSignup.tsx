'use client';

import React from 'react';
import { NewsletterForm, type NewsletterFormProps } from './NewsletterForm';
import { SITE_NEWSLETTER_COPY } from './siteNewsletterCopy';

export type SiteNewsletterSignupProps = Omit<
  NewsletterFormProps,
  'title' | 'description' | 'placeholder' | 'buttonText' | 'successFootnote'
> &
  Partial<Pick<NewsletterFormProps, 'title' | 'description' | 'placeholder' | 'buttonText' | 'successFootnote'>>;

/**
 * Site-wide newsletter signup: same defaults everywhere. Override any field per placement if needed.
 */
export function SiteNewsletterSignup(props: SiteNewsletterSignupProps) {
  return <NewsletterForm {...SITE_NEWSLETTER_COPY} {...props} />;
}
