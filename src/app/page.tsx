'use client';

import React, { useState, useEffect } from 'react';

import { FeaturedMemes } from '@/components/meme';
import { Button } from '@/components/ui';
import { ICONS } from '@/lib/utils/categoryIcons';

import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { Meme } from '@/lib/types/meme';

export default function Home() {
  // Homepage-specific state - always fetch hottest this week
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { loading: categoriesLoading, error: categoriesError } = useCategories();
  const { likeMeme } = useMemeInteractions();
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [localMemes, setLocalMemes] = useState<Meme[]>([]);

  // Fetch homepage memes - always hottest this week
  useEffect(() => {
    const fetchHomepageMemes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Always fetch hottest memes from this month
        const params = new URLSearchParams({
          page: '1',
          limit: '8',
          sort_by: 'likes',
          sort_order: 'desc',
          time_period: 'month'
        });
        
        const response = await fetch(`/api/memes?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch memes: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        setMemes(data.memes || []);
      } catch (err) {
        console.error('Homepage: Failed to fetch memes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch memes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomepageMemes();
  }, []); // Empty dependency array - only run once on mount

  // Initialize local memes when memes change from the hook
  useEffect(() => {
    setLocalMemes(memes);
  }, [memes]);

  // Use local memes if available, otherwise use memes from the hook
  const displayMemes = localMemes.length > 0 ? localMemes : memes;



  const handleLike = async (slug: string) => {
    try {
      const isLiked = await likeMeme(slug);
      
      // Update local state to reflect the like change
      setLikedMemes(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(slug);
        } else {
          newSet.delete(slug);
        }
        return newSet;
      });

      // Update the meme's likes count locally without refreshing the page
      const updatedMemes = localMemes.map(meme => {
        if (meme.slug === slug) {
          return {
            ...meme,
            likes_count: isLiked ? meme.likes_count + 1 : Math.max(0, meme.likes_count - 1)
          };
        }
        return meme;
      });
      
      setLocalMemes(updatedMemes);
    } catch (error) {
      console.error('Failed to like meme:', error);
    }
  };

  const handleShare = (id: string) => {
    console.log('Sharing meme:', id);
    // Implement share functionality here
  };



  // Show loading state while fetching data
  if (loading || categoriesLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to <span className="text-blue-600">IVEHITMYHEAD</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Discover, share, and create the dullest memes on the internet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" onClick={() => window.location.href = '/memes'}>
                Browse Memes
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => window.location.href = '/upload'}>
                <ICONS.Upload className="w-5 h-5 mr-2" />
                Upload Your Own
              </Button>
            </div>
          </section>

          {/* Hottest Memes This Month Section - Loading State */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Hottest Memes This Month</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  The most liked memes from the current month
                </p>
              </div>
              <Button variant="ghost" onClick={() => window.location.href = '/memes'}>
                <ICONS.ArrowRight className="w-4 h-4 mr-1" />
                View All
              </Button>
            </div>
            
            {/* Skeleton Loading Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 pb-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Show error state if there's an issue
  if (error || categoriesError) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4 flex justify-center">
              <ICONS.Star className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || categoriesError}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to <span className="text-blue-600">IVEHITMYHEAD</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover, share, and create the dullest memes on the internet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" onClick={() => window.location.href = '/memes'}>
              Browse Memes
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => window.location.href = '/upload'}>
              <ICONS.Upload className="w-5 h-5 mr-2" />
              Upload Your Own
            </Button>
          </div>
        </section>

        {/* Hottest Memes This Month Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Hottest Memes This Month</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                The most liked memes from the current month
              </p>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = '/memes'}>
              <ICONS.ArrowRight className="w-4 h-4 mr-1" />
              View All
            </Button>
          </div>
          
          {displayMemes.length > 0 ? (
            <FeaturedMemes
              memes={displayMemes}
              onLike={handleLike}
              onShare={handleShare}
              likedMemes={likedMemes}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 flex justify-center">
                <ICONS.Star className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No memes yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Be the first to upload a meme!
              </p>
              <Button onClick={() => window.location.href = '/upload'}>
                Upload First Meme
              </Button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
