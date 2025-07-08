'use client';

import React, { useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { Button } from '@/components/ui';

// Mock trending memes data
const trendingMemes = [
  {
    id: 'trend1',
    title: 'Viral Programming Joke',
    imageUrl: '/images/memes/475221154_1018967710275617_644663250847847580_n.jpg',
    author: 'ViralCoder',
    likes: 5432,
    comments: 234,
    shares: 156,
    createdAt: '1 hour ago',
    tags: ['viral', 'programming', 'trending']
  },
  {
    id: 'trend2',
    title: 'Epic Gaming Moment',
    imageUrl: '/images/memes/475519798_499216039865627_6973489596584206514_n.jpg',
    author: 'GamingPro',
    likes: 4321,
    comments: 189,
    shares: 98,
    createdAt: '3 hours ago',
    tags: ['gaming', 'epic', 'moment']
  },
  {
    id: 'trend3',
    title: 'Work From Home Reality',
    imageUrl: '/images/memes/475866307_10227739990630851_7466446956354749205_n.jpg',
    author: 'WFHMaster',
    likes: 3987,
    comments: 145,
    shares: 87,
    createdAt: '5 hours ago',
    tags: ['work', 'home', 'reality']
  },
  {
    id: 'trend4',
    title: 'Coffee Addict Confessions',
    imageUrl: '/images/memes/450716012_815648060673048_6644857007895838499_n.jpg',
    author: 'CoffeeLover',
    likes: 3654,
    comments: 123,
    shares: 76,
    createdAt: '7 hours ago',
    tags: ['coffee', 'addict', 'confessions']
  },
  {
    id: 'trend5',
    title: 'Debugging Life Problems',
    imageUrl: '/images/memes/451184802_330450540132615_4677958239563939281_n.jpg',
    author: 'LifeDebugger',
    likes: 3210,
    comments: 98,
    shares: 54,
    createdAt: '9 hours ago',
    tags: ['debugging', 'life', 'problems']
  },
  {
    id: 'trend6',
    title: 'Weekend Plans vs Reality',
    imageUrl: '/images/memes/449386695_490799530140888_4993934697572710128_n.jpg',
    author: 'WeekendPlanner',
    likes: 2987,
    comments: 87,
    shares: 43,
    createdAt: '11 hours ago',
    tags: ['weekend', 'plans', 'reality']
  }
];

export default function TrendingPage() {
  const [memes, setMemes] = useState(trendingMemes);
  const [timeFilter, setTimeFilter] = useState('today');

  const handleSearch = (query: string) => {
    console.log('Searching trending memes for:', query);
    // Implement search functionality here
  };

  const handleLike = (id: string) => {
    setMemes(prev => prev.map(meme => 
      meme.id === id 
        ? { ...meme, likes: meme.likes + 1 }
        : meme
    ));
  };

  const handleShare = (id: string) => {
    console.log('Sharing trending meme:', id);
    // Implement share functionality here
  };

  const handleComment = (id: string) => {
    console.log('Commenting on trending meme:', id);
    // Implement comment functionality here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={handleSearch} />
      
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
                {memes.reduce((sum, meme) => sum + meme.likes, 0).toLocaleString()}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Total Likes</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {memes.reduce((sum, meme) => sum + meme.shares, 0).toLocaleString()}
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
            onComment={handleComment}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
} 