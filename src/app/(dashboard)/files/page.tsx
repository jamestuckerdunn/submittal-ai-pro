'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Image,
  File,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils/fileValidation';
import { type FileUploadResult, type FileMetadata } from '@/lib/types/files';

export default function FilesPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleUploadComplete = (result: FileUploadResult) => {
    if (result.success && result.file) {
      setUploadedFiles(prev => [result.file!, ...prev]);
      setSuccessMessage(result.message || 'File uploaded successfully!');
      setErrorMessage('');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const handleUploadError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage('');
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        setSuccessMessage(result.message || 'File deleted successfully!');
        setErrorMessage('');

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(result.error || 'Failed to delete file');
        setSuccessMessage('');
      }
    } catch {
      setErrorMessage('Network error while deleting file');
      setSuccessMessage('');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/'))
      return <Image className="h-5 w-5" aria-hidden="true" />;
    if (fileType === 'application/pdf' || fileType.includes('document'))
      return <FileText className="h-5 w-5" aria-hidden="true" />;
    return <File className="h-5 w-5" aria-hidden="true" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'submittal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'specification':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                File Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Upload and manage your construction documents, submittals, and
                specifications.
              </p>
            </div>

            {/* Alerts */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription>
                  Upload your construction documents for AI analysis. Supported
                  formats: PDF, DOC, DOCX, and images.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  category="other"
                  maxFiles={10}
                />
              </CardContent>
            </Card>

            {/* File List Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Files</CardTitle>
                <CardDescription>
                  Your uploaded files are listed below. Click on a file to view
                  details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No files uploaded yet. Use the upload area above to get
                      started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadedFiles.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                              <Badge
                                variant="secondary"
                                className={getCategoryColor(file.category)}
                              >
                                {file.category}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Download ${file.name}`}
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                            aria-label={`Delete ${file.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  File Upload Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-800 dark:text-blue-200">
                <ul className="space-y-2 text-sm">
                  <li>
                    • Supported file types: PDF, DOC, DOCX, JPG, PNG, WEBP, GIF
                  </li>
                  <li>• Maximum file size: 50MB per file</li>
                  <li>• You can upload up to 10 files at once</li>
                  <li>
                    • Files are automatically categorized based on their type
                  </li>
                  <li>
                    • All uploads are secure and associated with your account
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
