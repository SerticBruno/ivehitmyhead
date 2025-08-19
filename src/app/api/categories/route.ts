import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort_by = searchParams.get('sort_by') || 'name';
    const sort_order = searchParams.get('sort_order') || 'asc';
    const category_id = searchParams.get('category_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseAdmin
      .from('categories')
      .select('*');

    // Apply category filter if specified
    if (category_id) {
      query = query.eq('id', category_id);
    }

    // Apply sorting based on different criteria
    if (sort_by === 'views') {
      // For views sorting, we'll need to do a more complex query
      // For now, fall back to name sorting and we can enhance this later
      query = query.order('name', { ascending: sort_order === 'asc' });
    } else if (sort_by === 'likes') {
      // For likes sorting, we'll need to do a more complex query
      // For now, fall back to name sorting and we can enhance this later
      query = query.order('name', { ascending: sort_order === 'asc' });
    } else if (sort_by === 'memes_count') {
      // For memes count sorting, we'll need to do a more complex query
      // For now, fall back to name sorting and we can enhance this later
      query = query.order('name', { ascending: sort_order === 'asc' });
    } else if (sort_by === 'created_at') {
      // Sort by category creation date
      query = query.order('created_at', { ascending: sort_order === 'asc' });
    } else {
      // Default: sort by name
      query = query.order('name', { ascending: sort_order === 'asc' });
    }

    // Apply limit
    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data: categories, error } = await query;
    
    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      categories: categories || [],
      sort_info: {
        sort_by,
        sort_order,
        category_id: category_id || null
      }
    });
    
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
