'use client';

import React, { useState, useEffect } from 'react';

import { FeaturedMemes } from '@/components/meme';
import { Button, MemeGeneratorShowcase } from '@/components/ui';
import { ICONS } from '@/lib/utils/categoryIcons';

import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { Meme } from '@/lib/types/meme';
import { shareMemeWithFallback } from '@/lib/utils/shareUtils';

export default function Home() {
  // Homepage-specific state - hottest in rolling 30-day window
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { loading: categoriesLoading, error: categoriesError } = useCategories();
  const { likeMeme } = useMemeInteractions();
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [localMemes, setLocalMemes] = useState<Meme[]>([]);

  // Fetch homepage memes - hottest by likes over the last month (rolling 30 days)
  useEffect(() => {
    const fetchHomepageMemes = async () => {
      try {
        setLoading(true);
        setError(null);
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
        
        const homepageMemes: Meme[] = data.memes || [];
        setMemes(homepageMemes);

        // If API includes liked state, hydrate immediately.
        const initiallyLiked = homepageMemes
          .filter((meme) => meme.is_liked)
          .map((meme) => meme.slug);
        if (initiallyLiked.length > 0) {
          setLikedMemes(new Set(initiallyLiked));
        }
      } catch (err) {
        console.error('Homepage: Failed to fetch memes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch memes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomepageMemes();
  }, []); // Empty dependency array - only run once on mount

  // Keep homepage likes in sync with the logged-in user's likes across reloads.
  useEffect(() => {
    const fetchLikedMemes = async () => {
      try {
        const response = await fetch('/api/memes/liked');
        if (!response.ok) return;
        const data = await response.json();
        const likedSlugs: string[] = data.likedMemes || [];
        setLikedMemes(new Set(likedSlugs));
      } catch (err) {
        console.error('Homepage: Failed to fetch liked memes:', err);
      }
    };

    fetchLikedMemes();
  }, []);

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

  const handleShare = async (id: string) => {
    // Find the meme by ID to get its slug
    const meme = displayMemes.find(m => m.id === id);
    if (!meme) {
      console.error('Meme not found for sharing:', id);
      return;
    }
    
    // Note: We don't update local state here since this is just a preview
    // The actual share count will be updated when viewing the full meme
    await shareMemeWithFallback(meme.title, meme.slug);
  };



  // Show loading state while fetching data
  if (loading || categoriesLoading) {
    return (
      <div className="bg-[#f7f4ee] dark:bg-gray-950">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <section className="text-center mb-12 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
              Welcome to <span className="text-blue-700 dark:text-blue-300">IVEHITMYHEAD</span>
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover, share, and create the dullest memes on the internet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
                onClick={() => window.location.href = '/memes'}
              >
                Open the feed
              </Button>
            </div>
          </section>

          {/* Meme Generator Showcase */}
          <MemeGeneratorShowcase />

          {/* Hottest memes (last month) - loading */}
          <section className="mb-12">
            <div className="mb-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Hottest Memes - Last Month</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Who hit like this month. That is the entire bar for inclusion.
                </p>
              </div>
            </div>
            
            {/* Skeleton Loading Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white dark:bg-gray-800 rounded-none shadow-md overflow-hidden">
                    <div className="p-4 pb-3">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-none mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-none mb-2"></div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-none"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-none w-20"></div>
                      </div>
                    </div>
                    <div className="h-[calc(100vh-300px)] min-h-[400px] max-h-[800px] border-y-2 border-zinc-700 dark:border-zinc-400 bg-gray-200 dark:bg-gray-700 sm:h-64 sm:min-h-0 sm:max-h-none" />
                    <div className="p-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-none w-12"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-none w-12"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-none w-12"></div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-none w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button variant="ghost" className="rounded-none border-2 border-transparent uppercase tracking-wide font-bold" onClick={() => window.location.href = '/memes'}>
                View All
                <ICONS.ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // Show error state if there's an issue
  if (error || categoriesError) {
    return (
      <div className="bg-[#f7f4ee] dark:bg-gray-950">
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
    <div className="bg-[#f7f4ee] dark:bg-gray-950">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            Welcome to <span className="text-blue-700 dark:text-blue-300">IVEHITMYHEAD</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover, share, and create the dullest memes on the internet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 rounded-none border-2 border-zinc-700 dark:border-zinc-400 uppercase tracking-wide font-bold"
              onClick={() => window.location.href = '/memes'}
            >
              Open the feed
            </Button>
          </div>
        </section>

        {/* Meme Generator Showcase */}
        <MemeGeneratorShowcase />

        {/* Hottest memes (last month) */}
        <section className="mb-12">
          <div className="mb-6">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Hottest Memes - Last Month</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Who hit like this month. That is the entire bar for inclusion.
              </p>
            </div>
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
                Quiet month. The void stares back. Someone could upload something.
              </p>
            </div>
          )}
          <div className="mt-6 flex justify-center">
            <Button variant="ghost" className="rounded-none border-2 border-transparent uppercase tracking-wide font-bold" onClick={() => window.location.href = '/memes'}>
              View All
              <ICONS.ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </section>

      </main>
    </div>
  );
}
