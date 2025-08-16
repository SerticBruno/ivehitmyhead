'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { Button } from '@/components/ui/Button';
import { Category } from '@/lib/types/meme';
import { useMemes } from '@/lib/hooks/useMemes';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);


  // Fetch categories to find the current one
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Fetch memes for this category
  const { memes, loading: memesLoading, error: memesError, hasMore, loadMore, refresh } = useMemes({
    category_id: category?.id, // We'll set this after finding the category
    limit: 12
  });

  const { likeMeme } = useMemeInteractions();

  // Set the current category when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      // Try to find by ID first (if slug is a valid UUID/ID)
      let currentCategory = categories.find(cat => cat.id === slug);
      
      // If not found by ID, try to find by slug (converted name)
      if (!currentCategory) {
        currentCategory = categories.find(cat => 
          cat.name.toLowerCase().replace(/\s+/g, '-') === slug
        );
      }
      
      if (currentCategory) {
        setCategory(currentCategory);
      } else {
        setError('Category not found');
      }
    }
  }, [categories, slug]);

  // Handle errors
  useEffect(() => {
    if (categoriesError) {
      setError('Failed to load categories');
    } else if (memesError) {
      setError('Failed to load memes');
    }
  }, [categoriesError, memesError]);

  const handleLike = async (slug: string) => {
    console.log('Categories page: handleLike called with slug:', slug);
    try {
      const isLiked = await likeMeme(slug);
      console.log('Categories page: likeMeme result:', isLiked);
      
      // Refresh the memes to get updated counts
      refresh();
    } catch (error) {
      console.error('Categories page: Failed to like meme:', error);
    }
  };

  const handleShare = (id: string) => {
    console.log('Sharing meme:', id);
    // Implement share functionality here
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {error}
            </h1>
            <Button onClick={() => router.push('/categories')}>
              Back to Categories
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (categoriesLoading || !category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading category...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {category.description || `Browse the best ${category.name.toLowerCase()} memes`}
              </p>
            </div>
            <Button onClick={() => router.push('/categories')}>
              Back to Categories
            </Button>
          </div>
          
          {/* Category Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{memes.length}</div>
              <div className="text-gray-600 dark:text-gray-400">Total Memes</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {memes.reduce((total, meme) => total + (meme.likes_count || 0), 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Likes</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {memes.reduce((total, meme) => total + (meme.views || 0), 0)}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Views</div>
            </div>
          </div>
        </div>

        {/* Memes Grid */}
        {memesLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading memes...</p>
          </div>
        ) : memes.length > 0 ? (
          <div>
            <MemeGrid 
              memes={memes}
              onLike={handleLike}
              onShare={handleShare}
            />
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button onClick={loadMore} disabled={memesLoading}>
                  {memesLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No memes found in this category
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to upload a meme to {category.name}!
            </p>
            <Button onClick={() => router.push('/upload')}>
              Upload Meme
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
