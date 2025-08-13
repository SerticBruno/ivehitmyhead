import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { MemeCardProps } from '@/lib/types/meme';

const FeaturedMemeCard: React.FC<MemeCardProps> = ({
  id,
  title,
  imageUrl,
  author,
  className
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/meme/${id}`);
  };

  return (
    <Card 
      className={cn("overflow-hidden cursor-pointer", className)}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-500">by {author}</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative w-full h-64">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export { FeaturedMemeCard };


