import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    console.log('Fetching meme by slug:', slug);

    // Fetch meme by slug with related data
    const { data: meme, error } = await supabaseAdmin
      .from('memes')
      .select(`
        *,
        author:profiles(username, display_name, avatar_url),
        category:categories(name, emoji, description)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Meme not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Don't increment view count here - it's handled by the separate view endpoint
    // This prevents double-counting when the meme is fetched

    return NextResponse.json({
      success: true,
      meme
    });

  } catch (error) {
    console.error('Error fetching meme by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meme' },
      { status: 500 }
    );
  }
}
