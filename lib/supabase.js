import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check for placeholder or missing values
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-key');

/**
 * Whether Supabase credentials have been properly configured.
 * Use this to guard against unconfigured state in the UI.
 */
export const supabaseIsConfigured = isConfigured;

/**
 * Browser-safe Supabase client (uses anon key).
 * Returns null if credentials are not yet configured.
 */
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Server-side Supabase admin client (bypasses RLS).
 * Only use in Server Components and Route Handlers.
 */
export const supabaseAdmin = () => {
  if (!supabaseServiceRoleKey || supabaseServiceRoleKey.includes('your-service-role')) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY.');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export default supabase;
