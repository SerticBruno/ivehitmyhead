import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get session ID from cookies
    const sessionId = request.cookies.get('meme-session-id')?.value;
    
    if (!sessionId) {
      // No session, return empty array
      return NextResponse.json({ likedMemes: [] });
    }

    console.log('Getting liked memes for session:', sessionId);

    // Get all memes that this user has liked
    const { data: likedMemes, error } = await supabaseAdmin
      .from('meme_likes')
      .select(`
        meme_id,
        memes!inner(slug)
      `)
      .eq('user_id', sessionId);

    if (error) {
      console.error('Error fetching liked memes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch liked memes' },
        { status: 500 }
      );
    }

    // Extract the slugs from the liked memes
    const likedSlugs = likedMemes.map(like => like.memes.slug);
    
    console.log('Found liked memes:', likedSlugs);

    return NextResponse.json({ 
      likedMemes: likedSlugs,
      sessionId 
    });

  } catch (error) {
    console.error('Error getting liked memes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
