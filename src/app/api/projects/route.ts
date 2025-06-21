import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('project_summary')
      .select('*')
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    const { data: projects, error: projectsError } = await query;

    if (projectsError) {
      console.error('Projects fetch error:', projectsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('project_summary')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Projects count error:', countError);
    }

    return NextResponse.json({
      success: true,
      data: projects || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
      has_more: (count || 0) > offset + limit,
    });
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check if user is admin
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, start_date, end_date, compliance_profile_id } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Insert new project
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        name,
        start_date,
        end_date,
        compliance_profile_id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Project creation error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Project creation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}