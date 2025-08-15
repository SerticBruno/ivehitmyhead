import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memeId = params.id;
    
    // For now, we'll use a placeholder user ID - implement proper auth later
    const userId = 'placeholder-user-id';

    // Check if user already liked the meme
    const { data: existingLike, error: checkError } = await supabaseAdmin
      .from('meme_likes')
      .select('id')
      .eq('meme_id', memeId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Unlike: remove the like
      const { error: deleteError } = await supabaseAdmin
        .from('meme_likes')
        .delete()
        .eq('meme_id', memeId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      return NextResponse.json({ liked: false });
    } else {
      // Like: add the like
      const { error: insertError } = await supabaseAdmin
        .from('meme_likes')
        .insert({
          meme_id: memeId,
          user_id: userId
        });

      if (insertError) throw insertError;

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
