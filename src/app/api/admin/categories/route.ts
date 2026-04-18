import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminAuth } from '@/lib/utils/auth';

function parseJsonBody(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user: authUser, error: authError } = await verifyAdminAuth(request);
    if (authError || !authUser) {
      return NextResponse.json(
        { error: authError || 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const raw = await request.text();
    const body = parseJsonBody(raw);
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const name =
      typeof (body as { name?: unknown }).name === 'string'
        ? (body as { name: string }).name.trim()
        : '';
    const emoji =
      typeof (body as { emoji?: unknown }).emoji === 'string'
        ? (body as { emoji: string }).emoji.trim()
        : '';
    const descriptionRaw = (body as { description?: unknown }).description;
    const description =
      typeof descriptionRaw === 'string' ? descriptionRaw.trim() : '';

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    if (name.length > 80) {
      return NextResponse.json(
        { error: 'Category name must be 80 characters or fewer' },
        { status: 400 }
      );
    }
    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji is required' },
        { status: 400 }
      );
    }
    if (emoji.length > 16) {
      return NextResponse.json(
        { error: 'Emoji must be 16 characters or fewer' },
        { status: 400 }
      );
    }
    if (description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or fewer' },
        { status: 400 }
      );
    }

    const { data: category, error: insertError } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        emoji,
        description: description || null,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create category', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating category:', error);
    return NextResponse.json(
      {
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
