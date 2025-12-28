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
    // With Supabase joins, memes can be an array or object depending on the relationship
    const likedSlugs = (likedMemes || [])
      .map((like: { meme_id: string; memes: { slug: string } | { slug: string }[] }) => {
        // Handle both array and object cases
        if (Array.isArray(like.memes)) {
          return like.memes[0]?.slug;
        }
        return like.memes?.slug;
      })
      .filter((slug): slug is string => typeof slug === 'string');
    
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
