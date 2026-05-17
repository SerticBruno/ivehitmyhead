import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/** Same-origin image proxy so the client can fetch pixels for clipboard copy without CORS. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const { data: meme, error } = await supabaseAdmin
      .from('memes')
      .select('image_url')
      .eq('slug', slug)
      .single();

    if (error || !meme?.image_url) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404 });
    }

    const imageResponse = await fetch(meme.image_url);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    const buffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error proxying meme image:', error);
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}
