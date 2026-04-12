'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

type ContactFormProps = {
  className?: string;
  /** Extra wrapper classes around the form fields (e.g. brutalist frame on About). */
  innerClassName?: string;
};

export function ContactForm({ className, innerClassName }: ContactFormProps) {
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          website: honeypotRef.current?.value ?? '',
        }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setErrorMessage(data.error || 'Something went wrong');
        setStatus('error');
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setErrorMessage('Network error — try again in a moment');
      setStatus('error');
    }
  };

  const fieldClass =
    'rounded-none border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-white';

  return (
    <div className={cn('w-full max-w-xl mx-auto text-left', className)}>
      <form onSubmit={handleSubmit} className={cn('space-y-4', innerClassName)}>
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
          aria-hidden
        />

        <Input
          label="Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          autoComplete="name"
          className={fieldClass}
        />

        <Input
          type="email"
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={320}
          autoComplete="email"
          className={fieldClass}
        />

        <div className="w-full">
          <label
            htmlFor="contact-message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
            maxLength={8000}
            rows={5}
            className={cn(
              'flex w-full px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300 disabled:opacity-50',
              fieldClass,
            )}
            placeholder="Bug reports, ideas, or a simple hello…"
          />
        </div>

        {status === 'error' && errorMessage ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {status === 'success' ? (
          <p className="text-sm text-green-700 dark:text-green-400 font-medium" role="status">
            Sent — thanks! I&apos;ll get back to you when I can.
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={status === 'sending'}
          className="w-full sm:w-auto rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </Button>
      </form>
    </div>
  );
}
