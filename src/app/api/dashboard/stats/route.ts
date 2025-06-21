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

    // Get dashboard statistics using the stored function
    const { data: stats, error: statsError } = await supabase
      .rpc('get_dashboard_stats')
      .single();

    if (statsError) {
      console.error('Dashboard stats error:', statsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch dashboard statistics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        total_projects: stats.total_projects || 0,
        total_parties: stats.total_parties || 0,
        compliant_parties: stats.compliant_parties || 0,
        non_compliant_parties: stats.non_compliant_parties || 0,
        expiring_documents: stats.expiring_documents || 0,
      },
    });
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}