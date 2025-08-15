import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category_id = searchParams.get('category_id');
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const search = searchParams.get('search');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('memes')
      .select(`
        *,
        author:profiles(username, display_name, avatar_url),
        category:categories(name, emoji)
      `);

    // Apply filters
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Apply sorting
    if (sort_by === 'likes') {
      query = query.order('likes_count', { ascending: sort_order === 'asc' });
    } else if (sort_by === 'views') {
      query = query.order('views', { ascending: sort_order === 'asc' });
    } else if (sort_by === 'comments') {
      query = query.order('comments_count', { ascending: sort_order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: sort_order === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: memes, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    let totalCount = 0;
    if (count === null) {
      const { count: total } = await supabaseAdmin
        .from('memes')
        .select('*', { count: 'exact', head: true });
      totalCount = total || 0;
    } else {
      totalCount = count;
    }

    return NextResponse.json({
      memes: memes || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit),
        has_more: page * limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching memes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memes' },
      { status: 500 }
    );
  }
}
