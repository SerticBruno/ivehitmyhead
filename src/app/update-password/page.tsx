'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { UPDATE_PASSWORD_PATH } from '@/lib/auth/paths';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ICONS } from '@/lib/utils/categoryIcons';
import { cn } from '@/lib/utils';

function UpdatePasswordLoading() {
  return (
    <div className="bg-[#f7f4ee] dark:bg-gray-950 flex items-center justify-center px-4 py-12 min-h-[50vh]">
      <div className="w-full max-w-md border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 w-3/4 mx-auto mb-4" />
        <div className="h-12 bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryFlow(true);
        setSessionChecked(true);
      } else if (session?.user) {
        setSessionChecked(true);
      }
    });

    async function establishSession() {
      const code = searchParams.get('code');
      const tokenHash = searchParams.get('token_hash');
      const otpType = searchParams.get('type');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exchangeError) {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            router.replace(`/login?next=${encodeURIComponent(UPDATE_PASSWORD_PATH)}`);
            return;
          }
        } else {
          setIsRecoveryFlow(true);
        }
        router.replace(UPDATE_PASSWORD_PATH);
        setSessionChecked(true);
        return;
      }

      if (tokenHash && otpType === 'recovery') {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: 'recovery',
          token_hash: tokenHash,
        });
        if (cancelled) return;
        if (verifyError) {
          router.replace(`/login?next=${encodeURIComponent(UPDATE_PASSWORD_PATH)}`);
          return;
        }
        setIsRecoveryFlow(true);
        router.replace(UPDATE_PASSWORD_PATH);
        setSessionChecked(true);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        setSessionChecked(true);
        return;
      }

      router.replace(`/login?next=${encodeURIComponent(UPDATE_PASSWORD_PATH)}`);
    }

    void establishSession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

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

  const waitingForSession = authLoading || !sessionChecked;
  const canShowForm = sessionChecked && user;

  if (waitingForSession || !canShowForm) {
    return <UpdatePasswordLoading />;
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
          {isRecoveryFlow ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You opened a password reset link. Enter a new password below.
            </p>
          ) : null}
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
            <PasswordInput
              id="new-password"
              name="password"
              autoComplete="new-password"
              required
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
            />
            <PasswordInput
              id="confirm-password"
              name="confirm-password"
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

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<UpdatePasswordLoading />}>
      <UpdatePasswordForm />
    </Suspense>
  );
}
