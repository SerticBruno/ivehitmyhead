'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const isAdminFromMetadata = user.user_metadata?.role === 'admin';

    if (isAdminFromMetadata) {
      setIsAdmin(true);
      return;
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
          return;
        }
      }

      if (!profileError && profile) {
        setIsAdmin(profile.is_admin === true);
      } else {
        setIsAdmin(isAdminFromMetadata);
      }
    } catch {
      setIsAdmin(isAdminFromMetadata);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await checkAdminStatus(data.user);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
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
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(options.redirectPath)}`;
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
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
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
