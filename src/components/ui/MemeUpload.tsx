'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './Button';
import { Input } from './Input';
import { Category } from '@/lib/types/meme';
import { getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';
import { useAuth } from '@/lib/contexts/AuthContext';

interface MemeUploadProps {
  categories: Category[];
  onUploadSuccess?: () => void;
  className?: string;
}

export const MemeUpload: React.FC<MemeUploadProps> = ({
  categories,
  onUploadSuccess,
  className = ''
}) => {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive] = useState(false);

  // Create preview URL when image is selected
  useEffect(() => {
    if (uploadedImage) {
      const preview = URL.createObjectURL(uploadedImage);
      setImagePreview(preview);
      
      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(preview);
      };
    } else {
      setImagePreview(null);
    }
  }, [uploadedImage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedImage(acceptedFiles[0]);
    }
  }, []);

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setUploadedImage(null);
    setImagePreview(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !uploadedImage) {
      alert('Please provide a title and select an image');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('image', uploadedImage);
      if (selectedCategory) {
        formData.append('category_id', selectedCategory);
      }
      if (tags) {
        formData.append('tags', tags);
      }

      // Get auth token from session
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('You must be logged in to upload memes');
      }

      const response = await fetch('/api/memes/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      // Reset form
      setTitle('');
      setSelectedCategory('');
      setTags('');
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setUploadedImage(null);
      setImagePreview(null);
      
      onUploadSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload meme. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 relative ${className}`}>
      {isUploading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-500 mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Uploading your meme...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait</p>
          </div>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Upload New Meme
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meme Image
          </label>
          {imagePreview ? (
            <div className="space-y-3">
              <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className={`absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg transition-colors ${
                    isUploading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-red-600 cursor-pointer'
                  }`}
                  aria-label="Remove image"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center transition-colors ${
                  isUploading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <input {...getInputProps()} disabled={isUploading} />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isUploading ? 'Uploading...' : 'Click or drag to replace image'}
                </div>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isUploading 
                  ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600'
                  : `cursor-pointer ${
                      isDragActive || dragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`
                }
              `}
            >
              <input {...getInputProps()} disabled={isUploading} />
              <div className="space-y-2">
                <div className="text-gray-400 dark:text-gray-500">
                  📁
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive
                    ? 'Drop the image here...'
                    : 'Drag & drop an image here, or click to select'
                  }
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter meme title..."
            required
            disabled={isUploading}
          />
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category (Optional)
          </label>
          <div className="relative">
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={isUploading}
              className={`w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {/* Show icon for selected category */}
            {selectedCategory && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {(() => {
                  const selectedCat = categories.find(cat => cat.id === selectedCategory);
                  return selectedCat ? getCategoryIconOrEmoji(selectedCat.name, selectedCat.emoji) : null;
                })()}
              </div>
            )}
            {/* Dropdown arrow */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tags Input */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (Optional)
          </label>
          <Input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="funny, gaming, tech (comma separated)"
            disabled={isUploading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separate tags with commas
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isUploading || !title || !uploadedImage}
          className="w-full"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : (
            'Upload Meme'
          )}
        </Button>
      </form>
    </div>
  );
};
