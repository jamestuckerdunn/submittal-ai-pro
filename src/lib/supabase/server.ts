import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

export async function createClient() {
  // Validate environment variables before creating client
  validateEnvironmentVariables();

  const cookieStore = await cookies();

  // Create a server-side client with cookies
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
