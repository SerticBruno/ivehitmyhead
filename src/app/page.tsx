'use client';

import React, { useState } from 'react';

import { FeaturedMemes } from '@/components/meme';
import { Button } from '@/components/ui';
import { ICONS } from '@/lib/utils/categoryIcons';

import { useMemes } from '@/lib/hooks/useMemes';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';



export default function Home() {
  // Fetch real memes and categories - sorted by views for featured section
  const { memes, loading: memesLoading, error: memesError } = useMemes({ 
    limit: 6, 
    sort_by: 'views', 
    sort_order: 'desc'
  });
  const { loading: categoriesLoading, error: categoriesError } = useCategories();
  const { likeMeme } = useMemeInteractions();
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [localMemes, setLocalMemes] = useState<typeof memes>([]);

  // Initialize local memes when memes change from the hook
  React.useEffect(() => {
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
  if (memesLoading || categoriesLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4 flex justify-center">
              <ICONS.Clock className="w-16 h-16 text-gray-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Loading...</h2>
            <p className="text-gray-600 dark:text-gray-400">Fetching the most viewed memes</p>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if there's an issue
  if (memesError || categoriesError) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4 flex justify-center">
              <ICONS.Star className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {memesError || categoriesError}
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

        {/* Most Viewed Memes Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Most Viewed Memes</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                The memes that everyone is talking about
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
