import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatRelativeTime, formatTime } from '@/lib/utils';
import { MemeCardProps } from '@/lib/types/meme';

const MemeCard: React.FC<MemeCardProps> = ({
  meme,
  onLike,
  onShare,
  onComment,
  className,
  isLiked = false
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    console.log('MemeCard: handleCardClick called for meme:', meme.slug);
    try {
      console.log('Attempting to navigate to:', `/meme/${meme.slug}`);
      router.push(`/meme/${meme.slug}`);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if router fails
      console.log('Falling back to window.location');
      window.location.href = `/meme/${meme.slug}`;
    }
  };

  const handleLike = (e: React.MouseEvent) => {
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
    e.stopPropagation();
    onShare?.(meme.id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.(meme.id);
  };

  return (
    <Card 
      className={cn("overflow-hidden hover:shadow-lg transition-shadow cursor-pointer", className)}
      onClick={handleCardClick}
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
        <div className="flex flex-wrap gap-1 mt-2">
          {meme.category && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900 dark:text-purple-200">
              {meme.category.emoji} {meme.category.name}
            </span>
          )}
          {meme.tags.length > 0 && meme.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200"
            >
              #{tag}
            </span>
          ))}
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
            onClick={(e) => {
              console.log('Button clicked!');
              handleLike(e);
            }}
            className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''} border border-gray-300`}
            onMouseDown={() => console.log('MemeCard: Like button mouse down')}
            onMouseUp={() => console.log('MemeCard: Like button mouse up')}
            style={{ zIndex: 10, position: 'relative' }}
          >
            <span onClick={(e) => { e.stopPropagation(); console.log('Direct span click!'); handleLike(e); }}>
              {isLiked ? '❤️' : '👍'}
            </span>
            <span>{meme.likes_count}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center space-x-1"
          >
            <span>💬</span>
            <span>{meme.comments_count}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1"
          >
            <span>📤</span>
            <span>{meme.shares_count}</span>
          </Button>

          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>👁️</span>
            <span>{meme.views}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export { MemeCard };
export type { MemeCardProps }; 