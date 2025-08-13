'use client';

import React, { useState, useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { Meme } from '@/lib/types/meme';
import { fetchMemes } from '@/lib/data/mockData';

export default function CategoriesPage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial memes
  useEffect(() => {
    loadMemes();
  }, []);

  const loadMemes = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await fetchMemes(page, 5); // Load 5 memes at a time
      
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

  if (loading && memes.length === 0) {
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
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            All <span className="text-blue-600">Memes</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover memes from all categories. Scroll through our entire collection 
            and find something that makes you laugh!
          </p>
        </section>

        {/* Memes Grid with Infinite Scroll */}
        <section className="max-w-6xl mx-auto">
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
              Looks like there are no memes yet. Be the first to upload something hilarious!
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
