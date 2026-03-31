import React from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemesUIState } from '@/lib/contexts';
import { getCategoryIconOrEmoji, ICONS } from '@/lib/utils/categoryIcons';

/** Matches `sticky top-20` on the filter panel (5rem - align scroll-to-grid with sticky column). */
const STICKY_FILTER_TOP_PX = 80;

export interface FiltersAndSortingProps {
  className?: string;
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
  onFilterChange?: (filter: string) => void;
  selectedFilter?: string;
  onTimePeriodChange?: (period: string) => void;
  selectedTimePeriod?: string;
  memeGridRef?: React.RefObject<HTMLDivElement | null>;
}

const FiltersAndSortingInner: React.FC<FiltersAndSortingProps> = ({
  className = '',
  onCategorySelect,
  selectedCategory,
  onFilterChange,
  selectedFilter = 'newest',
  onTimePeriodChange,
  selectedTimePeriod = 'all',
  memeGridRef
}) => {
  const [showBlurOverlay, setShowBlurOverlay] = React.useState(true);
  const [userInitiated, setUserInitiated] = React.useState(false);
  const categoriesScrollRef = React.useRef<HTMLDivElement | null>(null);
  
  // Get the memes state context to update filters directly
  const { setFilters } = useMemesUIState();
  
  const {
    categories,
    loading,
    error
  } = useCategories({
    limit: 50
  });

  const updateBlurOverlay = React.useCallback(() => {
    const target = categoriesScrollRef.current;
    if (!target) {
      setShowBlurOverlay(false);
      return;
    }

    const canScroll = target.scrollHeight > target.clientHeight + 1;
    if (!canScroll) {
      setShowBlurOverlay(false);
      return;
    }

    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
    setShowBlurOverlay(!isAtBottom);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const canScroll = target.scrollHeight > target.clientHeight + 1;
    if (!canScroll) {
      setShowBlurOverlay(false);
      return;
    }

    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
    setShowBlurOverlay(!isAtBottom);
  };

  React.useEffect(() => {
    updateBlurOverlay();
  }, [categories, updateBlurOverlay]);

  React.useEffect(() => {
    window.addEventListener('resize', updateBlurOverlay);
    return () => window.removeEventListener('resize', updateBlurOverlay);
  }, [updateBlurOverlay]);

  const scrollToTop = () => {
    // Only scroll if this is triggered by a user action
    if (userInitiated) {
      // Use the memeGridRef if provided, otherwise fall back to the old method
      if (memeGridRef?.current) {
        const rect = memeGridRef.current.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset + rect.top - STICKY_FILTER_TOP_PX;
        window.scrollTo({ top: scrollTop, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: STICKY_FILTER_TOP_PX, behavior: 'smooth' });
      }
    }
  };

  // Handle filter changes by updating the context
  const handleFilterChange = (filter: 'newest' | 'trending' | 'hottest') => {
    setUserInitiated(true);
    setFilters({ filter });
    onFilterChange?.(filter);
    scrollToTop();
  };

  // Handle time period changes by updating the context
  const handleTimePeriodChange = (period: 'all' | 'today' | 'week' | 'month') => {
    setUserInitiated(true);
    setFilters({ time_period: period });
    onTimePeriodChange?.(period);
    scrollToTop();
  };

  // Handle category selection by updating the context
  const handleCategorySelect = (categoryId: string) => {
    setUserInitiated(true);
    setFilters({ category_id: categoryId });
    onCategorySelect?.(categoryId);
    scrollToTop();
  };

  if (loading) {
    return (
      <div className={`sticky top-20 max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] border-2 border-zinc-700 dark:border-zinc-400 flex flex-col ${className}`}>
        {/* Header */}
        <div className="p-4 border-b-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950">
          <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">Narrow the scroll</h3>
        </div>

        {/* Time Period Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Period</h4>
          <div className="flex w-full flex-nowrap gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 flex-1 min-w-0 bg-gray-200 dark:bg-gray-700 rounded-none animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Filter Options */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</h4>
          <div className="flex justify-between gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-none animate-pulse flex-1"></div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 flex-1 flex flex-col min-h-0">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-none animate-pulse"></div>
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
    <div className={`sticky top-20 max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] border-2 border-zinc-700 dark:border-zinc-400 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950">
        <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">Narrow the scroll</h3>
      </div>

      {/* Time Period Filter */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Period</h4>
        <div className="flex w-full flex-nowrap gap-2">
          <button
            type="button"
            onClick={() => handleTimePeriodChange('today')}
            className={`flex flex-1 min-w-0 items-center justify-center text-center text-xs font-bold uppercase tracking-wide leading-tight px-1 py-2.5 rounded-none border-2 cursor-pointer ${
              selectedTimePeriod === 'today'
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handleTimePeriodChange('week')}
            className={`flex flex-1 min-w-0 items-center justify-center text-center text-xs font-bold uppercase tracking-wide leading-tight px-1 py-2.5 rounded-none border-2 cursor-pointer ${
              selectedTimePeriod === 'week'
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400"
            }`}
          >
            Last week
          </button>
          <button
            type="button"
            onClick={() => handleTimePeriodChange('month')}
            className={`flex flex-1 min-w-0 items-center justify-center text-center text-xs font-bold uppercase tracking-wide leading-tight px-1 py-2.5 rounded-none border-2 cursor-pointer ${
              selectedTimePeriod === 'month'
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400"
            }`}
          >
            Last month
          </button>
          <button
            type="button"
            onClick={() => handleTimePeriodChange('all')}
            className={`flex flex-1 min-w-0 items-center justify-center text-center text-xs font-bold uppercase tracking-wide leading-tight px-1 py-2.5 rounded-none border-2 cursor-pointer ${
              selectedTimePeriod === 'all'
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400"
            }`}
          >
            All time
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</h4>
        <div className="flex justify-between gap-2">
          <button
            onClick={() => handleFilterChange('hottest')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-bold uppercase tracking-wide rounded-none flex-1 border-2 cursor-pointer ${
              selectedFilter === 'hottest'
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400"
            }`}
          >
            <span>Hottest</span>
          </button>
          <button
            onClick={() => handleFilterChange('trending')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-bold uppercase tracking-wide rounded-none flex-1 border-2 cursor-pointer ${
              selectedFilter === 'trending'
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400"
            }`}
          >
            <span>Trending</span>
          </button>
          <button
            onClick={() => handleFilterChange('newest')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-bold uppercase tracking-wide rounded-none flex-1 border-2 cursor-pointer ${
              selectedFilter === 'newest'
                ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400"
            }`}
          >
            <span>Newest</span>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
        <div
          ref={categoriesScrollRef}
          className="flex-1 overflow-y-auto pr-4 relative categories-scroll-container"
          onScroll={handleScroll}
        >
          <nav className="space-y-2">
            {/* All Categories Option */}
            <button
              onClick={() => handleCategorySelect('')}
              className={`w-full flex items-center px-3 py-3 text-sm font-semibold uppercase tracking-wide rounded-none border-2 cursor-pointer ${
                !selectedCategory 
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400"
              }`}
            >
              <span className="mr-3 flex-shrink-0">
                <ICONS.Star className="w-5 h-5" />
              </span>
              <div className="flex-1 text-left">
                <div className="font-medium">All Categories</div>
              </div>
            </button>

            {/* Category Options */}
            {categories?.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-semibold uppercase tracking-wide rounded-none border-2 cursor-pointer ${
                    isSelected 
                      ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400"
                  }`}
                >
                  <span className="mr-3 flex-shrink-0">
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
        
        {/* Bottom blur overlay - positioned at the very bottom of the categories section */}
        <div
          className={`absolute bottom-0 left-4 right-4 h-8 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-800 dark:via-gray-800/80 pointer-events-none transition-opacity duration-300 ease-out ${
            showBlurOverlay ? 'opacity-100' : 'opacity-0'
          }`}
        />
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

export const FiltersAndSorting = React.memo(FiltersAndSortingInner);