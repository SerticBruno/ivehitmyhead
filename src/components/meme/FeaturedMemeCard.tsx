import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  cn,
  formatCompactCount,
  formatDateDDMMYYYY,
  formatFullDateTime,
  formatRelativeTime,
  formatTime,
} from '@/lib/utils';
import { Meme } from '@/lib/types/meme';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { ICONS } from '@/lib/utils/categoryIcons';

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
  const RETURN_TO_MEMES_SCROLL_KEY = 'restoreMemesScrollFromDetail';
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
    <Link
      href={`/meme/${meme.slug}`}
      className="block h-full"
      onClick={() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(RETURN_TO_MEMES_SCROLL_KEY, '1');
        }
      }}
    >
      <Card 
        className={cn("overflow-hidden cursor-pointer h-full flex flex-col rounded-none border-2 border-zinc-700 dark:border-zinc-400 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.42)]", className)}
      >
        <CardHeader className="px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="font-black uppercase tracking-tight text-lg leading-tight line-clamp-1 min-w-0"
                title={meme.title}
              >
                {meme.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                by {meme.author?.display_name || meme.author?.username || 'Unknown'}
              </p>
            </div>
            <div
              className="flex-shrink-0 text-right"
              title={formatFullDateTime(meme.created_at)}
            >
              <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold uppercase tracking-wide">
                {formatRelativeTime(meme.created_at)}
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(meme.created_at)} • {formatDateDDMMYYYY(meme.created_at)}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-grow">
          <div
            className="relative w-full h-[calc(100vh-300px)] min-h-[400px] max-h-[800px] sm:h-64 sm:min-h-0 sm:max-h-none bg-[#f7f4ee] dark:bg-gray-950 border-y-2 border-zinc-700 dark:border-zinc-400"
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
        
        <div className="px-4 pb-4 pt-3 flex-shrink-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
            <button
              onClick={handleLike}
              title={`${meme.likes_count.toLocaleString()} likes`}
              className={`flex shrink-0 items-center gap-1 px-1.5 py-0.5 cursor-pointer transition-colors ${isLiked ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30' : 'hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {isLiked ? (
                <ICONS.Heart className="w-4 h-4 fill-current" />
              ) : (
                <ICONS.Heart className="w-4 h-4" />
              )}
              <span>{formatCompactCount(meme.likes_count)}</span>
            </button>
            <button
              onClick={handleShare}
              title={`${meme.shares_count.toLocaleString()} shares`}
              className="flex shrink-0 items-center gap-1 px-1.5 py-0.5 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ICONS.Share2 className="w-4 h-4" />
              <span>{formatCompactCount(meme.shares_count)}</span>
            </button>
            <div
              className="flex shrink-0 items-center gap-1 text-gray-500"
              title={`${meme.views.toLocaleString()} views`}
            >
              <ICONS.Eye className="w-4 h-4" />
              <span>{formatCompactCount(meme.views)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export { FeaturedMemeCard };


