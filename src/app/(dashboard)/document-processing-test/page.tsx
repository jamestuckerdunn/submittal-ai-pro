'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert } from '@/components/ui/alert';

interface UploadResult {
  success: boolean;
  document: {
    id: string;
    filename: string;
    file_type: string;
    file_size: number;
  };
  message?: string;
}

interface ProcessingResult {
  success: boolean;
  processingId: string;
  status: string;
  message: string;
  result?: {
    extractedText: string;
    metadata: {
      fileType: string;
      fileName: string;
      fileSize: number;
      processingTime: number;
      wordCount: number;
      characterCount: number;
      extractionMethod: string;
    };
  };
  error?: string;
}

export default function DocumentProcessingTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [processingResult, setProcessingResult] =
    useState<ProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
      setProcessingResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', 'submittal');

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcessDocument = async () => {
    if (!uploadResult?.document?.id) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/process/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: uploadResult.document.id,
          fileName: file?.name,
          mimeType: file?.type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Processing failed');
      }

      setProcessingResult(result);

      // Poll for status updates
      if (result.processingId) {
        pollProcessingStatus(result.processingId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setIsProcessing(false);
    }
  };

  const pollProcessingStatus = async (processingId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/process/status/${processingId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Status check failed');
        }

        setProcessingResult(result);

        if (result.status === 'completed' || result.status === 'failed') {
          clearInterval(pollInterval);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Status polling error:', err);
        clearInterval(pollInterval);
        setIsProcessing(false);
        setError(err instanceof Error ? err.message : 'Status check failed');
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsProcessing(false);
    }, 300000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Processing Test</h1>
        <p className="text-gray-600 mt-2">
          Test the document processing pipeline with PDF, DOCX, and other
          supported file types.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Select Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp,.gif"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <div className="text-sm text-gray-600">
                Selected: {file.name} ({Math.round(file.size / 1024)} KB,{' '}
                {file.type})
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>

          {uploadResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">Upload Successful!</p>
              <p className="text-sm text-green-600">
                Document ID: {uploadResult.document.id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Process Document</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleProcessDocument}
            disabled={!uploadResult || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner className="mr-2" />
                Processing...
              </>
            ) : (
              'Process Document'
            )}
          </Button>

          {processingResult && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium">
                  Processing Status: {processingResult.status}
                </p>
                <p className="text-sm text-gray-600">
                  {processingResult.message}
                </p>
                {processingResult.status === 'completed' &&
                  processingResult.result && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium mb-2">Extraction Results:</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          Word Count:{' '}
                          {processingResult.result.metadata.wordCount}
                        </p>
                        <p>
                          Character Count:{' '}
                          {processingResult.result.metadata.characterCount}
                        </p>
                        <p>
                          Processing Time:{' '}
                          {processingResult.result.metadata.processingTime}ms
                        </p>
                        <p>
                          Extraction Method:{' '}
                          {processingResult.result.metadata.extractionMethod}
                        </p>
                      </div>
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">
                          Extracted Text (first 500 characters):
                        </h5>
                        <div className="p-3 bg-gray-100 rounded text-sm max-h-32 overflow-y-auto">
                          {processingResult.result.extractedText.substring(
                            0,
                            500
                          )}
                          {processingResult.result.extractedText.length > 500 &&
                            '...'}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}
    </div>
  );
}
