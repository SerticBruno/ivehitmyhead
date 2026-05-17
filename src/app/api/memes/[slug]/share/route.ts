import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = supabaseAdmin;
    const userSupabase = await createServerSupabase();
    const {
      data: { user },
    } = await userSupabase.auth.getUser();
    const { slug } = await params;

    // First, get the meme to check if it exists
    const { data: meme, error: fetchError } = await supabase
      .from('memes')
      .select('id, shares_count')
      .eq('slug', slug)
      .single();

    if (fetchError || !meme) {
      return NextResponse.json(
        { error: 'Meme not found' },
        { status: 404 }
      );
    }

    // Update the shares count
    const { data: updatedMeme, error: updateError } = await supabase
      .from('memes')
      .update({ 
        shares_count: meme.shares_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', meme.id)
      .select('shares_count')
      .single();

    if (updateError) {
      console.error('Error updating shares count:', updateError);
      return NextResponse.json(
        { error: 'Failed to update shares count' },
        { status: 500 }
      );
    }

    if (user) {
      const { error: shareInsertError } = await supabase
        .from('meme_shares')
        .upsert(
          {
            meme_id: meme.id,
            user_id: user.id,
          },
          { onConflict: 'meme_id,user_id' }
        );

      if (shareInsertError) {
        console.error('Error recording user share history:', shareInsertError);
      }
    }

    return NextResponse.json({
      success: true,
      shares_count: updatedMeme.shares_count
    });

  } catch (error) {
    console.error('Error recording share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
