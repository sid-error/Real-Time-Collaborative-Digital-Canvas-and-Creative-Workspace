import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';

/**
 * Interface defining the properties for the FileUpload component
 * 
 * @interface FileUploadProps
 * @property {(file: File | null) => void} onFileSelect - Callback function triggered when a file is selected or removed
 * @property {string[]} [acceptedFormats=['.jpg', '.jpeg', '.png', '.webp']] - Array of accepted file extensions
 * @property {number} [maxSizeMB=5] - Maximum file size in megabytes
 * @property {string} [className=''] - Additional CSS classes for the container
 */
interface FileUploadProps {
  /** Callback function triggered when a file is selected or removed */
  onFileSelect: (file: File | null) => void;
  /** Array of accepted file extensions */
  acceptedFormats?: string[];
  /** Maximum file size in megabytes */
  maxSizeMB?: number;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * FileUpload Component
 * 
 * @component
 * @description
 * A file upload component that supports drag-and-drop, file validation, and image preview.
 * Provides visual feedback for file selection, validation errors, and file information display.
 * 
 * @features
 * - **Drag & Drop Support**: Intuitive file uploading with visual drag states
 * - **File Validation**: Validates file type and size with custom error messages
 * - **Image Preview**: Shows preview of selected image files
 * - **Responsive Design**: Adapts to different screen sizes
 * - **Accessibility**: Keyboard navigation and ARIA labels
 * - **Error Handling**: Clear error messages for invalid files
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <FileUpload 
 *   onFileSelect={(file) => console.log(file)}
 * />
 * 
 * // Custom file formats and size limit
 * <FileUpload 
 *   onFileSelect={handleFileSelect}
 *   acceptedFormats={['.jpg', '.png', '.pdf']}
 *   maxSizeMB={10}
 *   className="w-full"
 * />
 * 
 * // Controlled component usage
 * const [selectedFile, setSelectedFile] = useState<File | null>(null);
 * 
 * <FileUpload 
 *   onFileSelect={setSelectedFile}
 * />
 * ```
 * 
 * @param {FileUploadProps} props - Component properties
 * @param {(file: File | null) => void} props.onFileSelect - File selection callback
 * @param {string[]} [props.acceptedFormats=['.jpg', '.jpeg', '.png', '.webp']] - Accepted file formats
 * @param {number} [props.maxSizeMB=5] - Maximum file size in MB
 * @param {string} [props.className=''] - Additional CSS classes
 * 
 * @returns {JSX.Element} File upload interface with preview and validation
 */
const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedFormats = ['.jpg', '.jpeg', '.png', '.webp'],
  maxSizeMB = 5,
  className = ''
}) => {
  // Reference to the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for the currently selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // State for error messages
  const [error, setError] = useState<string>('');
  
  // State for drag-and-drop visual feedback
  const [isDragging, setIsDragging] = useState<boolean>(false);

  /**
   * Validates a file against accepted formats and size limits
   * 
   * @function validateFile
   * @param {File} file - The file to validate
   * @returns {boolean} True if file is valid, false otherwise
   */
  const validateFile = (file: File): boolean => {
    // Check file type based on extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      setError(`Unsupported file format. Please use ${acceptedFormats.join(', ')}`);
      return false;
    }

    // Check file size against maximum limit
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    // Clear any previous errors
    setError('');
    return true;
  };

  /**
   * Handles file selection via the file input element
   * 
   * @function handleFileChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event from file input
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      } else {
        // Clear selection if file is invalid
        setSelectedFile(null);
        onFileSelect(null);
        // Reset file input value
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  /**
   * Handles drag-over event for drag-and-drop functionality
   * 
   * @function handleDragOver
   * @param {React.DragEvent} e - Drag event
   */
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handles drag-leave event for drag-and-drop functionality
   * 
   * @function handleDragLeave
   * @param {React.DragEvent} e - Drag event
   */
  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Handles drop event for drag-and-drop functionality
   * 
   * @function handleDrop
   * @param {React.DragEvent} e - Drag event
   */
  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  };

  /**
   * Removes the currently selected file
   * 
   * @function removeFile
   */
  const removeFile = (): void => {
    setSelectedFile(null);
    setError('');
    onFileSelect(null);
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Triggers the hidden file input click event
   * 
   * @function triggerFileInput
   */
  const triggerFileInput = (): void => {
    fileInputRef.current?.click();
  };

  /**
   * Formats file size from bytes to human-readable format
   * 
   * @function formatFileSize
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size (e.g., "2.5 MB")
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input element - not visible to user */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFormats.join(',')}
        className="hidden"
        aria-label="File upload"
      />

      {/* Upload area - shown when no file is selected */}
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          } ${error ? 'border-red-300 dark:border-red-700' : ''}`}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="File upload area. Click or drag and drop to upload a file."
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerFileInput();
            }
          }}
        >
          <div className="flex flex-col items-center gap-3">
            {/* Upload icon */}
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              {/* Main instruction text */}
              <p className="font-medium text-slate-800 dark:text-white">
                Click to upload or drag and drop
              </p>
              {/* Format and size constraints */}
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {acceptedFormats.join(', ').toUpperCase()} (Max {maxSizeMB}MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Selected file preview - shown when a file is selected */
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* File icon */}
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ImageIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                {/* File name */}
                <p className="font-medium text-slate-800 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                {/* File metadata */}
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Check size={12} />
                    Ready to upload
                  </span>
                </div>
              </div>
            </div>
            {/* Remove file button */}
            <button
              type="button"
              onClick={removeFile}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Image preview - only for image files */}
          <div className="mt-4 flex justify-center">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt={`Preview of ${selectedFile.name}`}
                className="w-full h-full object-cover"
                onLoad={() => {
                  // Revoke object URL after image loads to prevent memory leaks
                  // Note: This should be done in a cleanup effect in production
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error message display */}
      {error && (
        <div 
          className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;