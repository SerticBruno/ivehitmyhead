'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ICONS } from '@/lib/utils/categoryIcons';
import { cn } from '@/lib/utils';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?next=%2Fupdate-password');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords don’t match.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await updatePassword(password);
      if (err) {
        setError(err.message || 'Could not update password.');
        return;
      }
      router.replace('/profile');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="bg-[#f7f4ee] dark:bg-gray-950 flex items-center justify-center px-4 py-12 min-h-[50vh]">
        <div className="w-full max-w-md border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] animate-pulse">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 w-3/4 mx-auto mb-4" />
          <div className="h-12 bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f4ee] dark:bg-gray-950 py-20 px-4 sm:px-6 flex flex-col items-center justify-start min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="sr-only">Set new password</h1>
        <div className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] space-y-5">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
            Account
          </p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
            Choose a new password
          </h2>
          {error && (
            <div
              className="border-2 border-red-700 dark:border-red-500 bg-red-50 dark:bg-red-950/40 px-4 py-3 flex gap-3"
              role="alert"
            >
              <ICONS.AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
            />
            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              label="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
            />
            <Button
              type="submit"
              disabled={submitting}
              className={cn(
                'w-full h-11 rounded-none border-2 border-zinc-700 dark:border-zinc-400',
                'uppercase tracking-wide font-bold'
              )}
            >
              {submitting ? 'Saving…' : 'Update password'}
            </Button>
          </form>
        </div>
        <p className="mt-8 text-center text-sm">
          <Link
            href="/profile"
            className="inline-flex items-center font-bold uppercase tracking-wide text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300"
          >
            <ICONS.ArrowRight className="w-4 h-4 mr-2 rotate-180" aria-hidden />
            Profile
          </Link>
        </p>
      </div>
    </div>
  );
}
