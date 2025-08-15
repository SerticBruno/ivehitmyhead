import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn, formatRelativeTime, formatTime } from '@/lib/utils';
import { Meme } from '@/lib/types/meme';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';

interface FeaturedMemeCardProps {
  meme: Meme;
  onLike?: (slug: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
  className?: string;
  isLiked?: boolean;
}

const FeaturedMemeCard: React.FC<FeaturedMemeCardProps> = ({
  meme,
  onLike,
  onShare,
  onComment,
  className,
  isLiked
}) => {
  const router = useRouter();
  const { recordView } = useMemeInteractions();

  // Record view when meme is displayed
  useEffect(() => {
    recordView(meme.slug);
  }, [meme.slug]); // Removed recordView from dependencies

  const handleCardClick = () => {
    router.push(`/meme/${meme.slug}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(meme.slug);
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
      className={cn("overflow-hidden cursor-pointer", className)}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{meme.title}</h3>
          <p className="text-sm text-gray-500">
            by {meme.author?.display_name || meme.author?.username || 'Unknown'}
          </p>
          {meme.category && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm">{meme.category.emoji}</span>
              <span className="text-xs text-gray-500">{meme.category.name}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative w-full h-64">
          <Image
            src={meme.image_url}
            alt={meme.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
      </CardContent>
      
      <div className="p-4 pt-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${isLiked ? 'text-red-500' : ''}`}
            >
              <span>{isLiked ? '❤️' : '👍'}</span>
              <span>{meme.likes_count}</span>
            </button>
            <button
              onClick={handleComment}
              className="flex items-center gap-1 hover:text-green-600 transition-colors"
            >
              <span>💬</span>
              <span>{meme.comments_count}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-purple-600 transition-colors"
            >
              <span>📤</span>
              <span>{meme.shares_count}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-500">
              <span>👁️</span>
              <span>{meme.views}</span>
            </div>
          </div>
          <span className="text-xs">
            {formatRelativeTime(meme.created_at)} ({formatTime(meme.created_at)})
          </span>
        </div>
      </div>
    </Card>
  );
};

export { FeaturedMemeCard };


