import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatRelativeTime, formatTime } from '@/lib/utils';
import { MemeCardProps } from '@/lib/types/meme';
import { ICONS, getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';
import { imagePreloader } from '@/lib/utils/imagePreloader';

const MemeCard: React.FC<MemeCardProps> = ({
  meme,
  onLike,
  onShare,
  className,
  isLiked
}) => {
  // Use the meme's is_liked field if available, otherwise fall back to the prop
  const isActuallyLiked = meme.is_liked !== undefined ? meme.is_liked : (isLiked || false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // Check if image is already preloaded
  useEffect(() => {
    if (imagePreloader.isPreloaded(meme.image_url)) {
      setImageLoading(false);
    }
  }, [meme.image_url]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    if (isLiking) {
      console.log('MemeCard: Like action already in progress, ignoring click');
      return;
    }
    
    console.log('MemeCard: handleLike called with slug:', meme.slug);
    console.log('MemeCard: onLike function exists?', !!onLike);
    console.log('MemeCard: current meme data:', {
      slug: meme.slug,
      likes_count: meme.likes_count,
      isLiked: isActuallyLiked
    });
    
    if (!onLike) {
      console.error('MemeCard: onLike function is undefined!');
      return;
    }
    
    setIsLiking(true);
    try {
      await onLike(meme.slug);
    } catch (error) {
      console.error('MemeCard: Error in onLike callback:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(meme.id);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Link href={`/meme/${meme.slug}`} className="block">
      <Card 
        className={cn("overflow-hidden hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform cursor-pointer rounded-none border-2 border-black dark:border-gray-300 shadow-[8px_8px_0px_rgba(0,0,0,0.88)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]", className)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black uppercase tracking-tight text-lg">{meme.title}</h3>
              <p className="text-sm text-gray-500">
                by {meme.author?.display_name || meme.author?.username || 'Unknown'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold uppercase tracking-wide">
                {formatRelativeTime(meme.created_at)}
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(meme.created_at)}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(meme.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {meme.category && (
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold uppercase tracking-wide bg-[#f7f4ee] text-gray-800 dark:bg-gray-900 dark:text-gray-200 border border-black dark:border-gray-300 transition-colors duration-200">
                {getCategoryIconOrEmoji(meme.category.name, meme.category.emoji)}
                <span className="ml-1.5 font-semibold">{meme.category.name}</span>
              </span>
            )}
            {meme.tags && meme.tags.length > 0 && meme.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200 border border-black dark:border-gray-300 transition-colors duration-200"
              >
                #{tag}
              </span>
            ))}
            {meme.tags && meme.tags.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold uppercase tracking-wide bg-[#f7f4ee] text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-black dark:border-gray-300">
                +{meme.tags.length - 3} more
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div 
            className="relative w-full border-y-2 border-black dark:border-gray-300"
            style={{ 
              height: 'calc(100vh - 300px)',
              minHeight: '400px',
              maxHeight: '800px'
            }}
          >
            {/* Loading skeleton */}
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <div className="text-gray-400 dark:text-gray-500">
                  <ICONS.Image className="w-12 h-12" />
                </div>
              </div>
            )}

            {/* Error state */}
            {imageError && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <ICONS.AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Failed to load image</p>
                </div>
              </div>
            )}

            <Image
              src={meme.image_url}
              alt={meme.title}
              fill
              className={cn(
                "object-contain transition-opacity duration-300",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              disabled={isLiking}
                className={`flex items-center space-x-1 rounded-none border-2 border-transparent uppercase tracking-wide font-semibold ${isActuallyLiked ? 'text-red-500' : ''} ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ zIndex: 10, position: 'relative' }}
            >
              <span>
                {isLiking ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isActuallyLiked ? (
                  <ICONS.Heart className="w-4 h-4 fill-current" />
                ) : (
                  <ICONS.ThumbsUp className="w-4 h-4" />
                )}
              </span>
              <span>{meme.likes_count}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-1 rounded-none border-2 border-transparent uppercase tracking-wide font-semibold"
            >
              <span><ICONS.Share2 className="w-4 h-4" /></span>
              <span>{meme.shares_count}</span>
            </Button>

            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <ICONS.Eye className="w-4 h-4" />
              <span>{meme.views}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export { MemeCard };
export type { MemeCardProps }; 