import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatRelativeTime, formatTime } from '@/lib/utils';
import { MemeCardProps } from '@/lib/types/meme';
import { ICONS, getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';

const MemeCard: React.FC<MemeCardProps> = ({
  meme,
  onLike,
  onShare,
  className,
  isLiked = false
}) => {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('MemeCard: handleLike called with slug:', meme.slug);
    console.log('MemeCard: onLike function exists?', !!onLike);
    console.log('MemeCard: onLike function:', onLike);
    if (onLike) {
      onLike(meme.slug);
    } else {
      console.error('MemeCard: onLike function is undefined!');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(meme.id);
    }
  };

  return (
    <Link href={`/meme/${meme.slug}`} className="block">
      <Card 
        className={cn("overflow-hidden hover:shadow-lg transition-shadow cursor-pointer", className)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{meme.title}</h3>
              <p className="text-sm text-gray-500">
                by {meme.author?.display_name || meme.author?.username || 'Unknown'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 font-medium">
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
              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900/30 dark:text-purple-200 border border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors duration-200">
                {getCategoryIconOrEmoji(meme.category.name, meme.category.emoji)}
                <span className="ml-1.5 font-semibold">{meme.category.name}</span>
              </span>
            )}
            {meme.tags && meme.tags.length > 0 && meme.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors duration-200"
              >
                #{tag}
              </span>
            ))}
            {meme.tags && meme.tags.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                +{meme.tags.length - 3} more
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div 
            className="relative w-full" 
            style={{ 
              height: 'calc(100vh - 300px)',
              minHeight: '400px',
              maxHeight: '800px'
            }}
          >
            <Image
              src={meme.image_url}
              alt={meme.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''} border border-gray-300`}
              onMouseDown={() => console.log('MemeCard: Like button mouse down')}
              onMouseUp={() => console.log('MemeCard: Like button mouse up')}
              style={{ zIndex: 10, position: 'relative' }}
            >
              <span>
                {isLiked ? (
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
              className="flex items-center space-x-1"
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