'use client';

import React, { useEffect, useState } from 'react';
import { MemeUpload } from '@/components/ui/MemeUpload';
import { Category } from '@/lib/types/meme';

export default function UploadPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleUploadSuccess = () => {
    alert('Meme uploaded successfully!');
    // You can redirect to the memes page or refresh the list
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">Loading categories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Upload Your Meme
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Share your favorite memes with the community
          </p>
        </div>
        
        <MemeUpload 
          categories={categories}
          onUploadSuccess={handleUploadSuccess}
          className="max-w-2xl"
        />
      </div>
    </div>
  );
}
