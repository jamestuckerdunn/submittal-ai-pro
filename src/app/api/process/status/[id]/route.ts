// Document Processing Status API Route
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProcessingStatus } from '@/lib/utils/textExtraction';

// GET /api/process/status/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Processing ID is required' },
        { status: 400 }
      );
    }

    // Verify document ownership
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, user_id, status, extracted_text, processed_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Get processing status from queue
    const processingStatus = getProcessingStatus(id);

    // If no processing status found, check database
    if (!processingStatus) {
      // Check if document is already processed
      if (document.status === 'processed' && document.extracted_text) {
        return NextResponse.json({
          success: true,
          processingId: id,
          status: 'completed',
          progress: 100,
          message: 'Document processing completed',
          completedAt: document.processed_at,
          result: {
            extractedText: document.extracted_text,
            metadata: {
              extractionMethod: 'cached',
            },
            status: 'success' as const,
          },
        });
      } else if (document.status === 'error') {
        return NextResponse.json({
          success: false,
          processingId: id,
          status: 'failed',
          progress: 0,
          message: 'Document processing failed',
          error: 'Processing failed - please try again',
        });
      } else {
        return NextResponse.json({
          success: true,
          processingId: id,
          status: 'pending',
          progress: 0,
          message: 'Document not yet processed',
        });
      }
    }

    // Return current processing status
    return NextResponse.json({
      success: true,
      processingId: id,
      status: processingStatus.status,
      progress: processingStatus.progress,
      message: processingStatus.message,
      startedAt: processingStatus.startedAt,
      completedAt: processingStatus.completedAt,
      result: processingStatus.result,
      error: processingStatus.error,
    });
  } catch (error) {
    console.error('Processing status API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
