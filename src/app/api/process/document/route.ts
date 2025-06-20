// Document Processing API Route
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  processDocument,
  createProcessingJob,
  updateProcessingStatus,
  type DocumentProcessingResult,
} from '@/lib/utils/textExtraction';
import type { Document } from '@/lib/types/database';

// POST /api/process/document
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { documentId, fileName, mimeType } = body;

    if (!documentId || !fileName || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, fileName, mimeType' },
        { status: 400 }
      );
    }

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Check if document is already processed
    if (document.status === 'processed' && document.extracted_text) {
      return NextResponse.json({
        success: true,
        processingId: documentId,
        status: 'completed',
        message: 'Document already processed',
        result: {
          extractedText: document.extracted_text,
          metadata: {
            fileType: document.file_type,
            fileName: document.filename,
            fileSize: document.file_size,
            processingTime: 0,
            wordCount: document.extracted_text.split(/\s+/).length,
            characterCount: document.extracted_text.length,
            extractionMethod: 'cached',
          },
          status: 'success' as const,
        },
      });
    }

    // Create processing job
    createProcessingJob(documentId, fileName);

    // Start background processing
    processDocumentInBackground(documentId, document, user.id);

    return NextResponse.json({
      success: true,
      processingId: documentId,
      status: 'queued',
      message: 'Document processing started',
      estimatedTime: '2-5 minutes',
    });
  } catch (error) {
    console.error('Document processing API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Background processing function
async function processDocumentInBackground(
  documentId: string,
  document: Document,
  userId: string
) {
  const supabase = await createClient();

  try {
    // Update status to processing
    updateProcessingStatus(documentId, {
      status: 'processing',
      progress: 10,
      message: 'Downloading document...',
    });

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // Update progress
    updateProcessingStatus(documentId, {
      progress: 30,
      message: 'Extracting text...',
    });

    // Convert file to buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Process document
    const result: DocumentProcessingResult = await processDocument(
      buffer,
      document.filename,
      document.file_type
    );

    // Update progress
    updateProcessingStatus(documentId, {
      progress: 80,
      message: 'Saving results...',
    });

    // Save extracted text to database
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        extracted_text: result.extractedText,
        status: result.status === 'failed' ? 'error' : 'processed',
        processed_at: new Date().toISOString(),
        metadata: result.metadata,
      })
      .eq('id', documentId)
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(`Failed to save results: ${updateError.message}`);
    }

    // Complete processing
    updateProcessingStatus(documentId, {
      status: 'completed',
      progress: 100,
      message: 'Processing completed successfully',
      completedAt: new Date(),
      result,
    });
  } catch (error) {
    console.error('Background processing error:', error);

    // Update status to failed
    updateProcessingStatus(documentId, {
      status: 'failed',
      progress: 0,
      message: 'Processing failed',
      completedAt: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Update document status in database
    await supabase
      .from('documents')
      .update({
        status: 'error',
        processed_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .eq('user_id', userId);
  }
}
