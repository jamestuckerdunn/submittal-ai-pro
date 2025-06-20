// AI Document Analysis API Route

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIService } from '@/lib/ai/service';
import { DocumentAnalysisRequest } from '@/lib/types/ai';

const aiService = new AIService();

// POST /api/ai/analyze
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentId,
      analysisType = 'review',
      customPrompt,
      comparisonDocumentId,
    } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get current user
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

    // Fetch document from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if document has extracted text
    if (!document.extracted_text) {
      return NextResponse.json(
        { error: 'Document text extraction not completed' },
        { status: 400 }
      );
    }

    // Use standard analysis
    const standardRequest: DocumentAnalysisRequest = {
      documentId: document.id,
      fileName: document.filename,
      documentType: document.file_type,
      extractedText: document.extracted_text,
      analysisType: analysisType,
      customPrompt,
      comparisonDocumentId,
    };

    // Perform standard AI analysis
    const analysisResult = await aiService.analyzeDocument(standardRequest);

    if (!analysisResult.success) {
      return NextResponse.json(
        { error: analysisResult.error || 'Analysis failed' },
        { status: 500 }
      );
    }

    // Store standard analysis result in database
    const { error: insertError } = await supabase.from('reviews').insert({
      user_id: user.id,
      submittal_id: document.id,
      specification_id: document.id,
      ai_analysis: {
        enhanced: false,
        result: analysisResult.result,
        metadata: {
          model: analysisResult.model,
          tokensUsed: analysisResult.tokensUsed,
          cost: analysisResult.cost,
          processingTime: analysisResult.processingTime,
        },
      },
      compliance_score: analysisResult.result?.complianceScore || 0,
      status: 'completed',
    });

    if (insertError) {
      console.error('Failed to store analysis result:', insertError);
      return NextResponse.json(
        { error: 'Failed to store analysis result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysisId: analysisResult.analysisId,
      result: analysisResult.result,
      metadata: {
        model: analysisResult.model,
        tokensUsed: analysisResult.tokensUsed,
        cost: analysisResult.cost,
        processingTime: analysisResult.processingTime,
        enhanced: false,
      },
    });
  } catch (error) {
    console.error('AI analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
