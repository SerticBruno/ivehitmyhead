import React from 'react';
import Image from 'next/image';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  totalMemes: number;
  totalLikes: number;
  bestMeme: {
    id: string;
    title: string;
    imageUrl: string;
    likes: number;
  };
  isFollowing?: boolean;
}

interface FeaturedCreatorProps {
  creator: Creator;
  className?: string;
  onFollow?: (creatorId: string) => void;
  onViewProfile?: (creatorId: string) => void;
}

const FeaturedCreator: React.FC<FeaturedCreatorProps> = ({
  creator,
  className,
  onFollow,
  onViewProfile
}) => {
  const handleFollow = () => {
    onFollow?.(creator.id);
  };

  const handleViewProfile = () => {
    onViewProfile?.(creator.id);
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={creator.avatar}
              alt={creator.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg">{creator.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">@{creator.username}</p>
            <div className="flex space-x-4 text-sm text-gray-500 mt-1">
              <span>{creator.followers.toLocaleString()} followers</span>
              <span>{creator.totalMemes} memes</span>
            </div>
          </div>
        </div>
        <Button
          variant={creator.isFollowing ? "outline" : "primary"}
          size="sm"
          onClick={handleFollow}
        >
          {creator.isFollowing ? "Following" : "Follow"}
        </Button>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Best Meme</h4>
        <div className="relative group">
          <Image
            src={creator.bestMeme.imageUrl}
            alt={creator.bestMeme.title}
            width={400}
            height={128}
            className="w-full h-32 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {creator.bestMeme.title}
        </p>
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
          <span>❤️ {creator.bestMeme.likes.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Total likes: {creator.totalLikes.toLocaleString()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewProfile}
        >
          View Profile →
        </Button>
      </div>
    </div>
  );
};

export { FeaturedCreator };
export type { FeaturedCreatorProps, Creator }; 