'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ICONS } from '@/lib/utils/categoryIcons';
import { cn } from '@/lib/utils';
import { resolvePostLoginPath } from '@/lib/auth/adminPaths';
import { UPDATE_PASSWORD_PATH } from '@/lib/auth/paths';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

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

function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = safeNextParam(searchParams.get('next'));
  const callbackError =
    searchParams.get('error') === 'oauth' || searchParams.get('error') === 'auth';

  const {
    signIn,
    signUp,
    resetPasswordForEmail,
    signInWithGoogle,
    signInWithDiscord,
    user,
    isAdmin,
    loading: authLoading,
  } = useAuth();

  const destination = useMemo(
    () => resolvePostLoginPath(next, isAdmin),
    [next, isAdmin]
  );

  const [panelMode, setPanelMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [discordSubmitting, setDiscordSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [signupNeedsEmailConfirmation, setSignupNeedsEmailConfirmation] = useState(false);
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const clearFormFields = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSignupUsername('');
    setShowSigninPassword(false);
    setShowSignupPassword(false);
    setShowSignupConfirmPassword(false);
  };

  useEffect(() => {
    if (searchParams.get('tab') === 'signup') {
      setPanelMode('signup');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(destination);
    }
  }, [user, authLoading, router, destination]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setEmailSubmitting(true);
    try {
      const { error: err, isAdmin: signedInAsAdmin } = await signIn(email, password);
      if (err) {
        setError(err.message || 'Invalid email or password');
        setEmailSubmitting(false);
        return;
      }
      router.replace(resolvePostLoginPath(next, signedInAsAdmin));
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setEmailSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSignupNeedsEmailConfirmation(false);

    const uname = normalizeUsername(signupUsername);
    if (!USERNAME_RE.test(uname)) {
      setError('Username must be 3–20 characters: lowercase letters, numbers, or underscore.');
      return;
    }

    const { data: taken } = await supabase.from('profiles').select('id').eq('username', uname).maybeSingle();
    if (taken) {
      setError('That username is already taken.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords don’t match.');
      return;
    }

    setEmailSubmitting(true);
    try {
      const { error: err, session } = await signUp(email, password, {
        username: uname,
        nextPath: next,
      });
      if (err) {
        setError(err.message || 'Could not create account.');
        setEmailSubmitting(false);
        return;
      }
      if (!session) {
        setSignupNeedsEmailConfirmation(true);
        setInfo('Check your email to confirm your account. After confirming, you can sign in.');
        setEmailSubmitting(false);
        return;
      }
      router.replace(destination);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setEmailSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    setResetSubmitting(true);
    try {
      const { error: err } = await resetPasswordForEmail(email, {
        redirectPath: UPDATE_PASSWORD_PATH,
      });
      if (err) {
        setError(err.message || 'Could not send reset email.');
        return;
      }
      setInfo(
        'If an account exists for that email, we sent a reset link. Check your inbox and spam folder.'
      );
      setShowForgot(false);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setInfo(null);
    setGoogleSubmitting(true);
    try {
      const { error: err } = await signInWithGoogle(destination);
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
    setInfo(null);
    setDiscordSubmitting(true);
    try {
      const { error: err } = await signInWithDiscord(destination);
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

  return (
    <div className="bg-[#f7f4ee] dark:bg-gray-950 py-8 px-4 sm:px-6 flex flex-col items-center justify-start">
      <div className="w-full max-w-md">
        <h1 className="sr-only">{panelMode === 'signin' ? 'Sign in' : 'Create account'}</h1>

        <div className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] space-y-5 [&_label]:cursor-pointer">
          <div
            className="flex rounded-none border-2 border-zinc-300 dark:border-zinc-600 p-0 overflow-hidden"
            role="tablist"
            aria-label="Sign in or create account"
          >
            <button
              type="button"
              role="tab"
              aria-selected={panelMode === 'signin'}
              onClick={() => {
                setPanelMode('signin');
                setError(null);
                setInfo(null);
                setSignupNeedsEmailConfirmation(false);
                setShowForgot(false);
                clearFormFields();
              }}
              className={cn(
                'flex-1 cursor-pointer py-3 text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors',
                panelMode === 'signin'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={panelMode === 'signup'}
              onClick={() => {
                setPanelMode('signup');
                setError(null);
                setInfo(null);
                setSignupNeedsEmailConfirmation(false);
                setShowForgot(false);
                clearFormFields();
              }}
              className={cn(
                'flex-1 cursor-pointer py-3 text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors',
                panelMode === 'signup'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              Create account
            </button>
          </div>

          {(callbackError || error) && (
            <div
              className="border-2 border-red-700 dark:border-red-500 bg-red-50 dark:bg-red-950/40 px-4 py-3 flex gap-3"
              role="alert"
            >
              <ICONS.AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-red-900 dark:text-red-100">
                {error ??
                  (callbackError
                    ? 'That link didn’t work or expired. Try again, sign in with email, or use Google or Discord.'
                    : '')}
              </p>
            </div>
          )}

          {info && !error && (
            <div className="border-2 border-green-700 dark:border-green-600 bg-green-50 dark:bg-green-950/30 px-4 py-3">
              <p className="text-sm text-green-900 dark:text-green-100">{info}</p>
            </div>
          )}

          {panelMode === 'signin' && showForgot ? (
            <form className="space-y-4" onSubmit={handleForgotSubmit} noValidate>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We’ll send a link to reset your password if this email has an account.
              </p>
              <Input
                id="forgot-email"
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
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={resetSubmitting || busy}
                  className={cn(
                    'h-11 rounded-none border-2 border-zinc-700 dark:border-zinc-400',
                    'uppercase tracking-wide font-bold'
                  )}
                >
                  {resetSubmitting ? 'Sending…' : 'Send reset link'}
                </Button>
                <button
                  type="button"
                  className="h-11 cursor-pointer px-3 text-sm font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300 underline"
                  onClick={() => {
                    setShowForgot(false);
                    setError(null);
                  }}
                >
                  Back
                </button>
              </div>
            </form>
          ) : panelMode === 'signin' ? (
            <>
              <form className="space-y-4" onSubmit={handleEmailSignIn} noValidate>
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
                <div className="space-y-1">
                  <div className="flex justify-between gap-2">
                    <label
                      htmlFor="login-password"
                      className="cursor-pointer text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-300 underline"
                      onClick={() => {
                        setShowForgot(true);
                        setError(null);
                        setInfo(null);
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      name="password"
                      type={showSigninPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSigninPassword((v) => !v)}
                      aria-label={showSigninPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showSigninPassword}
                      className="absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      tabIndex={0}
                    >
                      {showSigninPassword ? (
                        <ICONS.EyeOff className="w-5 h-5" aria-hidden />
                      ) : (
                        <ICONS.Eye className="w-5 h-5" aria-hidden />
                      )}
                    </button>
                  </div>
                </div>
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
            </>
          ) : signupNeedsEmailConfirmation ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              You’re almost done. Open the confirmation email to continue with sign in.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={handleSignup} noValidate>
              <Input
                id="signup-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                label="Username"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                placeholder="Username"
                className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
                3–20 characters: lowercase letters, numbers, underscore.
              </p>
              <Input
                id="signup-email"
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
              <div className="relative">
                <Input
                  id="signup-password"
                  name="password"
                  type={showSignupPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword((v) => !v)}
                  aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showSignupPassword}
                  className="absolute right-0 bottom-0 flex items-center px-3 h-10 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {showSignupPassword ? (
                    <ICONS.EyeOff className="w-5 h-5" aria-hidden />
                  ) : (
                    <ICONS.Eye className="w-5 h-5" aria-hidden />
                  )}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="signup-password-confirm"
                  name="password-confirm"
                  type={showSignupConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirmPassword((v) => !v)}
                  aria-label={showSignupConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showSignupConfirmPassword}
                  className="absolute right-0 bottom-0 flex items-center px-3 h-10 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {showSignupConfirmPassword ? (
                    <ICONS.EyeOff className="w-5 h-5" aria-hidden />
                  ) : (
                    <ICONS.Eye className="w-5 h-5" aria-hidden />
                  )}
                </button>
              </div>
              <Button
                type="submit"
                disabled={busy}
                className={cn(
                  'w-full h-11 rounded-none border-2 border-zinc-700 dark:border-zinc-400',
                  'uppercase tracking-wide font-bold'
                )}
              >
                {emailSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          )}

          {!showForgot && !(panelMode === 'signup' && signupNeedsEmailConfirmation) ? (
            <>
              <div className="relative flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-600" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Or
                </span>
                <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-600" aria-hidden />
              </div>

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
            </>
          ) : null}
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center font-bold uppercase tracking-wide text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-300"
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
