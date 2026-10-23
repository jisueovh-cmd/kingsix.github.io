import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Single shared browser client. Uses the SDK's built-in auth locking —
// do NOT override `auth.lock`, it causes cross-request races that can break sign-in.
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});