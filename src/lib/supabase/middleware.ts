import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

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
    console.warn(
      'Invalid NEXT_PUBLIC_SUPABASE_URL environment variable. Skipping authentication.'
    );
    return false;
  }

  if (
    !supabaseAnonKey ||
    supabaseAnonKey === 'your-anon-key' ||
    supabaseAnonKey.length < 20
  ) {
    console.warn(
      'Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Skipping authentication.'
    );
    return false;
  }

  return true;
}

export async function updateSession(request: NextRequest) {
  // Skip authentication if environment variables are not properly configured
  if (!validateEnvironmentVariables()) {
    return NextResponse.next({
      request,
    });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // refreshing the auth token
  await supabase.auth.getUser();

  return supabaseResponse;
}
