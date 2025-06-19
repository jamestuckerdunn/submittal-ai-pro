import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
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

    const { id: fileId } = await params;

    // Fetch file metadata from database
    const { data: fileData, error: fileError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id) // Ensure user can only access their own files
      .single();

    if (fileError) {
      if (fileError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch file' },
        { status: 500 }
      );
    }

    // Return file metadata
    return NextResponse.json({
      success: true,
      file: {
        id: fileData.id,
        name: fileData.filename,
        size: fileData.file_size,
        type: fileData.file_type,
        path: fileData.file_path,
        url: fileData.public_url,
        uploadedAt: fileData.created_at,
        uploadedBy: fileData.user_id,
        category: fileData.category,
      },
    });
  } catch (error) {
    console.error('Get file error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
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

    const { id: fileId } = await params;

    // First fetch file metadata to get the file path
    const { data: fileData, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id) // Ensure user can only delete their own files
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'File not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch file for deletion' },
        { status: 500 }
      );
    }

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([fileData.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', fileId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete file from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `File "${fileData.filename}" deleted successfully`,
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
