'use client';

import React, { useState } from 'react';
import { MemeGrid } from '@/components/meme';
import { Button } from '@/components/ui';
import { useMemes } from '@/lib/hooks/useMemes';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';

export default function TrendingPage() {
  const [timeFilter, setTimeFilter] = useState('today');
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());

  // Fetch trending memes (sorted by likes)
  const { memes, loading, error, hasMore, loadMore, refresh } = useMemes({
    sort_by: 'likes',
    sort_order: 'desc',
    limit: 20
  });

  const { likeMeme } = useMemeInteractions();



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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4">😢</div>
            <h2 className="text-2xl font-bold mb-2">Failed to load trending memes</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔥 Trending Memes</h1>
              <p className="text-gray-600 dark:text-gray-400">
                The hottest memes that everyone is talking about right now
              </p>
            </div>
            
            {/* Time Filter */}
            <div className="flex gap-2">
              {[
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
              ].map((filter) => (
                <Button
                  key={filter.value}
                  variant={timeFilter === filter.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {memes.reduce((sum, meme) => sum + meme.likes_count, 0).toLocaleString()}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Total Likes</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {memes.reduce((sum, meme) => sum + meme.shares_count, 0).toLocaleString()}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Total Shares</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {memes.length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Trending Memes</p>
            </div>
          </div>
        </section>

        {/* Trending Memes Grid */}
        <section>
          <MemeGrid
            memes={memes}
            onLike={handleLike}
            onShare={handleShare}
            loading={loading}
            showLoadMore={true}
            onLoadMore={loadMore}
            hasMore={hasMore}
            likedMemes={likedMemes}
          />
        </section>
      </main>
    </div>
  );
} 