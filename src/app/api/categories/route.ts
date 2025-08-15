import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('Fetching categories...');
    
    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: error.message
      }, { status: 500 });
    }
    
    console.log('Categories fetched successfully:', categories?.length || 0);
    
    return NextResponse.json({
      success: true,
      categories: categories || []
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
