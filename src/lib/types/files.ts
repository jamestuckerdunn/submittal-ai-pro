export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
  category: 'submittal' | 'specification' | 'other';
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResult {
  success: boolean;
  file?: FileMetadata;
  error?: string;
  message?: string;
}

export interface FileValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface FileUploadOptions {
  category?: 'submittal' | 'specification' | 'other';
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: FileUploadProgress) => void;
}

export interface FileListResponse {
  files: FileMetadata[];
  total: number;
  hasMore: boolean;
}

export interface FileDeleteResult {
  success: boolean;
  error?: string;
  message?: string;
}

// Allowed file types for uploads
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
] as const;

// Maximum file size (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

// File type categories
export const FILE_TYPE_CATEGORIES = {
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
} as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
export type AllowedFileExtension = (typeof ALLOWED_FILE_EXTENSIONS)[number];
export type FileCategory = 'submittal' | 'specification' | 'other';
