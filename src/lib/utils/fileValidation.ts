import {
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  type FileValidationError,
  type AllowedFileType,
  type AllowedFileExtension,
} from '@/lib/types/files';

export interface FileValidationResult {
  isValid: boolean;
  errors: FileValidationError[];
}

/**
 * Validates a file based on type, size, and other criteria
 */
export function validateFile(file: File): FileValidationResult {
  const errors: FileValidationError[] = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push({
      code: 'FILE_TOO_LARGE',
      message: `File size exceeds the maximum limit of ${formatFileSize(
        MAX_FILE_SIZE
      )}`,
      field: 'size',
    });
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType)) {
    errors.push({
      code: 'INVALID_FILE_TYPE',
      message: `File type "${file.type}" is not supported. Allowed types: PDF, DOC, DOCX, and images.`,
      field: 'type',
    });
  }

  // Check file extension as fallback
  const fileExtension = getFileExtension(file.name);
  if (
    fileExtension &&
    !ALLOWED_FILE_EXTENSIONS.includes(fileExtension as AllowedFileExtension)
  ) {
    errors.push({
      code: 'INVALID_FILE_EXTENSION',
      message: `File extension "${fileExtension}" is not supported.`,
      field: 'extension',
    });
  }

  // Check if file has a name
  if (!file.name || file.name.trim().length === 0) {
    errors.push({
      code: 'INVALID_FILE_NAME',
      message: 'File must have a valid name.',
      field: 'name',
    });
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push({
      code: 'EMPTY_FILE',
      message: 'File cannot be empty.',
      field: 'size',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates multiple files
 */
export function validateFiles(files: File[]): FileValidationResult {
  const allErrors: FileValidationError[] = [];

  // Check if any files provided
  if (files.length === 0) {
    allErrors.push({
      code: 'NO_FILES',
      message: 'Please select at least one file to upload.',
    });
  }

  // Validate each file
  files.forEach((file, index) => {
    const result = validateFile(file);
    if (!result.isValid) {
      result.errors.forEach(error => {
        allErrors.push({
          ...error,
          message: `File ${index + 1} (${file.name}): ${error.message}`,
        });
      });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Gets the file extension from a filename
 */
export function getFileExtension(filename: string): string | null {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return null;
  }
  return filename.substring(lastDotIndex).toLowerCase();
}

/**
 * Determines the file category based on MIME type
 */
export function getFileCategory(file: File): 'document' | 'image' | 'other' {
  if (file.type.startsWith('image/')) {
    return 'image';
  }
  if (
    file.type === 'application/pdf' ||
    file.type === 'application/msword' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'document';
  }
  return 'other';
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generates a safe filename by removing/replacing invalid characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

/**
 * Checks if the file type is supported for preview
 */
export function isPreviewSupported(file: File): boolean {
  return file.type.startsWith('image/') || file.type === 'application/pdf';
}
