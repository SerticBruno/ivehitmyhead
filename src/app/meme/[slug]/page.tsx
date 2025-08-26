'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime, formatTime } from '@/lib/utils';
import { Meme } from '@/lib/types/meme';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { ICONS, getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';

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
  const hasRecordedView = useRef(false);

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
        
        // Record view after successful fetch, but only once per meme load
        if (!hasRecordedView.current) {
          recordView(slug);
          hasRecordedView.current = true;
        }
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
      
      // No need to refresh meme data - we're managing counts locally
      // This prevents unnecessary view increments
    } catch (error) {
      console.error('Failed to like meme:', error);
    }
  };

  const handleShare = () => {
    console.log('Sharing meme:', meme?.id);
    // Implement share functionality here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton Loading State */}
          <section className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Image Skeleton */}
              <div className="relative w-full bg-gray-100 dark:bg-gray-900">
                <div className="relative w-full bg-gray-200 dark:bg-gray-700" style={{ height: '70vh', maxHeight: '70vh' }}>
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse">
                      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Skeleton */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="flex items-center space-x-6">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-20"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-20"></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error || !meme) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4 flex justify-center">
              <ICONS.Star className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {error || 'Meme not found'}
            </h1>
            <Button onClick={() => router.push('/memes')}>
              Back to Memes
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Meme Content - Image First, Info Below */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            {/* Meme Image - Full Focus */}
            <div className="relative w-full bg-gray-50 dark:bg-gray-900">
              <div className="relative w-full p-4" style={{ height: '75vh', maxHeight: '75vh' }}>
                <Image
                  src={meme.image_url}
                  alt={meme.title}
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  priority
                />
              </div>
            </div>

            {/* Minimal Info Below Image */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {meme.title}
              </h1>
              
                             {/* Minimal Meta Info */}
               <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                 {/* Author */}
                 <span className="font-medium text-gray-900 dark:text-white">
                   {meme.author?.display_name || meme.author?.username || 'Unknown'}
                 </span>
                 
                 {/* Time */}
                 <span>{formatRelativeTime(meme.created_at)}</span>
                 
                 {/* Views */}
                 <span>{meme.views.toLocaleString()} views</span>
                 
                 {/* Category */}
                 {meme.category && (
                   <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                     {getCategoryIconOrEmoji(meme.category.name, meme.category.emoji)}
                     <span>{meme.category.name}</span>
                   </div>
                 )}
               </div>

              {/* Tags - Only if they exist */}
              {meme.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {meme.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isLiked 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isLiked ? (
                      <ICONS.Heart className="w-5 h-5 fill-current" />
                    ) : (
                      <ICONS.ThumbsUp className="w-5 h-5" />
                    )}
                    <span className="font-medium">{likesCount.toLocaleString()}</span>
                  </button>
                  
                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ICONS.Share2 className="w-5 h-5" />
                    <span className="font-medium">{meme.shares_count.toLocaleString()}</span>
                  </button>
                </div>

                {/* Share URL */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/meme/${meme.slug}`}
                    readOnly
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/meme/${meme.slug}`);
                    }}
                    className="px-3 py-2"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
