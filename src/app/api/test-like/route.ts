import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Test inserting a like
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('meme_likes')
      .insert({
        meme_id: 'aef70970-1e01-4c71-8bf2-960bce3114d3', // Use the meme ID from your test
        user_id: 'test-session-123'
      })
      .select();

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        details: insertError.message
      }, { status: 500 });
    }

    // Test reading the like
    const { data: readData, error: readError } = await supabaseAdmin
      .from('meme_likes')
      .select('*')
      .eq('meme_id', 'aef70970-1e01-4c71-8bf2-960bce3114d3')
      .eq('user_id', 'test-session-123');

    if (readError) {
      return NextResponse.json({
        success: false,
        error: 'Read failed',
        details: readError.message
      }, { status: 500 });
    }

    // Test deleting the like
    const { error: deleteError } = await supabaseAdmin
      .from('meme_likes')
      .delete()
      .eq('id', insertData[0].id);

    if (deleteError) {
      return NextResponse.json({
        success: false,
        error: 'Delete failed',
        details: deleteError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Like functionality test passed',
      insertData,
      readData
    });

  } catch (error) {
    console.error('Test like error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
