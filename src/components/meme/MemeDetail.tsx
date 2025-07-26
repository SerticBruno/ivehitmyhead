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
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <span className="text-lg">←</span>
          <span className="font-medium">Back to Home</span>
        </Button>
      </div>

      {/* Main meme display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 h-[calc(100vh-240px)] flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="relative mb-3">
                <h1 className={cn(
                  "text-3xl font-bold text-gray-900 dark:text-white transition-all duration-300 leading-tight",
                  isLoading && "opacity-0"
                )}>
                  {meme.title}
                </h1>
                {isLoading && (
                  <div className="absolute inset-0 w-80 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                by <span className="font-semibold text-gray-800 dark:text-gray-200">{meme.author}</span>
              </p>
            </div>
            <div className="text-right ml-6">
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full">
                {meme.createdAt}
              </span>
            </div>
          </div>
          
          {meme.tags && meme.tags.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {meme.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image container with navigation */}
        <div className="relative flex-1 flex items-center justify-center p-8">
          {/* Image with smooth transitions */}
          <div className="w-full max-w-3xl h-[500px] relative bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden">
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
              <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            )}
          </div>

          {/* Navigation arrows - positioned relative to the container */}
          <button
            onClick={() => handleNavigate('prev')}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl text-gray-700 dark:text-gray-300 p-4 rounded-full transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-600"
            aria-label="Previous meme"
          >
            <span className="text-2xl">←</span>
          </button>
          
          <button
            onClick={() => handleNavigate('next')}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl text-gray-700 dark:text-gray-300 p-4 rounded-full transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-600"
            aria-label="Next meme"
          >
            <span className="text-2xl">→</span>
          </button>
        </div>

        {/* Footer with actions */}
        <div className="p-8 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Button
                variant="ghost"
                onClick={handleLike}
                className="flex items-center space-x-3 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <span className="text-2xl">👍</span>
                <span className="font-semibold text-lg">{meme.likes.toLocaleString()}</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleComment}
                className="flex items-center space-x-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <span className="text-2xl">💬</span>
                <span className="font-semibold text-lg">{meme.comments.toLocaleString()}</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleShare}
                className="flex items-center space-x-3 hover:bg-green-50 dark:hover:bg-green-900/20 px-4 py-2 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <span className="text-2xl">📤</span>
                <span className="font-semibold text-lg">{meme.shares.toLocaleString()}</span>
              </Button>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-full">
              <span className="font-medium">Use ← → to navigate</span>
              <span>•</span>
              <span className="font-medium">ESC to go back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation hint */}
      <div className="mt-8 text-center sm:hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 rounded-full inline-block">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Tap the arrows to navigate between memes
          </p>
        </div>
      </div>
    </div>
  );
};

export { MemeDetail };
export type { MemeDetailProps }; 