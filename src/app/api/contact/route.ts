import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 8000;
const MAX_NAME = 120;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Contact form is not configured. Set RESEND_API_KEY.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const b = body as { name?: string; email?: string; message?: string; website?: string };

  if (typeof b.website === 'string' && b.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const name =
    typeof b.name === 'string' ? b.name.replace(/[\r\n]/g, ' ').trim().slice(0, MAX_NAME) : '';
  const email =
    typeof b.email === 'string' ? b.email.trim().toLowerCase().slice(0, 320) : '';
  const message =
    typeof b.message === 'string' ? b.message.trim().slice(0, MAX_MESSAGE) : '';

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: 'Message must be at least 10 characters' },
      { status: 400 },
    );
  }

  const to = process.env.RESEND_CONTACT_TO?.trim() || 'hello@ivehitmyhead.com';
  const from =
    process.env.RESEND_CONTACT_FROM?.trim() || 'IVEHITMYHEAD <onboarding@resend.dev>';

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email,
    subject: `[IVEHITMYHEAD] Message from ${name}`,
    html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p><strong>Message:</strong></p><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>`,
  });

  if (error) {
    console.error('Resend contact error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
