import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIService } from '@/lib/ai/service';
import {
  EnhancedAnalysisRequest,
  AnalysisType,
  AnalysisComplexity,
  AnalysisPriority,
  ProjectContext,
} from '@/lib/types/ai';

const aiService = new AIService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      documentId,
      analysisType = 'review',
      complexity = 'standard',
      priority = 'normal',
      projectContext,
      focusAreas,
      excludeAreas,
      customCriteria,
      comparisonDocuments,
      analysisScope,
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

    // Prepare enhanced analysis request
    const enhancedRequest: EnhancedAnalysisRequest = {
      documentId: document.id,
      fileName: document.filename,
      documentType: document.file_type,
      extractedText: document.extracted_text,
      analysisType: analysisType as AnalysisType,
      complexity: complexity as AnalysisComplexity,
      priority: priority as AnalysisPriority,
      focusAreas,
      excludeAreas,
      customCriteria,
      comparisonDocuments,
      projectContext: projectContext as ProjectContext,
      analysisScope,
    };

    // Perform enhanced AI analysis
    const analysisResult =
      await aiService.analyzeDocumentEnhanced(enhancedRequest);

    if (!analysisResult.success) {
      return NextResponse.json(
        { error: analysisResult.error || 'Analysis failed' },
        { status: 500 }
      );
    }

    // Store enhanced analysis result in database
    const { error: insertError } = await supabase.from('reviews').insert({
      user_id: user.id,
      submittal_id: document.id,
      specification_id: document.id,
      ai_analysis: {
        enhanced: true,
        complexity,
        priority,
        result: analysisResult.enhancedResult,
        metadata: {
          model: analysisResult.model,
          tokensUsed: analysisResult.tokensUsed,
          cost: analysisResult.cost,
          processingTime: analysisResult.processingTime,
        },
      },
      compliance_score: analysisResult.enhancedResult?.complianceScore || 0,
      status: 'completed',
    });

    if (insertError) {
      console.error('Failed to store enhanced analysis result:', insertError);
      return NextResponse.json(
        { error: 'Failed to store analysis result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysisId: analysisResult.analysisId,
      result: analysisResult.enhancedResult,
      metadata: {
        model: analysisResult.model,
        tokensUsed: analysisResult.tokensUsed,
        cost: analysisResult.cost,
        processingTime: analysisResult.processingTime,
        enhanced: true,
      },
    });
  } catch (error) {
    console.error('Enhanced AI analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enhanced AI Analysis API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: [
      'Multi-level analysis complexity',
      'Priority-based processing',
      'Project context integration',
      'Advanced prompt templates',
      'Comprehensive result structure',
    ],
  });
}
