'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ICONS } from '@/lib/utils/categoryIcons';
import { cn } from '@/lib/utils';

import { UPDATE_PASSWORD_PATH } from '@/lib/auth/paths';

type ProfileAccountSettingsProps = {
  userEmail: string;
};

export function ProfileAccountSettings({ userEmail }: ProfileAccountSettingsProps) {
  const { changePassword, resetPasswordForEmail } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!currentPassword.trim()) {
      setError('Enter your current password.');
      return;
    }
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
      const { error: err } = await changePassword(currentPassword, password);
      if (err) {
        setError(err.message || 'Could not update password.');
        return;
      }
      setCurrentPassword('');
      setPassword('');
      setConfirm('');
      setSuccess('Password updated.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendResetEmail = async () => {
    setResetNotice(null);
    setResetError(null);
    setResetSending(true);
    try {
      const { error: err } = await resetPasswordForEmail(userEmail, {
        redirectPath: UPDATE_PASSWORD_PATH,
      });
      if (err) {
        setResetError(err.message || 'Could not send reset email.');
        return;
      }
      setResetNotice('Check your email for a password reset link.');
    } catch {
      setResetError('An unexpected error occurred. Please try again.');
    } finally {
      setResetSending(false);
    }
  };

  if (!userEmail) {
    return (
      <section
        className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]"
        aria-label="Account security"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-2">
          Account security
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No email is associated with this account, so password changes are not available here.
        </p>
      </section>
    );
  }

  return (
    <section
      className="border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]"
      aria-label="Account security"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-2">
        Account security
      </p>
      <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-1">
        Change password
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-all">
        Signed in as <span className="font-medium text-gray-900 dark:text-gray-200">{userEmail}</span>
      </p>

      <form className="space-y-4 max-w-md" onSubmit={handleSubmit} noValidate>
        {(error || success) && (
          <div
            className={cn(
              'border-2 px-4 py-3 flex gap-3',
              error
                ? 'border-red-700 dark:border-red-500 bg-red-50 dark:bg-red-950/40'
                : 'border-green-700 dark:border-green-600 bg-green-50 dark:bg-green-950/30'
            )}
            role="status"
          >
            {error ? (
              <>
                <ICONS.AlertCircle
                  className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                  aria-hidden
                />
                <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
              </>
            ) : (
              <p className="text-sm text-green-900 dark:text-green-100">{success}</p>
            )}
          </div>
        )}
        <PasswordInput
          id="profile-current-password"
          name="current-password"
          autoComplete="current-password"
          required
          label="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
        />
        <PasswordInput
          id="profile-new-password"
          name="new-password"
          autoComplete="new-password"
          required
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
        />
        <PasswordInput
          id="profile-confirm-password"
          name="confirm-password"
          autoComplete="new-password"
          required
          label="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          className="rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400"
        />
        <Button
          type="submit"
          disabled={submitting}
          className={cn(
            'h-11 rounded-none border-2 border-zinc-700 dark:border-zinc-400',
            'uppercase tracking-wide font-bold'
          )}
        >
          {submitting ? 'Saving…' : 'Update password'}
        </Button>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Forgot your current password?{' '}
          <button
            type="button"
            onClick={handleSendResetEmail}
            disabled={resetSending}
            className="font-bold text-gray-900 dark:text-white underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-60 cursor-pointer"
          >
            {resetSending ? 'Sending…' : 'Reset password'}
          </button>
        </p>
        {resetError ? (
          <p className="text-sm text-red-700 dark:text-red-300" role="alert">
            {resetError}
          </p>
        ) : null}
        {resetNotice ? (
          <p className="text-sm text-green-800 dark:text-green-200" role="status">
            {resetNotice}
          </p>
        ) : null}
      </form>
    </section>
  );
}
