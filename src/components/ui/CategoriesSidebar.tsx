import React from 'react';
import { useCategories } from '@/lib/hooks/useCategories';

interface FiltersAndSortingProps {
  className?: string;
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
  onFilterChange?: (filter: string) => void;
  selectedFilter?: string;
  onTimePeriodChange?: (period: string) => void;
  selectedTimePeriod?: string;
}

export const FiltersAndSorting: React.FC<FiltersAndSortingProps> = ({
  className = '',
  onCategorySelect,
  selectedCategory,
  onFilterChange,
  selectedFilter = 'newest',
  onTimePeriodChange,
  selectedTimePeriod = 'all'
}) => {
  const [showBlurOverlay, setShowBlurOverlay] = React.useState(true);
  const {
    categories,
    loading,
    error
  } = useCategories({
    limit: 50
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
    setShowBlurOverlay(!isAtBottom);
  };

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
    <div className={`sticky top-20 h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Sorting</h3>
      </div>

      {/* Time Period Filter */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Period</h4>
        <div className="flex justify-between gap-2">
          <button
            onClick={() => onTimePeriodChange?.('today')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] ${
              selectedTimePeriod === 'today'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
            }`}
          >
            <span>Today</span>
          </button>
          <button
            onClick={() => onTimePeriodChange?.('week')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] ${
              selectedTimePeriod === 'week'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
            }`}
          >
            <span>This Week</span>
          </button>
          <button
            onClick={() => onTimePeriodChange?.('month')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] ${
              selectedTimePeriod === 'month'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
            }`}
          >
            <span>This Month</span>
          </button>
          <button
            onClick={() => onTimePeriodChange?.('all')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg transition-all duration-200 min-w-[60px] ${
              selectedTimePeriod === 'all'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
            }`}
          >
            <span>All Time</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</h4>
        <div className="flex justify-between gap-2">
          <button
            onClick={() => onFilterChange?.('newest')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg transition-all duration-200 flex-1 ${
              selectedFilter === 'newest'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
            }`}
          >
            <span>Newest</span>
          </button>
          <button
            onClick={() => onFilterChange?.('trending')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg transition-all duration-200 flex-1 ${
              selectedFilter === 'trending'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
            }`}
          >
            <span>Trending</span>
          </button>
          <button
            onClick={() => onFilterChange?.('hottest')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg transition-all duration-200 flex-1 ${
              selectedFilter === 'hottest'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
            }`}
          >
            <span>Hottest</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
        <div className="flex-1 overflow-y-auto pr-4 relative" onScroll={handleScroll}>
          <nav className="space-y-2">
            {/* All Categories Option */}
            <button
              onClick={() => onCategorySelect?.('')}
              className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                !selectedCategory 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500 shadow-sm"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
              }`}
            >
              <span className="text-lg mr-3 flex-shrink-0">🌟</span>
              <div className="flex-1 text-left">
                <div className="font-medium">All Categories</div>
              </div>
            </button>

            {/* Category List */}
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategorySelect?.(category.id)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isSelected 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-500 shadow-sm"
                      : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm"
                  }`}
                >
                  <span className="text-lg mr-3 flex-shrink-0">{category.emoji}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{category.name}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Bottom blur overlay - positioned at the very bottom of the categories section */}
        {showBlurOverlay && (
          <div className="absolute bottom-0 left-4 right-4 h-8 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-800 dark:via-gray-800/80 pointer-events-none"></div>
        )}
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