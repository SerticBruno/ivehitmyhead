import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabaseAdmin
      .from('memes')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message
      }, { status: 500 });
    }
    
    console.log('Database connection successful');
    
    // Check categories
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name, emoji')
      .order('name');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch categories',
        details: categoriesError.message
      }, { status: 500 });
    }
    
    console.log('Categories found:', categories?.length || 0);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      categoriesCount: categories?.length || 0,
      categories: categories || []
    });
    
  } catch (error) {
    console.error('Unexpected error testing database:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
