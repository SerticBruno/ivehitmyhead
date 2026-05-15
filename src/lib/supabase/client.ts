import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser singleton - use from client components (e.g. AuthContext). */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
