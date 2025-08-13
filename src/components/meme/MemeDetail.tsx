import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { MemeDetailProps } from '@/lib/types/meme';

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
  const [isZoomed, setIsZoomed] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLoading) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          onNavigate('prev');
          break;
        case 'ArrowRight':
          onNavigate('next');
          break;
        case 'Escape':
          if (isZoomed) {
            setIsZoomed(false);
          } else {
            router.push('/');
          }
          break;
        case 'z':
        case 'Z':
          setIsZoomed(!isZoomed);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, router, isLoading, isZoomed]);

  // Reset zoom when meme changes
  useEffect(() => {
    setIsZoomed(false);
  }, [meme?.id]);

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

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
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
    <div className="max-w-7xl mx-auto px-4">
      {/* Main content - Image and stats side by side */}
      <div className="grid lg:grid-cols-1 gap-6">
        {/* Meme image (full width) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Image container - constrained to screen height */}
            <div className="relative bg-gray-50 dark:bg-gray-900 p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <div 
                className={cn(
                  "relative mx-auto transition-all duration-300 cursor-pointer flex items-center justify-center",
                  isZoomed ? "max-w-none" : "max-w-4xl"
                )}
                onClick={toggleZoom}
                style={{ height: 'calc(100vh - 250px)' }}
              >
                <Image
                  src={meme.imageUrl}
                  alt={meme.title}
                  fill
                  className={cn(
                    "object-contain transition-all duration-300 rounded-lg",
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
                
                {/* Zoom indicator */}
                {!isZoomed && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Click to zoom • Z
                  </div>
                )}
              </div>
            </div>

            {/* Navigation controls */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handleNavigate('prev')}
                  className="flex items-center space-x-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  disabled={isLoading}
                >
                  <span>←</span>
                  <span>Prev</span>
                </Button>
                
                {/* Meme info and actions integrated in navigation area */}
                <div className="flex-1 mx-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {meme.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {meme.author}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {meme.createdAt}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats, Actions, and Tags */}
                    <div className="flex items-center space-x-3">
                      {/* Tags positioned to the left of action buttons */}
                      {meme.tags && meme.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {meme.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-md dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all duration-200 cursor-pointer hover:scale-105"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleLike}
                          disabled={isLoading}
                          className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 rounded-lg border border-red-200 hover:border-red-300 dark:border-red-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group p-2 shadow-md"
                        >
                          <div className="font-bold text-base text-red-700 dark:text-red-300 mb-1">{meme.likes.toLocaleString()}</div>
                          <div className="text-xs font-medium text-red-600 dark:text-red-400">Like</div>
                        </button>
                        <button
                          onClick={handleComment}
                          disabled={isLoading}
                          className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 rounded-lg border border-blue-200 hover:border-blue-300 dark:border-blue-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group p-2 shadow-md"
                        >
                          <div className="font-bold text-base text-blue-700 dark:text-blue-300 mb-1">{meme.comments.toLocaleString()}</div>
                          <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Comment</div>
                        </button>
                        <button
                          onClick={handleShare}
                          disabled={isLoading}
                          className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-lg border border-green-200 hover:border-green-300 dark:border-green-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group p-2 shadow-md"
                        >
                          <div className="font-bold text-base text-green-700 dark:text-green-300 mb-1">{meme.shares.toLocaleString()}</div>
                          <div className="text-xs font-medium text-green-600 dark:text-green-400">Share</div>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Title only */}
                  <div>
                    <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                      {meme.title}
                    </h1>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleNavigate('next')}
                  className="flex items-center space-x-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  disabled={isLoading}
                >
                  <span>Next</span>
                  <span>→</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation hint */}
      <div className="mt-6 text-center lg:hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-full inline-block">
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
            Tap image to zoom • Use arrows to navigate
          </p>
        </div>
      </div>
    </div>
  );
};

export { MemeDetail };
export type { MemeDetailProps }; 