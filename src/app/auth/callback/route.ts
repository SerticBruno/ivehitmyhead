import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerSupabase } from '@/lib/supabase/server';

function safeNextPath(next: string | null, origin: string): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return '/';
  }
  // Disallow redirect to another origin via encoded tricks
  try {
    const u = new URL(next, origin);
    if (u.origin !== new URL(origin).origin) return '/';
  } catch {
    return '/';
  }
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'), origin);

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const redirectUrl = `${origin}${next}`;
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createRouteHandlerSupabase(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        username: user.email?.split('@')[0] ?? user.id.slice(0, 8),
        display_name: (user.user_metadata?.full_name as string | undefined) ?? null,
        avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );
    if (profileError) {
      console.warn('[auth/callback] profile bootstrap:', profileError.message);
    }
  }

  return response;
}
