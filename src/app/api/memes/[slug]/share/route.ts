import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = supabaseAdmin;
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
