import { createBrowserClient } from '@supabase/ssr';

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
function validateEnvironmentVariables() {
  if (
    !supabaseUrl ||
    supabaseUrl === 'your-project-url' ||
    !supabaseUrl.startsWith('http')
  ) {
    throw new Error(
      'Missing or invalid NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.'
    );
  }

  if (
    !supabaseAnonKey ||
    supabaseAnonKey === 'your-anon-key' ||
    supabaseAnonKey.length < 20
  ) {
    throw new Error(
      'Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.'
    );
  }
}

export function createClient() {
  // Validate environment variables before creating client
  validateEnvironmentVariables();

  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
