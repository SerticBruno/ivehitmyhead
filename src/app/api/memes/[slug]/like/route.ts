import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('Like request for slug:', slug);
    
    // First, get the meme ID and likes count from the slug
    const { data: meme, error: memeError } = await supabaseAdmin
      .from('memes')
      .select('id, likes_count')
      .eq('slug', slug)
      .single();
    
    if (memeError || !meme) {
      console.error('Meme fetch error:', memeError);
      return NextResponse.json(
        { error: 'Meme not found' },
        { status: 404 }
      );
    }
    
    const memeId = meme.id;
    console.log('Found meme ID:', memeId, 'with likes count:', meme.likes_count);
    
    // Get session ID from cookies or generate one
    const sessionId = request.cookies.get('meme-session-id')?.value || 
                     `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Using session ID:', sessionId);

    // Check if user already liked the meme using session ID
    const { data: existingLike, error: checkError } = await supabaseAdmin
      .from('meme_likes')
      .select('id')
      .eq('meme_id', memeId)
      .eq('user_id', sessionId)
      .single();

    console.log('Check existing like result:', { existingLike, checkError });

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing like:', checkError);
      throw checkError;
    }

    if (existingLike) {
      console.log('Removing existing like');
      // Unlike: remove the like
      const { error: deleteError } = await supabaseAdmin
        .from('meme_likes')
        .delete()
        .eq('meme_id', memeId)
        .eq('user_id', sessionId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Update the meme's likes count (ensure it doesn't go negative)
      const newLikeCount = Math.max(0, meme.likes_count - 1);
      const { error: updateError } = await supabaseAdmin
        .from('memes')
        .update({ likes_count: newLikeCount })
        .eq('id', memeId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      const response = NextResponse.json({ liked: false });
      response.cookies.set('meme-session-id', sessionId, { 
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      return response;
    } else {
      console.log('Adding new like');
      // Like: add the like
      const { error: insertError } = await supabaseAdmin
        .from('meme_likes')
        .insert({
          meme_id: memeId,
          user_id: sessionId
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      // Update the meme's likes count
      const { error: updateError } = await supabaseAdmin
        .from('memes')
        .update({ likes_count: meme.likes_count + 1 })
        .eq('id', memeId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      const response = NextResponse.json({ liked: true });
      response.cookies.set('meme-session-id', sessionId, { 
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      return response;
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    
    // Extract error message from various error types
    let errorMessage = 'Unknown error';
    let errorDetails: any = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    } else if (typeof error === 'object' && error !== null) {
      // Handle Supabase errors or other object errors
      const errorObj = error as any;
      errorMessage = errorObj.message || errorObj.error || errorObj.details || 'Unknown error';
      errorDetails = {
        code: errorObj.code,
        message: errorObj.message,
        details: errorObj.details,
        hint: errorObj.hint
      };
    }
    
    console.error('Error details:', {
      errorMessage,
      errorDetails,
      errorType: typeof error,
      error
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to toggle like',
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
