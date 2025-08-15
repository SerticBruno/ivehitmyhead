'use client';

import React, { useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { Button } from '@/components/ui';
import { useMemes } from '@/lib/hooks/useMemes';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { Meme } from '@/lib/types/meme';

export default function MemesPage() {
  const { memes, loading, error, hasMore, loadMore, refresh } = useMemes({ limit: 12 });
  const { likeMeme, loading: likeLoading } = useMemeInteractions();
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());

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

      // Refresh the memes to get updated counts
      refresh();
    } catch (error) {
      console.error('Failed to like meme:', error);
    }
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
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4">😢</div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
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
        {/* Header Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">All Memes</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover the latest and greatest memes from our community
              </p>
            </div>
            <Button size="lg" onClick={() => window.location.href = '/upload'}>
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
            onLoadMore={loadMore}
            hasMore={hasMore}
            likedMemes={likedMemes}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}


