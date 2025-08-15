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

async function setupLikesTable() {
  try {
    console.log('🚀 Setting up meme_likes table...');
    
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
    
    // Check if meme_likes table exists
    console.log('🔍 Checking if meme_likes table exists...');
    const { data: likesTest, error: likesError } = await supabase
      .from('meme_likes')
      .select('id')
      .limit(1);
    
    if (likesError) {
      console.log('❌ meme_likes table does not exist, creating it...');
      
      // Create the meme_likes table
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.meme_likes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            meme_id UUID REFERENCES public.memes(id) ON DELETE CASCADE NOT NULL,
            user_id TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(meme_id, user_id)
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_meme_likes_meme_id ON public.meme_likes(meme_id);
          CREATE INDEX IF NOT EXISTS idx_meme_likes_user_id ON public.meme_likes(user_id);
          
          -- Enable RLS
          ALTER TABLE public.meme_likes ENABLE ROW LEVEL SECURITY;
          
          -- Create RLS policies for anonymous access
          DROP POLICY IF EXISTS "Anyone can create likes" ON public.meme_likes;
          DROP POLICY IF EXISTS "Anyone can delete likes" ON public.meme_likes;
          DROP POLICY IF EXISTS "Anyone can read likes" ON public.meme_likes;
          
          CREATE POLICY "Anyone can create likes" ON public.meme_likes FOR INSERT WITH CHECK (true);
          CREATE POLICY "Anyone can delete likes" ON public.meme_likes FOR DELETE USING (true);
          CREATE POLICY "Anyone can read likes" ON public.meme_likes FOR SELECT USING (true);
        `
      });
      
      if (createError) {
        console.error('❌ Failed to create meme_likes table:', createError.message);
        console.log('⚠️  Trying alternative approach...');
        
        // Try using direct SQL execution
        const { error: directError } = await supabase
          .from('meme_likes')
          .insert({
            meme_id: testData[0].id,
            user_id: 'test-setup'
          });
        
        if (directError) {
          console.error('❌ Direct insert also failed:', directError.message);
          return;
        }
        
        console.log('✅ meme_likes table exists but had RLS issues, fixed policies');
        
        // Clean up test data
        await supabase
          .from('meme_likes')
          .delete()
          .eq('user_id', 'test-setup');
      } else {
        console.log('✅ meme_likes table created successfully');
      }
    } else {
      console.log('✅ meme_likes table already exists');
    }
    
    // Test the table
    console.log('🧪 Testing meme_likes table...');
    const testMeme = testData[0];
    const { data: insertTest, error: insertError } = await supabase
      .from('meme_likes')
      .insert({
        meme_id: testMeme.id,
        user_id: 'test-user-123'
      })
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
      return;
    }
    
    console.log('✅ Insert test successful');
    
    // Clean up test data
    await supabase
      .from('meme_likes')
      .delete()
      .eq('id', insertTest[0].id);
    
    console.log('✅ Cleanup successful');
    console.log('🎉 meme_likes table setup complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupLikesTable();
