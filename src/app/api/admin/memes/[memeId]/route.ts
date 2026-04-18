import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminAuth } from '@/lib/utils/auth';
import cloudinary from '@/lib/cloudinary/config';

const MEME_ADMIN_SELECT =
  '*, author:profiles(username, display_name, avatar_url), category:categories(id, name)';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ memeId: string }> }
) {
  try {
    const { user: authUser, error: authError } = await verifyAdminAuth(request);
    if (authError || !authUser) {
      return NextResponse.json(
        { error: authError || 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { memeId } = await context.params;
    if (!memeId) {
      return NextResponse.json({ error: 'Missing meme id' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!('category_id' in body)) {
      return NextResponse.json(
        { error: 'category_id is required (use null for uncategorized)' },
        { status: 400 }
      );
    }

    const raw = (body as { category_id: unknown }).category_id;
    let categoryId: string | null;
    if (raw === null) {
      categoryId = null;
    } else if (typeof raw === 'string') {
      const trimmed = raw.trim();
      categoryId = trimmed === '' ? null : trimmed;
    } else {
      return NextResponse.json(
        { error: 'category_id must be a string UUID or null' },
        { status: 400 }
      );
    }

    if (categoryId !== null) {
      if (!isUuid(categoryId)) {
        return NextResponse.json(
          { error: 'category_id must be a valid UUID' },
          { status: 400 }
        );
      }
      const { data: cat, error: catError } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('id', categoryId)
        .maybeSingle();

      if (catError) {
        return NextResponse.json(
          { error: 'Failed to verify category', details: catError.message },
          { status: 500 }
        );
      }
      if (!cat) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('memes')
      .select('id')
      .eq('id', memeId)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to look up meme', details: fetchError.message },
        { status: 500 }
      );
    }
    if (!existing) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 });
    }

    const { data: meme, error: updateError } = await supabaseAdmin
      .from('memes')
      .update({
        category_id: categoryId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memeId)
      .select(MEME_ADMIN_SELECT)
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update meme', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, meme });
  } catch (error) {
    console.error('Unexpected error updating meme:', error);
    return NextResponse.json(
      {
        error: 'Failed to update meme',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ memeId: string }> }
) {
  try {
    const { user: authUser, error: authError } = await verifyAdminAuth(request);
    if (authError || !authUser) {
      return NextResponse.json(
        { error: authError || 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { memeId } = await context.params;
    if (!memeId) {
      return NextResponse.json({ error: 'Missing meme id' }, { status: 400 });
    }

    const { data: meme, error: fetchError } = await supabaseAdmin
      .from('memes')
      .select('id, cloudinary_public_id')
      .eq('id', memeId)
      .single();

    if (fetchError || !meme) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 });
    }

    if (meme.cloudinary_public_id) {
      try {
        await cloudinary.uploader.destroy(meme.cloudinary_public_id);
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('memes')
      .delete()
      .eq('id', memeId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete meme', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting meme:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete meme',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

