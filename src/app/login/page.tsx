'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ICONS } from '@/lib/utils/categoryIcons';
import { cn } from '@/lib/utils';

/** Clyde mark (Discord’s standard wide logo); renders clearly at icon sizes vs. tiny 24×24 paths. */
function DiscordMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      aria-hidden
      focusable={false}
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.73,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.63,84.69,65.63Z" />
    </svg>
  );
}

/** Google “G” mark for branded sign-in (colors per Google brand guidelines). */
function GoogleGMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function safeNextParam(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = safeNextParam(searchParams.get('next'));
  const oauthError = searchParams.get('error') === 'oauth';

  const { signIn, signInWithGoogle, signInWithDiscord, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [discordSubmitting, setDiscordSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(next);
    }
  }, [user, authLoading, router, next]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailSubmitting(true);
    try {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err.message || 'Invalid email or password');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleSubmitting(true);
    try {
      const { error: err } = await signInWithGoogle(next);
      if (err) {
        setError(err.message || 'Could not start Google sign-in');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleDiscord = async () => {
    setError(null);
    setDiscordSubmitting(true);
    try {
      const { error: err } = await signInWithDiscord(next);
      if (err) {
        setError(err.message || 'Could not start Discord sign-in');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setDiscordSubmitting(false);
    }
  };

  const busy = emailSubmitting || googleSubmitting || discordSubmitting;

  if (authLoading) {
    return (
      <div className="bg-[#f7f4ee] dark:bg-gray-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] animate-pulse">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 w-3/4 mx-auto mb-4" />
          <div className="h-12 bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="bg-[#f7f4ee] dark:bg-gray-950 py-20 px-4 sm:px-6 flex flex-col items-center justify-start">
      <div className="w-full max-w-md">
        <h1 className="sr-only">Sign in</h1>

        <div className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] space-y-5">
          {(oauthError || error) && (
            <div
              className="border-2 border-red-700 dark:border-red-500 bg-red-50 dark:bg-red-950/40 px-4 py-3 flex gap-3"
              role="alert"
            >
              <ICONS.AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-red-900 dark:text-red-100">
                {error ??
                  (oauthError
                    ? 'Sign-in didn’t finish. Try Google or Discord again, or sign in with email.'
                    : '')}
              </p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleEmailSubmit} noValidate>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
            />
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
            />
            <Button
              type="submit"
              disabled={busy}
              className={cn(
                'w-full h-11 rounded-none border-2 border-zinc-700 dark:border-zinc-400',
                'uppercase tracking-wide font-bold'
              )}
            >
              {emailSubmitting ? 'Signing in…' : 'Sign in with email'}
            </Button>
          </form>

          <div className="relative flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-600" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Or
            </span>
            <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-600" aria-hidden />
          </div>

          {/* Google-branded button: light surface + multicolor mark (recognizable as Google OAuth). */}
          <button
            type="button"
            disabled={busy}
            onClick={handleGoogle}
            aria-label={googleSubmitting ? 'Opening Google sign-in' : 'Sign in with Google'}
            className={cn(
              'flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md border border-[#747775]',
              'bg-white px-4 text-sm font-medium text-[#1f1f1f] shadow-[0_1px_2px_rgba(0,0,0,0.08)]',
              'transition-colors hover:bg-[#f8f9fa] hover:shadow-[0_1px_3px_rgba(0,0,0,0.12)]',
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              // Keep Google’s recognizable light treatment in dark mode
              'dark:border-[#8e918f] dark:bg-white dark:text-[#1f1f1f] dark:hover:bg-[#f8f9fa]'
            )}
          >
            <GoogleGMark className="h-5 w-5 shrink-0" />
            <span>{googleSubmitting ? 'Redirecting…' : 'Sign in with Google'}</span>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={handleDiscord}
            aria-label={discordSubmitting ? 'Opening Discord sign-in' : 'Continue with Discord'}
            className={cn(
              'flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-md',
              'border border-[#4752c4] bg-[#5865f2] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)]',
              'transition-colors hover:bg-[#4752c4] hover:shadow-[0_1px_4px_rgba(0,0,0,0.18)]',
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <DiscordMark className="h-5 w-5 shrink-0" />
            <span>{discordSubmitting ? 'Redirecting…' : 'Continue with Discord'}</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/"
            className="inline-flex items-center font-bold uppercase tracking-wide text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300"
          >
            <ICONS.ArrowRight className="w-4 h-4 mr-2 rotate-180" aria-hidden />
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="bg-[#f7f4ee] dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 w-3/4 mx-auto mb-4" />
        <div className="h-12 bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageInner />
    </Suspense>
  );
}
