'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { NewsletterSocialLinks } from './NewsletterSocialLinks';

export type NewsletterFormVariant = 'card' | 'inline' | 'bare';

export interface NewsletterFormProps {
  className?: string;
  /** Layout: bordered card, compact horizontal band, or form fields only (you supply the shell). */
  variant?: NewsletterFormVariant;
  /** Email field and submit button in a column (button below input) instead of side-by-side from `sm` up. */
  stackButton?: boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  successFootnote?: string;
  /** Show Instagram / Facebook links below the form. Off in the footer (social is in the brand column). */
  showSocialLinks?: boolean;
}

const fieldClass =
  'rounded-none border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white';

export function NewsletterForm({
  className,
  variant = 'card',
  stackButton = false,
  title = 'Fresh chaos, in your inbox',
  description =
    'New memes, generator updates, and whatever we shipped last - sent when there is actually something to show off.',
  placeholder = 'your@email.here',
  buttonText = 'Send it',
  successFootnote = "You're subscribed. Your inbox officially has a meme problem now.",
  showSocialLinks = true,
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Try again later.');
        return;
      }

      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Try again later.');
    }
  };

  const disabled = status === 'loading' || status === 'success';

  const emailRow = (
    <div
      className={cn(
        'flex gap-3',
        stackButton ? 'flex-col' : 'flex-col sm:flex-row',
      )}
    >
      <Input
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={cn('flex-1', fieldClass)}
        required
        disabled={disabled}
        autoComplete="email"
      />
      <Button
        type="submit"
        disabled={disabled}
        className="whitespace-nowrap rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
      >
        {status === 'loading' ? '…' : status === 'success' ? "You're on the list." : buttonText}
      </Button>
    </div>
  );

  const feedback = (align: 'start' | 'center') => (
    <>
      {status === 'error' && errorMessage ? (
        <p
          className={cn(
            'mt-3 text-sm text-red-600 dark:text-red-400',
            align === 'center' && 'text-center',
          )}
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
      {status === 'success' ? (
        <p
          className={cn(
            'mt-3 text-sm text-gray-600 dark:text-gray-400',
            align === 'center' && 'text-center',
          )}
        >
          {successFootnote}
        </p>
      ) : null}
    </>
  );

  if (variant === 'bare') {
    if (!showSocialLinks) {
      return (
        <form onSubmit={handleSubmit} className={cn('w-full', className)}>
          {emailRow}
          {feedback('start')}
        </form>
      );
    }

    return (
      <div className={cn('w-full', className)}>
        <form onSubmit={handleSubmit}>
          {emailRow}
          {feedback('start')}
        </form>
        <NewsletterSocialLinks align="start" className="mt-3" />
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('w-full', className)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-6">
            <div className="flex-1 min-w-0 space-y-1 lg:max-w-md">
              <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">
                {title}
              </h3>
              {description ? (
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">{description}</p>
              ) : null}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:max-w-xl">{emailRow}</div>
          </div>
          {feedback('start')}
        </form>
        {showSocialLinks ? <NewsletterSocialLinks align="start" /> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-none border-2 border-zinc-700 dark:border-zinc-400 p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.75)] dark:shadow-[4px_4px_0px_rgba(156,163,175,0.35)]',
        className,
      )}
    >
      <div className="text-center mb-4">
        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {emailRow}
        {feedback('center')}
      </form>
      {showSocialLinks ? <NewsletterSocialLinks /> : null}
    </div>
  );
}
