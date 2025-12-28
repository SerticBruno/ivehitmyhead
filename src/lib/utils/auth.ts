import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function verifyAdminAuth(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    // Check if user is admin via metadata
    const isAdminFromMetadata = user.user_metadata?.role === 'admin';
    
    if (isAdminFromMetadata) {
      return { user, error: null };
    }

    // Also check profiles table for admin status (if column exists)
    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      // Check if error is due to missing column (PostgreSQL error code 42703)
      if (profileError && (profileError.code === '42703' || profileError.code === 42703 || profileError.message?.includes('does not exist'))) {
        // Column doesn't exist, rely on metadata check which already failed
        return { user: null, error: 'User is not an admin' };
      }

      // If profile exists and has is_admin field, check it
      if (!profileError && profile?.is_admin === true) {
        return { user, error: null };
      }

      // If profile check failed but no error (column might not exist), 
      // and metadata check already failed, deny access
      if (!profileError && profile?.is_admin !== true) {
        return { user: null, error: 'User is not an admin' };
      }
    } catch (err) {
      // If profiles table doesn't have is_admin column, that's okay
      // We'll rely on metadata check which already failed
    }

    // If we get here, user is not an admin
    return { user: null, error: 'User is not an admin' };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

