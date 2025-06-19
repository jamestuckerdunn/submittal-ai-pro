'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Upload,
  File,
  Image,
  X,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  validateFiles,
  formatFileSize,
  getFileCategory,
} from '@/lib/utils/fileValidation';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  type FileUploadResult,
  type FileUploadProgress,
  type FileCategory,
} from '@/lib/types/files';

interface FileUploadProps {
  onUploadComplete?: (result: FileUploadResult) => void;
  onUploadError?: (error: string) => void;
  onUploadProgress?: (progress: FileUploadProgress) => void;
  category?: FileCategory;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  category = 'other',
  maxFiles = 5,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles
          .map(file => file.errors.map(error => error.message).join(', '))
          .join('; ');
        onUploadError?.(errors);
        return;
      }

      // Validate files
      const validation = validateFiles(acceptedFiles);
      if (!validation.isValid) {
        const errorMessage = validation.errors
          .map(error => error.message)
          .join('; ');
        onUploadError?.(errorMessage);
        return;
      }

      // Add files with preview URLs for images
      const newFiles: FileWithPreview[] = acceptedFiles.map(file => {
        const fileWithPreview: FileWithPreview = {
          ...file,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          uploadStatus: 'pending',
        };

        // Create preview URL for images
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }

        return fileWithPreview;
      });

      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    },
    [onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>
    ),
    maxSize: MAX_FILE_SIZE,
    maxFiles,
    disabled: disabled || isUploading,
  });

  const removeFile = useCallback((fileId: string) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter(f => f.id !== fileId);
    });
  }, []);

  const uploadFile = async (
    file: FileWithPreview
  ): Promise<FileUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      onUploadError?.('No files selected for upload');
      return;
    }

    setIsUploading(true);

    try {
      // Update all files to uploading status
      setFiles(prevFiles =>
        prevFiles.map(file => ({
          ...file,
          uploadStatus: 'uploading',
          uploadProgress: 0,
        }))
      );

      // Upload files sequentially to avoid overwhelming the server
      for (const file of files) {
        try {
          const result = await uploadFile(file);

          if (result.success) {
            setFiles(prevFiles =>
              prevFiles.map(f =>
                f.id === file.id
                  ? { ...f, uploadStatus: 'success', uploadProgress: 100 }
                  : f
              )
            );
            onUploadComplete?.(result);
          } else {
            setFiles(prevFiles =>
              prevFiles.map(f =>
                f.id === file.id
                  ? {
                      ...f,
                      uploadStatus: 'error',
                      uploadError: result.error || 'Upload failed',
                    }
                  : f
              )
            );
            onUploadError?.(result.error || 'Upload failed');
          }
        } catch {
          setFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === file.id
                ? {
                    ...f,
                    uploadStatus: 'error',
                    uploadError: 'Network error',
                  }
                : f
            )
          );
          onUploadError?.('Network error during upload');
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const fileCategory = getFileCategory(file);
    switch (fileCategory) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <LoadingSpinner size="sm" />;
      default:
        return null;
    }
  };

  // Clean up preview URLs on unmount
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop the files here...'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOC, DOCX, and images up to{' '}
              {formatFileSize(MAX_FILE_SIZE)}
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum {maxFiles} files allowed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files</h4>
          <div className="space-y-2">
            {files.map(file => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {file.preview && file.type.startsWith('image/') ? (
                      <img
                        src={file.preview}
                        alt={`Preview of ${file.name}`}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      {file.uploadError && (
                        <p className="text-xs text-red-500 mt-1">
                          {file.uploadError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(file.uploadStatus)}
                    {file.uploadStatus !== 'uploading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={isUploading}
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {file.uploadProgress !== undefined &&
                  file.uploadStatus === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isUploading || files.length === 0}
          className="w-full"
        >
          {isUploading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {files.length} file{files.length === 1 ? '' : 's'}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
