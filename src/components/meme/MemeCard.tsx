import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { MemeCardProps } from '@/lib/types/meme';

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
  category,
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
        <div className="flex flex-wrap gap-1 mt-2">
          {category && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900 dark:text-purple-200">
              {category}
            </span>
          )}
          {tags.length > 0 && tags.map((tag, index) => (
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
            src={imageUrl}
            alt={title}
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