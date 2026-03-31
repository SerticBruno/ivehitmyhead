'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ICONS } from '@/lib/utils/categoryIcons';
import { cn } from '@/lib/utils';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isAdmin, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message || 'Invalid email or password');
        return;
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] animate-pulse">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 w-3/4 mx-auto mb-4" />
          <div className="h-12 bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (user && isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950 py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center border-2 border-zinc-700 dark:border-zinc-400 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 mb-4 shadow-[4px_4px_0px_rgba(0,0,0,0.85)] dark:shadow-[4px_4px_0px_rgba(156,163,175,0.35)]">
            <Lock className="w-8 h-8" aria-hidden />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-2">
            Restricted
          </p>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
            Admin login
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to upload and manage content.
          </p>
        </div>

        <div className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="email"
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
                id="password"
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
            </div>

            {error && (
              <div
                className="border-2 border-red-700 dark:border-red-500 bg-red-50 dark:bg-red-950/40 px-4 py-3 flex gap-3"
                role="alert"
              >
                <ICONS.AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden />
                <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full h-11 rounded-none border-2 border-zinc-700 dark:border-zinc-400',
                'uppercase tracking-wide font-bold'
              )}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
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
