import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get expiring documents using the stored function
    const { data: expiringDocs, error: docsError } = await supabase
      .rpc('get_expiring_documents', { days_ahead: 30 });

    if (docsError) {
      console.error('Expiring documents error:', docsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch expiring documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expiringDocs || [],
    });
  } catch (error) {
    console.error('Expiring documents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}