import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Test the connection by checking auth status
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError && authError.message !== 'Invalid JWT') {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Database connection failed', details: authError.message },
        { status: 500 }
      );
    }

    // Test database connection by querying tables
    const { data: tables, error: dbError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database query failed', details: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      user: user ? { id: user.id, email: user.email } : null,
      tablesFound: tables?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
