import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn, formatRelativeTime, formatTime } from '@/lib/utils';
import { Meme } from '@/lib/types/meme';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { ICONS, getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';

interface FeaturedMemeCardProps {
  meme: Meme;
  onLike: (slug: string) => void;
  onShare: (id: string) => void;
  className?: string;
  isLiked?: boolean;
}

const FeaturedMemeCard: React.FC<FeaturedMemeCardProps> = ({
  meme,
  onLike,
  onShare,
  className,
  isLiked
}) => {
  const { recordView } = useMemeInteractions();
  const hasRecordedView = useRef(false);

  // Record view when meme is displayed (only once per meme slug)
  useEffect(() => {
    if (!hasRecordedView.current) {
      recordView(meme.slug);
      hasRecordedView.current = true;
    }
  }, [meme.slug, recordView]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(meme.slug);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare(meme.id);
  };

  return (
    <Link href={`/meme/${meme.slug}`} className="block h-full">
      <Card 
        className={cn("overflow-hidden cursor-pointer h-full flex flex-col", className)}
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{meme.title}</h3>
            <p className="text-sm text-gray-500">
              by {meme.author?.display_name || meme.author?.username || 'Unknown'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {meme.category ? (
                <>
                  {getCategoryIconOrEmoji(meme.category.name, meme.category.emoji)}
                  <span className="text-xs text-gray-500">{meme.category.name}</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-gray-400">📁</span>
                  <span className="text-xs text-gray-400">Uncategorized</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-grow">
          <div className="relative w-full h-64">
            <Image
              src={meme.image_url}
              alt={meme.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardContent>
        
        <div className="p-4 pt-2 flex-shrink-0">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${isLiked ? 'text-red-500' : ''}`}
              >
                {isLiked ? (
                  <ICONS.Heart className="w-4 h-4 fill-current" />
                ) : (
                  <ICONS.ThumbsUp className="w-4 h-4" />
                )}
                <span>{meme.likes_count}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 hover:text-purple-600 transition-colors"
              >
                <ICONS.Share2 className="w-4 h-4" />
                <span>{meme.shares_count}</span>
              </button>
              <div className="flex items-center gap-1 text-gray-500">
                <ICONS.Eye className="w-4 h-4" />
                <span>{meme.views}</span>
              </div>
            </div>
            <span className="text-xs">
              {formatRelativeTime(meme.created_at)} ({formatTime(meme.created_at)})
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export { FeaturedMemeCard };


