'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { Button } from '@/components/ui/Button';
import { Category, Meme } from '@/lib/types/meme';
import { fetchCategoryById, fetchMemes } from '@/lib/data/mockData';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load category info
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const data = await fetchCategoryById(categoryId);
        if (data) {
          setCategory(data);
        } else {
          setError('Category not found');
        }
      } catch (error) {
        console.error('Failed to load category:', error);
        setError('Failed to load category');
      }
    };

    loadCategory();
  }, [categoryId]);

  // Load initial memes
  useEffect(() => {
    if (category) {
      loadMemes();
    }
  }, [category]);

  const loadMemes = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await fetchMemes(page, 5, category?.name); // Load 5 memes at a time
      
      if (isLoadMore) {
        setMemes(prev => [...prev, ...result.memes]);
      } else {
        setMemes(result.memes);
      }
      
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load memes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadMemes(true);
    }
  };

  const handleLike = (id: string) => {
    setMemes(prev => prev.map(meme => 
      meme.id === id 
        ? { ...meme, likes: meme.likes + 1 }
        : meme
    ));
  };

  const handleShare = (id: string) => {
    console.log('Sharing meme:', id);
    // Implement share functionality here
  };

  const handleComment = (id: string) => {
    console.log('Commenting on meme:', id);
    // Implement comment functionality here
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={() => {}} />
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

  if (loading && !category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={() => {}} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/categories')}
                className="flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Categories</span>
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">{category?.emoji}</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {category?.name} <span className="text-blue-600">Memes</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto">
              {category?.description}
            </p>
            <div className="text-lg text-gray-500 dark:text-gray-400">
              {category?.count.toLocaleString()} memes in this category
            </div>
          </div>
        </section>

        {/* Memes Grid with Infinite Scroll */}
        <section className="max-w-4xl mx-auto">
          <MemeGrid
            memes={memes}
            onLike={handleLike}
            onShare={handleShare}
            onComment={handleComment}
            loading={loading}
            showLoadMore={true}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            layout="vertical"
          />
        </section>

        {/* No memes found */}
        {!loading && memes.length === 0 && (
          <section className="text-center py-12">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-xl font-semibold mb-2">No memes found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              Looks like there are no memes in this category yet. Be the first to upload something hilarious!
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
