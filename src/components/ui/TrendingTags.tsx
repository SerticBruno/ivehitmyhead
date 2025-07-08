import React from 'react';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  count: number;
  trending?: boolean;
}

interface TrendingTagsProps {
  tags: Tag[];
  className?: string;
  maxTags?: number;
  onTagClick?: (tag: Tag) => void;
}

const TrendingTags: React.FC<TrendingTagsProps> = ({
  tags,
  className,
  maxTags = 10,
  onTagClick
}) => {
  const sortedTags = tags
    .sort((a, b) => b.count - a.count)
    .slice(0, maxTags);

  const getTagSize = (count: number) => {
    if (count > 10000) return 'text-xl';
    if (count > 5000) return 'text-lg';
    if (count > 1000) return 'text-base';
    return 'text-sm';
  };

  const getTagColor = (index: number, trending?: boolean) => {
    if (trending) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (index === 0) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (index === 1) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (index === 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className={cn("", className)}>
      <div className="flex flex-wrap gap-2">
        {sortedTags.map((tag, index) => (
          <button
            key={tag.id}
            onClick={() => onTagClick?.(tag)}
            className={cn(
              "px-3 py-1 rounded-full font-medium transition-all hover:scale-105 cursor-pointer",
              getTagSize(tag.count),
              getTagColor(index, tag.trending)
            )}
          >
            #{tag.name}
            {tag.trending && (
              <span className="ml-1 text-xs">🔥</span>
            )}
          </button>
        ))}
      </div>
      
      {tags.length > maxTags && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
            View all {tags.length} tags →
          </button>
        </div>
      )}
    </div>
  );
};

export { TrendingTags };
export type { TrendingTagsProps, Tag }; 