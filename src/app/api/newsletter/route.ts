import { NextRequest, NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email =
    typeof (body as { email?: string })?.email === 'string'
      ? (body as { email: string }).email.trim().toLowerCase()
      : '';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const brevoKey = process.env.BREVO_API_KEY?.trim();
  const brevoListRaw = process.env.BREVO_NEWSLETTER_LIST_ID?.trim();
  if (brevoKey && brevoListRaw) {
    const listId = Number(brevoListRaw);
    if (!Number.isFinite(listId) || listId < 1) {
      console.error('Brevo: invalid BREVO_NEWSLETTER_LIST_ID');
      return NextResponse.json({ error: 'Newsletter is misconfigured.' }, { status: 503 });
    }

    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevoKey,
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Brevo newsletter error:', res.status, text);
      return NextResponse.json({ error: 'Signup failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  }

  const webhook = process.env.NEWSLETTER_SIGNUP_WEBHOOK_URL;
  if (webhook) {
    const secret = process.env.NEWSLETTER_WEBHOOK_SECRET;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (secret) {
      headers.Authorization = `Bearer ${secret}`;
    }
    const res = await fetch(webhook, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      console.error('Newsletter webhook error:', res.status, await res.text());
      return NextResponse.json({ error: 'Signup failed' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (resendKey && audienceId) {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Resend audience error:', res.status, text);
      return NextResponse.json({ error: 'Signup failed' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    {
      error:
        'Newsletter is not configured. Set BREVO_API_KEY + BREVO_NEWSLETTER_LIST_ID, or NEWSLETTER_SIGNUP_WEBHOOK_URL, or RESEND_API_KEY + RESEND_AUDIENCE_ID.',
    },
    { status: 503 },
  );
}
