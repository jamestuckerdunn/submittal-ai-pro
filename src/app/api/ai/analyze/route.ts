// AI Document Analysis API Route

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiService } from '@/lib/ai/service';
import { TextExtractionService } from '@/lib/utils/textExtraction';
import {
  DocumentAnalysisRequest,
  AIAnalysisResponse,
  AIProcessingError,
} from '@/lib/types/ai';

// POST /api/ai/analyze
export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      documentId,
      analysisType = 'review',
      customPrompt,
      comparisonDocumentId,
      mockTest = false,
    } = body;

    // Handle mock test for development
    if (mockTest) {
      return NextResponse.json({
        success: true,
        analysisId: 'mock-analysis-id',
        model: 'openai/gpt-4o-mini',
        tokensUsed: 100,
        cost: 0.001,
        processingTime: 1000,
        result: {
          complianceScore: 85,
          overallAssessment: 'partially-compliant',
          summary: 'Mock analysis result for testing purposes',
          findings: [],
          recommendations: [],
          categories: [],
          confidence: 0.8,
        },
      });
    }

    // Validate required fields
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Fetch document from database
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Check if document is ready for analysis
    if (document.status !== 'uploaded') {
      return NextResponse.json(
        { error: 'Document is not ready for analysis' },
        { status: 400 }
      );
    }

    // Download file content from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: 'Failed to download document content' },
        { status: 500 }
      );
    }

    // Extract text from document
    const fileBuffer = Buffer.from(await fileData.arrayBuffer());
    const extractedText = await TextExtractionService.extractText(
      fileBuffer,
      document.filename,
      document.file_type
    );

    // Validate extracted text
    if (!TextExtractionService.validateExtractedText(extractedText)) {
      return NextResponse.json(
        { error: 'Failed to extract readable text from document' },
        { status: 400 }
      );
    }

    // Prepare text for analysis
    const processedText =
      TextExtractionService.prepareTextForAnalysis(extractedText);

    // Create analysis request
    const analysisRequest: DocumentAnalysisRequest = {
      documentId,
      documentType:
        document.category === 'submittal' ? 'submittal' : 'specification',
      extractedText: processedText,
      fileName: document.filename,
      analysisType,
      customPrompt,
      comparisonDocumentId,
    };

    // Update document status to processing
    await supabase
      .from('documents')
      .update({
        status: 'processing',
        processed_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    // Perform AI analysis
    const analysisResult: AIAnalysisResponse =
      await aiService.analyzeDocument(analysisRequest);

    // Create review record in database
    const reviewData = {
      user_id: user.id,
      document_id: documentId,
      ai_analysis: analysisResult.result,
      compliance_score: analysisResult.result?.complianceScore || 0,
      status: analysisResult.success ? 'completed' : 'failed',
      model_used: analysisResult.model,
      tokens_used: analysisResult.tokensUsed,
      cost: analysisResult.cost,
      processing_time: analysisResult.processingTime,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };

    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();

    if (reviewError) {
      console.error('Failed to save review:', reviewError);
      // Continue anyway - we still want to return the analysis
    }

    // Update document status
    const finalStatus = analysisResult.success ? 'processed' : 'error';
    await supabase
      .from('documents')
      .update({ status: finalStatus })
      .eq('id', documentId);

    // Track usage for subscription limits
    if (analysisResult.success) {
      await trackUsage(supabase, user.id, analysisResult.cost);
    }

    // Return analysis result
    return NextResponse.json({
      ...analysisResult,
      reviewId: review?.id,
      documentId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI analysis error:', error);

    if (error instanceof AIProcessingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}

// Track usage for subscription management
async function trackUsage(supabase: any, userId: string, cost: number) {
  try {
    // Get current subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (subscription) {
      // Update usage
      await supabase
        .from('subscriptions')
        .update({
          reviews_used: (subscription.reviews_used || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);
    }

    // Log cost usage
    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      cost,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track usage:', error);
    // Don't throw - usage tracking failure shouldn't break analysis
  }
}

// GET /api/ai/analyze (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'AI Analysis API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
