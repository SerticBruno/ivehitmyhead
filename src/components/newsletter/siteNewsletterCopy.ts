import type { NewsletterFormProps } from './NewsletterForm';

/** Default copy for all on-site newsletter signups (home, footer, about, etc.). */
export const SITE_NEWSLETTER_COPY: Pick<
  NewsletterFormProps,
  'title' | 'description' | 'placeholder' | 'buttonText' | 'successFootnote'
> = {
  title: 'Meme spam, but legal',
  description:
    'Hand us your email and we might occasionally send something. Lower your expectations preemptively.',
  placeholder: 'your@email.here',
  buttonText: 'Sure, why not',
  successFootnote: 'If you change your mind, you can ignore us. We are used to it.',
};
