import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // First, get the meme ID from the slug
    const { data: meme, error: memeError } = await supabaseAdmin
      .from('memes')
      .select('id, views')
      .eq('slug', slug)
      .single();
    
    if (memeError || !meme) {
      return NextResponse.json(
        { error: 'Meme not found' },
        { status: 404 }
      );
    }
    
    const memeId = meme.id;
    
    // Get IP address and user agent
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // For now, we'll use a placeholder user ID - implement proper auth later
    const userId = null; // Anonymous view

    // Record the view
    const { error } = await supabaseAdmin
      .from('meme_views')
      .insert({
        meme_id: memeId,
        user_id: userId,
        ip_address: ip,
        user_agent: userAgent
      });

    if (error) throw error;

    // Update the meme's view count
    const { error: updateError } = await supabaseAdmin
      .from('memes')
      .update({ views: meme.views + 1 })
      .eq('id', memeId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording view:', error);
    // Don't fail the request if view tracking fails
    return NextResponse.json({ success: false });
  }
}
