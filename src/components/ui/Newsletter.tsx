'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/lib/utils';

interface NewsletterProps {
  className?: string;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({
  className,
  title = 'Meme spam, but legal',
  description =
    'Hand us your email and we might occasionally send something. Lower your expectations preemptively.',
  placeholder = 'your@email.here',
  buttonText = 'Sure, why not',
}) => {
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
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder={placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-none border-2 border-zinc-700 dark:border-zinc-400"
            required
            disabled={status === 'loading' || status === 'success'}
            autoComplete="email"
          />
          <Button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="whitespace-nowrap rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
          >
            {status === 'loading'
              ? '…'
              : status === 'success'
                ? "You're on the list."
                : buttonText}
          </Button>
        </div>
        {status === 'error' && errorMessage ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {status === 'success' ? (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
            If you change your mind, you can ignore us. We are used to it.
          </p>
        ) : null}
      </form>
    </div>
  );
};

export { Newsletter };
export type { NewsletterProps };
