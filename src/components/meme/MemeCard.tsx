import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface MemeCardProps {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  tags?: string[];
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
  className?: string;
}

const MemeCard: React.FC<MemeCardProps> = ({
  id,
  title,
  imageUrl,
  author,
  likes,
  comments,
  shares,
  createdAt,
  tags = [],
  onLike,
  onShare,
  onComment,
  className
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/meme/${id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(id);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.(id);
  };

  return (
    <Card 
      className={cn("overflow-hidden hover:shadow-lg transition-shadow cursor-pointer", className)}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-gray-500">by {author}</p>
          </div>
          <span className="text-xs text-gray-400">{createdAt}</span>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative w-full h-64 sm:h-80">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
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
            className="flex items-center space-x-1"
          >
            <span>👍</span>
            <span>{likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center space-x-1"
          >
            <span>💬</span>
            <span>{comments}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1"
          >
            <span>📤</span>
            <span>{shares}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export { MemeCard };
export type { MemeCardProps }; 