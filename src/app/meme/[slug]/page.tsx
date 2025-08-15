'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import { Meme } from '@/lib/types/meme';
import Image from 'next/image';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';

export default function MemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [meme, setMeme] = useState<Meme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const { likeMeme, recordView } = useMemeInteractions();

  useEffect(() => {
    const fetchMeme = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/memes/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Meme not found');
          } else {
            throw new Error(`Failed to fetch meme: ${response.statusText}`);
          }
          return;
        }

        const data = await response.json();
        setMeme(data.meme);
        setLikesCount(data.meme.likes_count || 0);
      } catch (err) {
        console.error('Error fetching meme:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch meme');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchMeme();
    }
  }, [slug, recordView]);

  const handleLike = async () => {
    if (!meme) return;
    
    try {
      const liked = await likeMeme(slug);
      setIsLiked(liked);
      
      // Update local likes count
      if (liked) {
        setLikesCount(prev => prev + 1);
      } else {
        setLikesCount(prev => Math.max(0, prev - 1));
      }
      
      // Refresh meme data to get updated counts
      const response = await fetch(`/api/memes/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setMeme(data.meme);
        setLikesCount(data.meme.likes_count || 0);
      }
    } catch (error) {
      console.error('Failed to like meme:', error);
    }
  };

  const handleShare = () => {
    console.log('Sharing meme:', meme?.id);
    // Implement share functionality here
  };

  const handleComment = () => {
    console.log('Commenting on meme:', meme?.id);
    // Implement comment functionality here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={() => {}} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading meme...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !meme) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={() => {}} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4">😢</div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {error || 'Meme not found'}
            </h1>
            <Button onClick={() => router.push('/memes')}>
              Back to Memes
            </Button>
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
        {/* Navigation */}
        <section className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/memes')}
            className="flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Memes</span>
          </Button>
        </section>

        {/* Meme Content */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {meme.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>by {meme.author?.display_name || meme.author?.username || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(meme.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{meme.views.toLocaleString()} views</span>
                  </div>
                </div>
                
                {/* Category Badge */}
                {meme.category && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-full">
                    <span>{meme.category.emoji}</span>
                    <span className="text-sm font-medium">{meme.category.name}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {meme.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {meme.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Image */}
            <div className="relative w-full bg-gray-100 dark:bg-gray-900">
              <div className="relative w-full" style={{ minHeight: '400px' }}>
                <Image
                  src={meme.image_url}
                  alt={meme.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  priority
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isLiked ? 'text-red-500' : ''
                    }`}
                  >
                    <span className="text-2xl">{isLiked ? '❤️' : '👍'}</span>
                    <span className="font-medium">{likesCount.toLocaleString()}</span>
                  </button>
                  
                  <button
                    onClick={handleComment}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-2xl">💬</span>
                    <span className="font-medium">{meme.comments_count.toLocaleString()}</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-2xl">📤</span>
                    <span className="font-medium">{meme.shares_count.toLocaleString()}</span>
                  </button>
                </div>

                {/* Share URL */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Share:</span>
                  <input
                    type="text"
                    value={`${window.location.origin}/meme/${meme.slug}`}
                    readOnly
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
