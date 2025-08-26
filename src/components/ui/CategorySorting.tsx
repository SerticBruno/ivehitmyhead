import React from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';
import { Star } from 'lucide-react';

interface CategorySortingProps {
  className?: string;
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
}

export const CategorySorting: React.FC<CategorySortingProps> = ({
  className = '',
  onCategorySelect,
  selectedCategory
}) => {
  const {
    categories,
    loading,
    error
  } = useCategories({
    limit: 50
  });

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="text-red-600 dark:text-red-400 text-center">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Browse by topic</p>
      </div>

      {/* Categories List */}
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        <nav className="p-2 space-y-1">
          {/* All Categories Option */}
          <button
            onClick={() => onCategorySelect?.('')}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              !selectedCategory 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span className="text-lg mr-3 flex-shrink-0">
              <Star className="w-5 h-5" />
            </span>
            <div className="flex-1 text-left">
              <div className="font-medium">All Categories</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Browse everything
              </div>
            </div>
          </button>

          {/* Category List */}
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onCategorySelect?.(category.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isSelected 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="text-lg mr-3 flex-shrink-0">
                  {getCategoryIconOrEmoji(category.name, category.emoji)}
                </span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{category.name}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .dark .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};
