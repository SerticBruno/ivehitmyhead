import type { NewsletterFormProps } from './NewsletterForm';

/** Default copy for all on-site newsletter signups (home, footer, about, etc.). */
export const SITE_NEWSLETTER_COPY: Pick<
  NewsletterFormProps,
  'title' | 'description' | 'placeholder' | 'buttonText' | 'successFootnote'
> = {
  title: 'Fresh chaos, in your inbox',
  description:
    'New memes, generator updates, and whatever we shipped last - sent when there is actually something to show off.',
  placeholder: 'your@email.here',
  buttonText: 'Send it',
  successFootnote: "You're subscribed. Your inbox officially has a meme problem now.",
};
