import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyAdminAuth } from '@/lib/utils/auth';
import cloudinary from '@/lib/cloudinary/config';

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

