'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/types/meme';
import { getCategoryIconOrEmoji, ICONS } from '@/lib/utils/categoryIcons';
import { useAuth } from '@/lib/contexts/AuthContext';

interface MemeUploadProps {
  categories: Category[];
  onUploadSuccess?: () => void;
  className?: string;
  /** Square edges for neo-brutalist layouts (e.g. admin) */
  sharpCorners?: boolean;
}

export const MemeUpload: React.FC<MemeUploadProps> = ({
  categories,
  onUploadSuccess,
  className = '',
  sharpCorners = false,
}) => {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!categoryMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (categoryMenuRef.current?.contains(e.target as Node)) return;
      setCategoryMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCategoryMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [categoryMenuOpen]);

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
      alert('You need a title and an image. The bare minimum exists for a reason.');
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
        throw new Error('Admin session required to publish memes to the library');
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
    <div
      className={cn(
        'bg-white dark:bg-gray-800 p-6 relative shadow-sm',
        sharpCorners
          ? 'rounded-none border-2 border-zinc-300 dark:border-zinc-600'
          : 'rounded-lg border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {isUploading && (
        <div
          className={cn(
            'absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 flex items-center justify-center',
            sharpCorners ? 'rounded-none' : 'rounded-lg'
          )}
        >
          <div className="text-center">
            <div
              className={cn(
                'inline-block animate-spin h-12 w-12 border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-500 mb-4',
                sharpCorners ? 'rounded-none' : 'rounded-full'
              )}
            />
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
              <div
                className={cn(
                  'relative border-2 border-gray-300 dark:border-gray-600 overflow-hidden',
                  sharpCorners ? 'rounded-none' : 'rounded-lg'
                )}
              >
                <div className="relative w-full h-96">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className={cn(
                    'absolute top-2 right-2 bg-red-500 text-white p-2 shadow-lg transition-colors',
                    sharpCorners ? 'rounded-none' : 'rounded-full',
                    isUploading
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-red-600 cursor-pointer'
                  )}
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
                className={cn(
                  'border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-center transition-colors',
                  sharpCorners ? 'rounded-none' : 'rounded-lg',
                  isUploading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
                )}
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
              className={cn(
                'border-2 border-dashed p-6 text-center transition-colors',
                sharpCorners ? 'rounded-none' : 'rounded-lg',
                isUploading
                  ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600'
                  : [
                      'cursor-pointer',
                      isDragActive || dragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
                    ]
              )}
            >
              <input {...getInputProps()} disabled={isUploading} />
              <div className="space-y-2">
                <div className="text-gray-400 dark:text-gray-500">
                  📁
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isDragActive
                    ? 'Drop it. Own it.'
                    : 'Drag a file in or click and pretend you had a workflow'
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
            placeholder="A working title for the bit"
            required
            disabled={isUploading}
            className={
              sharpCorners
                ? 'rounded-none border-2 border-zinc-300 dark:border-zinc-600 focus:border-zinc-700 dark:focus:border-zinc-400'
                : undefined
            }
          />
        </div>

        {/* Custom category combobox: native select cannot render icons in options */}
        <div ref={categoryMenuRef} className="relative">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category (Optional)
          </label>
          <button
            id="category"
            type="button"
            disabled={isUploading}
            aria-haspopup="listbox"
            aria-expanded={categoryMenuOpen}
            aria-controls="category-listbox"
            onClick={() => !isUploading && setCategoryMenuOpen((o) => !o)}
            className={cn(
              'flex w-full items-center gap-2 border px-3 py-2 text-left text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white',
              sharpCorners
                ? 'rounded-none border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-gray-800'
                : 'rounded-md border border-gray-300 dark:border-gray-600 bg-white',
              isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            )}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-700 dark:text-gray-200">
              {(() => {
                const cat = categories.find((c) => c.id === selectedCategory);
                return cat ? (
                  getCategoryIconOrEmoji(cat.name, cat.emoji)
                ) : (
                  <ICONS.FolderOpen className="h-5 w-5 text-gray-400" aria-hidden />
                );
              })()}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {categories.find((c) => c.id === selectedCategory)?.name ?? 'Select a category'}
            </span>
            <svg
              className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${categoryMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {categoryMenuOpen && (
            <ul
              id="category-listbox"
              role="listbox"
              aria-label="Category"
              className={cn(
                'absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto border bg-white py-1 shadow-lg dark:bg-gray-800',
                sharpCorners
                  ? 'rounded-none border-2 border-zinc-300 dark:border-zinc-600'
                  : 'rounded-md border border-gray-300 dark:border-gray-600'
              )}
            >
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedCategory === ''}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setSelectedCategory('');
                    setCategoryMenuOpen(false);
                  }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-400">
                    <ICONS.FolderOpen className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">No category</span>
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedCategory === category.id}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 dark:bg-blue-900/25'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCategoryMenuOpen(false);
                    }}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                      {getCategoryIconOrEmoji(category.name, category.emoji)}
                    </span>
                    <span className="min-w-0 truncate">{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
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
          className={cn(
            'w-full',
            sharpCorners &&
              'rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold'
          )}
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
            'Send it live'
          )}
        </Button>
      </form>
    </div>
  );
};
