'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { markBudasevoSignOutInProgress } from '@/lib/auth/budasevoSignOut';
import { UPDATE_PASSWORD_PATH, updatePasswordRedirectUrl } from '@/lib/auth/paths';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; isAdmin: boolean }>;
  signUp: (
    email: string,
    password: string,
    options: { username: string; nextPath: string }
  ) => Promise<{ error: Error | null; session: Session | null }>;
  resetPasswordForEmail: (
    email: string,
    options: { redirectPath: string }
  ) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: (next?: string) => Promise<{ error: Error | null }>;
  signInWithDiscord: (next?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const authReadyRef = { current: false };

    const finishInitialLoad = () => {
      if (!cancelled) {
        setLoading(false);
        authReadyRef.current = true;
      }
    };

    const syncSession = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      await checkAdminStatus(session?.user ?? null);
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) {
        setLoading(true);
      }
      void syncSession(session).then(finishInitialLoad);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== UPDATE_PASSWORD_PATH) {
          window.location.assign(UPDATE_PASSWORD_PATH);
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        finishInitialLoad();
        return;
      }

      // Background sync (tab focus / token refresh / multi-tab) — never flash loading UI.
      if (
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION' ||
        event === 'USER_UPDATED'
      ) {
        void syncSession(session);
        return;
      }

      if (event === 'SIGNED_IN') {
        void syncSession(session);
        if (!authReadyRef.current && !cancelled) {
          finishInitialLoad();
        }
        return;
      }

      void syncSession(session);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (user: User | null): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      return false;
    }

    const isAdminFromMetadata = user.user_metadata?.role === 'admin';

    if (isAdminFromMetadata) {
      setIsAdmin(true);
      return true;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) {
        const errorCode = profileError.code?.toString();
        if (errorCode === '42703' || profileError.message?.includes('does not exist')) {
          setIsAdmin(isAdminFromMetadata);
          return isAdminFromMetadata;
        }
      }

      if (!profileError && profile) {
        const admin = profile.is_admin === true;
        setIsAdmin(admin);
        return admin;
      }

      setIsAdmin(isAdminFromMetadata);
      return isAdminFromMetadata;
    } catch {
      setIsAdmin(isAdminFromMetadata);
      return isAdminFromMetadata;
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null; isAdmin: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error, isAdmin: false };
      }

      const admin = data.user ? await checkAdminStatus(data.user) : false;
      return { error: null, isAdmin: admin };
    } catch (error) {
      return { error: error as Error, isAdmin: false };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    options: { username: string; nextPath: string }
  ): Promise<{ error: Error | null; session: Session | null }> => {
    try {
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(options.nextPath)}`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
          data: {
            username: options.username,
          },
        },
      });

      if (error) {
        return { error, session: null };
      }

      if (data.session && data.user) {
        await checkAdminStatus(data.user);
      }

      return { error: null, session: data.session ?? null };
    } catch (error) {
      return { error: error as Error, session: null };
    }
  };

  const resetPasswordForEmail = async (
    email: string,
    options: { redirectPath: string }
  ): Promise<{ error: Error | null }> => {
    try {
      const redirectTo =
        options.redirectPath === UPDATE_PASSWORD_PATH
          ? updatePasswordRedirectUrl(window.location.origin)
          : `${window.location.origin}/auth/callback?next=${encodeURIComponent(options.redirectPath)}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      return { error: error ?? null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error ?? null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ error: Error | null }> => {
    try {
      const email = user?.email;
      if (!email) {
        return { error: new Error('No email on this account.') };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        return { error: new Error('Current password is incorrect.') };
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error ?? null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithOAuthProvider = async (
    provider: 'google' | 'discord',
    next = '/'
  ): Promise<{ error: Error | null }> => {
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      return { error: error ?? null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = (next = '/') => signInWithOAuthProvider('google', next);
  const signInWithDiscord = (next = '/') => signInWithOAuthProvider('discord', next);

  const signOut = async () => {
    const leaveBudasevoForHome =
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/budasevo');

    if (leaveBudasevoForHome) {
      markBudasevoSignOutInProgress();
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);

    if (leaveBudasevoForHome) {
      window.location.replace('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        resetPasswordForEmail,
        updatePassword,
        changePassword,
        signInWithGoogle,
        signInWithDiscord,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
