import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabase } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { UPDATE_PASSWORD_PATH } from '@/lib/auth/paths';

function safeNextPath(next: string | null, origin: string): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/';
  }
  try {
    const u = new URL(next, origin);
    if (u.origin !== new URL(origin).origin) return '/';
  } catch {
    return '/';
  }
  return next;
}

function profileUsernameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
  id: string;
}) {
  const meta = user.user_metadata?.username;
  const fromMeta =
    typeof meta === 'string' && meta.trim() ? meta.trim() : null;
  const fromEmail =
    user.email?.split('@')[0]?.trim() ||
    user.id.replace(/-/g, '').slice(0, 8);
  return fromMeta ?? fromEmail;
}

/** Valid values from email templates (signup, recovery, etc.). */
function parseOtpType(raw: string): EmailOtpType | null {
  const allowed = new Set<EmailOtpType>([
    'signup',
    'invite',
    'magiclink',
    'recovery',
    'email_change',
    'email',
  ]);
  return allowed.has(raw as EmailOtpType) ? (raw as EmailOtpType) : null;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const otpTypeRaw = searchParams.get('type');
  const isRecovery = otpTypeRaw === 'recovery';
  const next = isRecovery
    ? UPDATE_PASSWORD_PATH
    : safeNextPath(searchParams.get('next'), origin);
  const redirectUrl = `${origin}${next}`;
  const response = NextResponse.redirect(redirectUrl);
  const loginErrorUrl = `${origin}/login?error=auth&next=${encodeURIComponent(next)}`;

  const supabase = createRouteHandlerSupabase(request, response);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && next === UPDATE_PASSWORD_PATH) {
        return response;
      }
      return NextResponse.redirect(loginErrorUrl);
    }
  } else if (token_hash && otpTypeRaw) {
    const otpType = parseOtpType(otpTypeRaw);
    if (!otpType) {
      return NextResponse.redirect(loginErrorUrl);
    }
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash,
    });
    if (error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && next === UPDATE_PASSWORD_PATH) {
        return response;
      }
      return NextResponse.redirect(loginErrorUrl);
    }
  } else {
    return NextResponse.redirect(loginErrorUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const username = profileUsernameFromUser(user);
    const fullName = user.user_metadata?.full_name;
    const avatarUrl = user.user_metadata?.avatar_url;
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        username,
        display_name: typeof fullName === 'string' ? fullName : null,
        avatar_url: typeof avatarUrl === 'string' ? avatarUrl : null,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (profileError) {
      console.warn('[auth/callback] profile bootstrap:', profileError.message);
    }
  }

  return response;
}
