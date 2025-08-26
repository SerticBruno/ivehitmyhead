import React from 'react';
import Link from 'next/link';
import { Category } from '@/lib/types/meme';
import { getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, className = '' }) => {
  return (
    <Link href={`/categories/${category.id}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-105 ${className}`}>
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200 flex justify-center items-center">
          {getCategoryIconOrEmoji(category.name, category.emoji)}
        </div>
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
          {category.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {category.count ? category.count.toLocaleString() : '0'} memes
        </p>
        {category.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export { CategoryCard };
export type { CategoryCardProps };
