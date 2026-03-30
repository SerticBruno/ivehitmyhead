import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getMemeTimePeriodStart } from '@/lib/utils/memeTimePeriod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category_id = searchParams.get('category_id');
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const time_period = searchParams.get('time_period');
    const search = searchParams.get('search');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('memes')
      .select(`
        *,
        author:profiles(username, display_name, avatar_url),
        category:categories(id, name, emoji)
      `);

    // Apply filters
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Apply time period filter (rolling: last 24h / 7d / 30d)
    const periodStart = getMemeTimePeriodStart(time_period);
    if (periodStart) {
      query = query.gte('created_at', periodStart.toISOString());
    }

    // Apply primary sorting with proper tie-breaking
    if (sort_by === 'likes') {
      // Sort by likes first, then views as tie-breaker, then date as final tie-breaker
      query = query.order('likes_count', { ascending: sort_order === 'asc' });
      query = query.order('views', { ascending: false }); // Always descending for views as tie-breaker
      query = query.order('created_at', { ascending: false }); // Always descending for date as final tie-breaker
    } else if (sort_by === 'views') {
      // Sort by views first, then likes as tie-breaker, then date as final tie-breaker
      query = query.order('views', { ascending: sort_order === 'asc' });
      query = query.order('likes_count', { ascending: false }); // Always descending for likes as tie-breaker
      query = query.order('created_at', { ascending: false }); // Always descending for date as final tie-breaker
    } else if (sort_by === 'comments') {
      query = query.order('comments_count', { ascending: sort_order === 'asc' });
      // Add tie-breaking for comments: likes then date
      query = query.order('likes_count', { ascending: false });
      query = query.order('created_at', { ascending: false });
    } else {
      // For newest (created_at), no tie-breaking needed
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
      console.log('Count is null, fetching total count separately');
      
      // Build count query with same filters
      let countQuery = supabaseAdmin
        .from('memes')
        .select('*', { count: 'exact', head: true });

      // Apply same filters to count query
      if (category_id) {
        countQuery = countQuery.eq('category_id', category_id);
      }

      if (search) {
        countQuery = countQuery.or(`title.ilike.%${search}%,tags.cs.{${search}}`);
      }

      const countPeriodStart = getMemeTimePeriodStart(time_period);
      if (countPeriodStart) {
        countQuery = countQuery.gte('created_at', countPeriodStart.toISOString());
      }

      const { count: total } = await countQuery;
      totalCount = total || 0;
      console.log('Total count from separate query with filters:', totalCount);
    } else {
      totalCount = count;
      console.log('Using count from query:', totalCount);
    }

    const hasMore = page * limit < totalCount;
    console.log('Pagination calculation:', {
      page,
      limit,
      totalCount,
      hasMore
    });

    return NextResponse.json({
      memes: memes || [],
      pagination: {
        page,
        limit,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limit),
        has_more: hasMore
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
