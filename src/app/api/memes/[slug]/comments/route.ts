import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Get comments for a meme
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const memeId = slug;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const offset = (page - 1) * limit;

    const { data: comments, error, count } = await supabaseAdmin
      .from('meme_comments')
      .select(`
        *,
        author:profiles(username, display_name, avatar_url)
      `)
      .eq('meme_id', memeId)
      .is('parent_id', null) // Only top-level comments
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get replies for each comment
    if (comments) {
      for (const comment of comments) {
        const { data: replies } = await supabaseAdmin
          .from('meme_comments')
          .select(`
            *,
            author:profiles(username, display_name, avatar_url)
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true });

        comment.replies = replies || [];
      }
    }

    return NextResponse.json({
      comments: comments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_more: page * limit < (count || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const memeId = slug;
    const { content, parent_id } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // For now, we'll use a placeholder user ID - implement proper auth later
    const userId = 'placeholder-user-id';

    const { data: comment, error } = await supabaseAdmin
      .from('meme_comments')
      .insert({
        meme_id: memeId,
        author_id: userId,
        content,
        parent_id: parent_id || null
      })
      .select(`
        *,
        author:profiles(username, display_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
