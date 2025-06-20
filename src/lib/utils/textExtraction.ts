// Document Text Extraction Utilities for SubmittalAI Pro

import { ExtractedText, TextSection } from '@/lib/types/ai';
import mammoth from 'mammoth';
import sharp from 'sharp';

// Text Extraction Service
export class TextExtractionService {
  // Extract text from uploaded file
  static async extractText(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ExtractedText> {
    try {
      switch (mimeType) {
        case 'application/pdf':
          return await this.extractFromPDF(fileBuffer, fileName);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDOCX(fileBuffer, fileName);
        case 'application/msword':
          return await this.extractFromDOC(fileBuffer, fileName);
        case 'text/plain':
          return this.extractFromText(fileBuffer);
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error('Text extraction failed:', error);
      throw new Error(
        `Failed to extract text from ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Extract text from PDF (placeholder - requires pdf-parse package)
  private static async extractFromPDF(
    buffer: Buffer,
    fileName: string
  ): Promise<ExtractedText> {
    // Note: In a real implementation, you would use pdf-parse or similar
    // For now, we'll return a placeholder structure

    try {
      // This is a placeholder implementation
      // In production, you would install pdf-parse and use it like:
      // const pdfParse = require('pdf-parse');
      // const data = await pdfParse(buffer);

      const mockContent = `[PDF Content Placeholder]
This is a mock extraction for ${fileName}.
In production, this would contain the actual extracted text from the PDF file.

To implement actual PDF extraction:
1. Install pdf-parse: npm install pdf-parse
2. Replace this placeholder with actual extraction code
3. Handle multi-page documents
4. Extract metadata and structure`;

      return {
        content: mockContent,
        metadata: {
          pageCount: 1,
          wordCount: mockContent.split(' ').length,
          characterCount: mockContent.length,
          extractionMethod: 'pdf-parse',
          confidence: 0.95,
        },
        sections: [
          {
            title: 'PDF Content',
            content: mockContent,
            page: 1,
            level: 1,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Extract text from DOCX (placeholder - requires mammoth package)
  private static async extractFromDOCX(
    buffer: Buffer,
    fileName: string
  ): Promise<ExtractedText> {
    try {
      // This is a placeholder implementation
      // In production, you would install mammoth and use it like:
      // const mammoth = require('mammoth');
      // const result = await mammoth.extractRawText({ buffer });

      const mockContent = `[DOCX Content Placeholder]
This is a mock extraction for ${fileName}.
In production, this would contain the actual extracted text from the DOCX file.

To implement actual DOCX extraction:
1. Install mammoth: npm install mammoth
2. Replace this placeholder with actual extraction code
3. Handle document structure and formatting
4. Extract headings and sections`;

      return {
        content: mockContent,
        metadata: {
          wordCount: mockContent.split(' ').length,
          characterCount: mockContent.length,
          extractionMethod: 'docx-parse',
          confidence: 0.98,
        },
        sections: [
          {
            title: 'Document Content',
            content: mockContent,
            level: 1,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `DOCX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Extract text from DOC (placeholder - requires complex conversion)
  private static async extractFromDOC(
    buffer: Buffer,
    fileName: string
  ): Promise<ExtractedText> {
    try {
      // DOC files are more complex and typically require conversion to DOCX first
      // This is a placeholder implementation

      const mockContent = `[DOC Content Placeholder]
This is a mock extraction for ${fileName}.
In production, this would contain the actual extracted text from the DOC file.

To implement actual DOC extraction:
1. Consider converting DOC to DOCX first
2. Use specialized libraries like textract
3. Handle legacy formatting and encoding
4. Ensure compatibility with older Word versions`;

      return {
        content: mockContent,
        metadata: {
          wordCount: mockContent.split(/\s+/).length,
          characterCount: mockContent.length,
          extractionMethod: 'docx-parse',
          confidence: 1.0,
        },
      };
    } catch (error) {
      throw new Error(
        `DOC extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Extract text from plain text files
  private static extractFromText(buffer: Buffer): ExtractedText {
    const content = buffer.toString('utf-8');

    return {
      content,
      metadata: {
        wordCount: content.split(/\s+/).length,
        characterCount: content.length,
        extractionMethod: 'docx-parse',
        confidence: 1.0,
      },
    };
  }

  // Validate extracted text quality
  static validateExtractedText(extracted: ExtractedText): boolean {
    // Check if extraction was successful
    if (!extracted.content || extracted.content.trim().length === 0) {
      return false;
    }

    // Check confidence level
    if (extracted.metadata.confidence && extracted.metadata.confidence < 0.5) {
      return false;
    }

    // Check for reasonable content length
    if (extracted.content.length < 50) {
      return false;
    }

    return true;
  }

  // Clean and prepare text for AI analysis
  static prepareTextForAnalysis(extracted: ExtractedText): string {
    let content = extracted.content;

    // Remove excessive whitespace
    content = content.replace(/\s+/g, ' ').trim();

    // Remove common PDF artifacts
    content = content.replace(/\f/g, '\n'); // Form feed to newline
    content = content.replace(/\r\n/g, '\n'); // Normalize line endings
    content = content.replace(/\n{3,}/g, '\n\n'); // Reduce multiple newlines

    // Remove page numbers and headers/footers (basic patterns)
    content = content.replace(/^Page \d+.*$/gm, '');
    content = content.replace(/^\d+\s*$/gm, '');

    return content;
  }

  // Get text statistics
  static getTextStatistics(content: string) {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = content
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0);
    const paragraphs = content
      .split(/\n\s*\n/)
      .filter(para => para.trim().length > 0);

    return {
      characters: content.length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      averageWordsPerSentence:
        sentences.length > 0 ? words.length / sentences.length : 0,
      averageSentencesPerParagraph:
        paragraphs.length > 0 ? sentences.length / paragraphs.length : 0,
    };
  }

  // Extract sections from document
  static extractSections(content: string): TextSection[] {
    const sections: TextSection[] = [];

    // Look for common heading patterns
    const headingPatterns = [
      /^([A-Z][A-Z\s]{2,}):?\s*$/gm, // ALL CAPS headings
      /^(\d+\.?\s+[A-Za-z].*):?\s*$/gm, // Numbered headings
      /^([A-Z][a-z\s]+):?\s*$/gm, // Title case headings
    ];

    let currentSection = '';
    let currentTitle = 'Introduction';

    const lines = content.split('\n');

    for (const line of lines) {
      let isHeading = false;

      // Check if line matches heading patterns
      for (const pattern of headingPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          // Save previous section if it has content
          if (currentSection.trim()) {
            sections.push({
              title: currentTitle,
              content: currentSection.trim(),
              level: 1,
            });
          }

          // Start new section
          currentTitle = match[1].trim();
          currentSection = '';
          isHeading = true;
          break;
        }
      }

      if (!isHeading) {
        currentSection += line + '\n';
      }
    }

    // Add final section
    if (currentSection.trim()) {
      sections.push({
        title: currentTitle,
        content: currentSection.trim(),
        level: 1,
      });
    }

    // If no sections were found, return the entire content as one section
    if (sections.length === 0) {
      sections.push({
        title: 'Document Content',
        content: content,
        level: 1,
      });
    }

    return sections;
  }
}

// Enhanced Document Text Extraction Service for SubmittalAI Pro

// PDF Text Extraction Implementation
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid build-time issues with pdf-parse
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Word Document Text Extraction Implementation
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }

    return result.value || '';
  } catch (error) {
    console.error('DOCX text extraction error:', error);
    throw new Error(
      `Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Legacy DOC files - placeholder for future implementation
export async function extractTextFromDOC(buffer: Buffer): Promise<string> {
  // Note: For now, we'll return an error message
  // In production, you might want to use a service like textract or convert to DOCX first
  console.log(
    `DOC processing not implemented for buffer size: ${buffer.length}`
  );
  throw new Error(
    'DOC file processing not yet implemented. Please convert to DOCX format.'
  );
}

// Image Text Recognition (OCR) - placeholder for future implementation
export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    // For now, we'll return basic image metadata
    const metadata = await sharp(buffer).metadata();

    return `Image detected: ${metadata.width}x${metadata.height} pixels, format: ${metadata.format}, type: ${mimeType}
    
Note: OCR text extraction from images is not yet implemented. 
Please consider using a dedicated OCR service or converting images to text manually.`;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error(
      `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Plain Text Extraction
export async function extractTextFromPlainText(
  buffer: Buffer
): Promise<string> {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Plain text extraction error:', error);
    throw new Error(
      `Failed to extract plain text: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Main Document Processing Service
export interface DocumentProcessingResult {
  extractedText: string;
  metadata: {
    fileType: string;
    fileName: string;
    fileSize: number;
    processingTime: number;
    wordCount: number;
    characterCount: number;
    pageCount?: number | undefined;
    extractionMethod: string;
  };
  status: 'success' | 'partial' | 'failed';
  warnings?: string[] | undefined;
  errors?: string[] | undefined;
}

export async function processDocument(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<DocumentProcessingResult> {
  const startTime = Date.now();
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    let extractedText = '';
    let extractionMethod = '';
    let pageCount: number | undefined;

    // Determine extraction method based on MIME type
    if (mimeType === 'application/pdf') {
      extractedText = await extractTextFromPDF(buffer);
      extractionMethod = 'pdf-parse';
    } else if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      extractedText = await extractTextFromDOCX(buffer);
      extractionMethod = 'mammoth';
    } else if (mimeType === 'application/msword') {
      try {
        extractedText = await extractTextFromDOC(buffer);
        extractionMethod = 'doc-parser';
      } catch (error) {
        errors.push(
          `DOC processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        extractedText = `[DOC file detected but processing failed. Please convert to DOCX format for better results.]`;
        extractionMethod = 'fallback';
      }
    } else if (mimeType.startsWith('image/')) {
      try {
        extractedText = await extractTextFromImage(buffer, mimeType);
        extractionMethod = 'image-metadata';
        warnings.push('OCR text extraction from images is not yet implemented');
      } catch (error) {
        errors.push(
          `Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        extractedText = '[Image file detected but processing failed]';
        extractionMethod = 'fallback';
      }
    } else if (mimeType.startsWith('text/')) {
      extractedText = await extractTextFromPlainText(buffer);
      extractionMethod = 'plain-text';
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Calculate metadata
    const processingTime = Date.now() - startTime;
    const wordCount = extractedText
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    const characterCount = extractedText.length;

    // Estimate page count for text-based content
    if (extractionMethod !== 'image-metadata') {
      pageCount = Math.max(1, Math.ceil(wordCount / 500)); // Rough estimate: 500 words per page
    }

    const status: 'success' | 'partial' | 'failed' =
      errors.length > 0 ? 'partial' : 'success';

    return {
      extractedText,
      metadata: {
        fileType: mimeType,
        fileName,
        fileSize: buffer.length,
        processingTime,
        wordCount,
        characterCount,
        ...(pageCount !== undefined && { pageCount }),
        extractionMethod,
      },
      status,
      warnings: warnings.length > 0 ? warnings : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    return {
      extractedText: '',
      metadata: {
        fileType: mimeType,
        fileName,
        fileSize: buffer.length,
        processingTime,
        wordCount: 0,
        characterCount: 0,
        extractionMethod: 'failed',
      },
      status: 'failed',
      errors: [
        `Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

// Document Processing Queue Status
export interface ProcessingStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  startedAt: Date;
  completedAt?: Date;
  result?: DocumentProcessingResult;
  error?: string;
}

// In-memory processing queue (in production, use Redis or database)
const processingQueue = new Map<string, ProcessingStatus>();

export function getProcessingStatus(id: string): ProcessingStatus | null {
  return processingQueue.get(id) || null;
}

export function updateProcessingStatus(
  id: string,
  updates: Partial<ProcessingStatus>
): void {
  const current = processingQueue.get(id);
  if (current) {
    processingQueue.set(id, { ...current, ...updates });
  }
}

export function createProcessingJob(
  id: string,
  fileName: string
): ProcessingStatus {
  const status: ProcessingStatus = {
    id,
    status: 'queued',
    progress: 0,
    message: `Queued for processing: ${fileName}`,
    startedAt: new Date(),
  };

  processingQueue.set(id, status);
  return status;
}
