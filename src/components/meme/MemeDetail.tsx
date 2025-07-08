import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MemeDetailProps {
  meme: {
    id: string;
    title: string;
    imageUrl: string;
    author: string;
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
    tags?: string[];
  } | null;
  isLoading?: boolean;
  transitionDirection?: 'left' | 'right' | null;
  onNavigate: (direction: 'prev' | 'next') => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onComment: (id: string) => void;
}

const MemeDetail: React.FC<MemeDetailProps> = ({
  meme,
  isLoading = false,
  transitionDirection = null,
  onNavigate,
  onLike,
  onShare,
  onComment
}) => {
  const router = useRouter();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLoading) return; // Prevent navigation during loading
      
      switch (event.key) {
        case 'ArrowLeft':
          onNavigate('prev');
          break;
        case 'ArrowRight':
          onNavigate('next');
          break;
        case 'Escape':
          router.push('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, router, isLoading]);

  const handleLike = () => {
    if (meme && !isLoading) onLike(meme.id);
  };

  const handleShare = () => {
    if (meme && !isLoading) onShare(meme.id);
  };

  const handleComment = () => {
    if (meme && !isLoading) onComment(meme.id);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!isLoading) {
      onNavigate(direction);
    }
  };

  // Show loading state if no meme
  if (!meme) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Button>
      </div>

      {/* Main meme display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-200px)] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 h-32 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="relative">
                <h1 className={cn(
                  "text-2xl font-bold text-gray-900 dark:text-white transition-all duration-300 absolute inset-0",
                  isLoading && "opacity-0"
                )}>
                  {meme.title}
                </h1>
                {isLoading && (
                  <div className="w-64 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                by <span className="font-medium">{meme.author}</span>
              </p>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {meme.createdAt}
            </span>
          </div>
          
          {meme.tags && meme.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {meme.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image container with navigation */}
        <div className="relative flex-1 flex items-center justify-center">
          {/* Navigation arrows */}
          <button
            onClick={() => handleNavigate('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Previous meme"
          >
            <span className="text-xl">←</span>
          </button>
          
          <button
            onClick={() => handleNavigate('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Next meme"
          >
            <span className="text-xl">→</span>
          </button>

          {/* Image with smooth transitions */}
          <div className="w-full max-w-2xl h-96 relative">
            <Image
              src={meme.imageUrl}
              alt={meme.title}
              fill
              className={cn(
                "object-contain transition-all duration-300",
                isLoading && "opacity-0",
                transitionDirection === 'left' && "transform -translate-x-4",
                transitionDirection === 'right' && "transform translate-x-4"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              priority
            />
            {isLoading && (
              <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
            )}
          </div>
        </div>

        {/* Footer with actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 h-20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={handleLike}
                className="flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                disabled={isLoading}
              >
                <span className="text-xl">👍</span>
                <span className="font-medium">{meme.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleComment}
                className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                disabled={isLoading}
              >
                <span className="text-xl">💬</span>
                <span className="font-medium">{meme.comments}</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleShare}
                className="flex items-center space-x-2 hover:bg-green-50 dark:hover:bg-green-900/20"
                disabled={isLoading}
              >
                <span className="text-xl">📤</span>
                <span className="font-medium">{meme.shares}</span>
              </Button>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Use ← → to navigate</span>
              <span>•</span>
              <span>ESC to go back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation hint */}
      <div className="mt-6 text-center sm:hidden">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tap the arrows to navigate between memes
        </p>
      </div>
    </div>
  );
};

export { MemeDetail };
export type { MemeDetailProps }; 