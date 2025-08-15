import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  return NextResponse.json({
    message: 'Admin setup endpoint. Use POST method to create admin account.',
    instructions: 'Send a POST request to this endpoint to create the admin account.'
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up admin account...');
    
    // Check if admin profile already exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, username')
      .eq('username', 'admin')
      .single();
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin account already exists',
        adminId: existingAdmin.id
      });
    }
    
    // Create admin user in auth system
    console.log('Creating admin user in auth system...');
    const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@ivehitmyhead.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: { role: 'admin' }
    });
    
    if (createAuthError) {
      console.error('Failed to create auth user:', createAuthError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create admin user in auth system',
        details: createAuthError.message
      }, { status: 500 });
    }
    
    const adminUserId = authUser.user.id;
    console.log('Admin user created with ID:', adminUserId);
    
    // Create admin profile
    console.log('Creating admin profile...');
    const { error: createProfileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: adminUserId,
        username: 'admin',
        display_name: 'Admin User'
      });
    
    if (createProfileError) {
      console.error('Failed to create admin profile:', createProfileError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create admin profile',
        details: createProfileError.message
      }, { status: 500 });
    }
    
    console.log('Admin account setup complete!');
    
    // Create default categories if they don't exist
    console.log('Setting up default categories...');
    const { data: existingCategories, error: categoriesCheckError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .limit(1);
    
    if (categoriesCheckError) {
      console.error('Error checking categories:', categoriesCheckError);
    } else if (!existingCategories || existingCategories.length === 0) {
      console.log('No categories found, creating default ones...');
      const defaultCategories = [
        { name: 'Funny', emoji: '😂', description: 'Humor and comedy memes' },
        { name: 'Gaming', emoji: '🎮', description: 'Video game related memes' },
        { name: 'Tech', emoji: '💻', description: 'Technology and programming memes' },
        { name: 'Animals', emoji: '🐕', description: 'Cute and funny animal memes' },
        { name: 'Movies', emoji: '🎬', description: 'Film and TV show memes' },
        { name: 'Sports', emoji: '⚽', description: 'Sports and athletic memes' },
        { name: 'Food', emoji: '🍕', description: 'Food and cooking memes' },
        { name: 'School', emoji: '📚', description: 'Education and student life memes' },
        { name: 'Work', emoji: '💼', description: 'Office and work life memes' },
        { name: 'Random', emoji: '🎲', description: 'Miscellaneous and random memes' }
      ];
      
      const { error: createCategoriesError } = await supabaseAdmin
        .from('categories')
        .insert(defaultCategories);
      
      if (createCategoriesError) {
        console.error('Failed to create default categories:', createCategoriesError);
      } else {
        console.log('Default categories created successfully');
      }
    } else {
      console.log('Categories already exist');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      adminId: adminUserId,
      credentials: {
        email: 'admin@ivehitmyhead.com',
        password: 'admin123456'
      }
    });
    
  } catch (error) {
    console.error('Error setting up admin account:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup admin account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
