import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Test if meme_likes table exists
    const { data: likesTest, error: likesError } = await supabaseAdmin
      .from('meme_likes')
      .select('*')
      .limit(1);
    
    // Test if memes table has the right structure
    const { data: memesTest, error: memesError } = await supabaseAdmin
      .from('memes')
      .select('id, slug, likes_count')
      .limit(1);

    // Test inserting a like (this will fail if table doesn't exist or has wrong structure)
    const testMeme = memesTest?.[0];
    if (testMeme) {
      const { data: insertTest, error: insertError } = await supabaseAdmin
        .from('meme_likes')
        .insert({
          meme_id: testMeme.id,
          user_id: 'test-user-123'
        })
        .select();

      // Clean up test data
      if (insertTest?.[0]) {
        await supabaseAdmin
          .from('meme_likes')
          .delete()
          .eq('id', insertTest[0].id);
      }

      return NextResponse.json({
        success: true,
        meme_likes_exists: !likesError,
        memes_structure: !memesError ? 'OK' : memesError.message,
        insert_test: !insertError ? 'OK' : insertError.message,
        sample_meme: testMeme,
        sample_likes: likesTest
      });
    }

    return NextResponse.json({
      success: false,
      meme_likes_exists: !likesError,
      memes_structure: !memesError ? 'OK' : memesError.message,
      error: 'No memes found to test with'
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
