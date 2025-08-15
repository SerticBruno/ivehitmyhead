'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './Button';
import { Input } from './Input';
import { Category } from '@/lib/types/meme';

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
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedImage(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
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

      const response = await fetch('/api/memes/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': 'Bearer placeholder-token' // Temporary placeholder for development
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
      setUploadedImage(null);
      
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
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Upload New Meme
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meme Image
          </label>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive || dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
              ${uploadedImage ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
            `}
          >
            <input {...getInputProps()} />
            {uploadedImage ? (
              <div className="space-y-2">
                <div className="text-green-600 dark:text-green-400">
                  ✓ {uploadedImage.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Click or drag to replace
                </div>
              </div>
            ) : (
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
            )}
          </div>
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
          />
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category (Optional)
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
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
          {isUploading ? 'Uploading...' : 'Upload Meme'}
        </Button>
      </form>
    </div>
  );
};
