import React from 'react';
import { Category } from '@/lib/types/meme';
import { cn } from '@/lib/utils';

interface CategoriesSidebarProps {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  className?: string;
}

export const CategoriesSidebar: React.FC<CategoriesSidebarProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  className = ''
}) => {
  return (
    <div className={cn("sticky top-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-12rem)]", className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Browse by topic</p>
      </div>
      
      <div className="h-[calc(100%-5rem)] overflow-y-auto pb-4">
        <nav className="p-2 space-y-1">
          {/* All Categories Option */}
          <button
            onClick={() => onCategorySelect?.('')}
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
              !selectedCategory 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <span className="text-lg mr-3 flex-shrink-0">🌟</span>
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
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                  "hover:bg-gray-50 dark:hover:bg-gray-700",
                  isSelected 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <span className="text-lg mr-3 flex-shrink-0">{category.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {(category.count || 0).toLocaleString()} memes
                  </div>
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