'use client';

import React, { useState, useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { Button } from '@/components/ui';
import { Meme } from '@/lib/types/meme';
import { fetchMemes } from '@/lib/data/mockData';

export default function MemesPage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadMemes();
  }, []);

  const loadMemes = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const result = await fetchMemes(page, 12);
      
      if (append) {
        setMemes(prev => [...prev, ...result.memes]);
      } else {
        setMemes(result.memes);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading memes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMemes(currentPage + 1, true);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">All Memes</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover the latest and greatest memes from our community
              </p>
            </div>
            <Button size="lg">
              📤 Upload Meme
            </Button>
          </div>
        </section>

        {/* Memes Grid */}
        <section>
          <MemeGrid
            memes={memes}
            onLike={handleLike}
            onShare={handleShare}
            onComment={handleComment}
            loading={loading}
            showLoadMore={true}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}


