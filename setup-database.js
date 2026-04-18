const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please check your .env file and ensure these variables are set.');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...');
    
    // Test connection
    console.log('📡 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('memes')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Check if categories exist
    console.log('🔍 Checking for existing categories...');
    const { data: existingCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1);
    
    if (categoriesError) {
      console.error('❌ Error checking categories:', categoriesError.message);
      return;
    }
    
    if (existingCategories && existingCategories.length > 0) {
      console.log('✅ Categories already exist');
      return;
    }
    
    // Create default categories
    console.log('📝 Creating default categories...');
    const defaultCategories = [
      { name: 'Wholesome', emoji: '', description: 'Feel-good, kind, and heartwarming memes' },
      { name: 'Animals', emoji: '', description: 'Cute and funny animal memes' },
      { name: 'Movies', emoji: '', description: 'Film and TV show memes' },
      { name: 'Sports', emoji: '', description: 'Sports and athletic memes' },
      { name: 'Food', emoji: '', description: 'Food and cooking memes' },
      { name: 'School', emoji: '', description: 'Education and student life memes' },
      { name: 'Work', emoji: '', description: 'Office and work life memes' },
      { name: 'Random', emoji: '', description: 'Miscellaneous and random memes' }
    ];
    
    const { error: insertError } = await supabase
      .from('categories')
      .insert(defaultCategories);
    
    if (insertError) {
      console.error('❌ Failed to create categories:', insertError.message);
      return;
    }
    
    console.log('✅ Default categories created successfully');
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupDatabase();
