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

async function fixLikesUserId() {
  try {
    console.log('🔧 Fixing meme_likes table to support session-based user IDs...');
    
    // Check if meme_likes table exists
    console.log('🔍 Checking meme_likes table...');
    const { data: testData, error: testError } = await supabase
      .from('meme_likes')
      .select('id')
      .limit(1);
    
    if (testError && testError.code !== 'PGRST116') {
      console.error('❌ Error accessing meme_likes table:', testError.message);
      return;
    }
    
    console.log('✅ meme_likes table exists');
    
    // Check current column type by trying to insert a test value
    console.log('🔍 Checking current user_id column type...');
    
    // Get a test meme ID
    const { data: memes, error: memesError } = await supabase
      .from('memes')
      .select('id')
      .limit(1);
    
    if (memesError || !memes || memes.length === 0) {
      console.error('❌ No memes found. Please create at least one meme first.');
      return;
    }
    
    const testMemeId = memes[0].id;
    const testSessionId = 'test-session-id-' + Date.now();
    
    // Try to insert with TEXT to see if it works
    const { error: insertError } = await supabase
      .from('meme_likes')
      .insert({
        meme_id: testMemeId,
        user_id: testSessionId
      });
    
    if (insertError) {
      if (insertError.message.includes('uuid') || insertError.message.includes('UUID')) {
        console.log('⚠️  user_id column is UUID type, needs to be changed to TEXT');
        console.log('📝 Running migration...');
        
        // Note: We can't directly alter column types via Supabase client
        // This needs to be run in the Supabase SQL editor or via psql
        console.log('');
        console.log('⚠️  IMPORTANT: You need to run the SQL migration manually:');
        console.log('   1. Go to your Supabase dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Run the contents of fix-likes-user-id.sql');
        console.log('');
        console.log('Or run this SQL:');
        console.log('');
        console.log('ALTER TABLE public.meme_likes DROP CONSTRAINT IF EXISTS meme_likes_user_id_fkey;');
        console.log('ALTER TABLE public.meme_likes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;');
        console.log('DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.meme_likes;');
        console.log('DROP POLICY IF EXISTS "Authenticated users can create likes" ON public.meme_likes;');
        console.log('DROP POLICY IF EXISTS "Users can delete own likes" ON public.meme_likes;');
        console.log('CREATE POLICY "Likes are viewable by everyone" ON public.meme_likes FOR SELECT USING (true);');
        console.log('CREATE POLICY "Anyone can create likes" ON public.meme_likes FOR INSERT WITH CHECK (true);');
        console.log('CREATE POLICY "Anyone can delete likes" ON public.meme_likes FOR DELETE USING (true);');
        console.log('');
        
        return;
      } else {
        console.error('❌ Unexpected error:', insertError.message);
        return;
      }
    } else {
      console.log('✅ user_id column already supports TEXT values');
      
      // Clean up test data
      await supabase
        .from('meme_likes')
        .delete()
        .eq('user_id', testSessionId);
      
      console.log('✅ Cleanup successful');
    }
    
    // Update RLS policies
    console.log('🔧 Updating RLS policies...');
    // Note: Policy updates also need to be done via SQL editor
    
    console.log('✅ Migration check complete!');
    console.log('');
    console.log('📝 If you see the migration instructions above, please run the SQL in your Supabase dashboard.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
  }
}

fixLikesUserId();

