import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateFile, sanitizeFilename } from '@/lib/utils/fileValidation';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'other';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'File validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Generate safe filename
    const timestamp = Date.now();
    const originalName = file.name;
    const sanitizedName = sanitizeFilename(originalName);
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = `${user.id}/${category}/${fileName}`;

    // Convert File to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload file to storage',
          details: uploadError.message,
        },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Save file metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: originalName,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        category: category,
        public_url: urlData.publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      // If database insert fails, try to clean up the uploaded file
      await supabase.storage.from('documents').remove([filePath]);

      console.error('Database insert error:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save file metadata',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      file: {
        id: dbData.id,
        name: dbData.filename,
        size: dbData.file_size,
        type: dbData.file_type,
        path: dbData.file_path,
        url: dbData.public_url,
        uploadedAt: dbData.created_at,
        uploadedBy: user.id,
        category: dbData.category,
      },
      message: `File "${originalName}" uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during file upload',
      },
      { status: 500 }
    );
  }
}
