import React from 'react';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemesUIState } from '@/lib/contexts';
import { ICONS, renderCategoryIcon } from '@/lib/utils/categoryIcons';
import { visibleMemeFilterCategories } from '@/lib/utils/memeCategoryFilter';

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
  const [userInitiated, setUserInitiated] = React.useState(false);
  
  // Get the memes state context to update filters directly
  const { setFilters } = useMemesUIState();
  
  const {
    categories: rawCategories,
    loading,
    error
  } = useCategories({
    limit: 50
  });

  const categories = React.useMemo(
    () => visibleMemeFilterCategories(rawCategories),
    [rawCategories]
  );

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
  const handleTimePeriodChange = (period: 'all' | 'week' | 'month') => {
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
      <div className={`sticky top-20 bg-white dark:bg-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] border-2 border-zinc-700 dark:border-zinc-400 flex flex-col ${className}`}>
        {/* Header */}
        <div className="p-4 border-b-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950">
          <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">Narrow the scroll</h3>
        </div>

        {/* Time Period Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Period</h4>
          <div className="flex w-full flex-nowrap gap-2">
            {[...Array(3)].map((_, i) => (
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
        <div className="p-4 flex flex-col min-h-0">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
          <div className="flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 -mx-1 px-1 touch-pan-x [scrollbar-width:thin]">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-12 flex-shrink-0 w-[6.5rem] bg-gray-200 dark:bg-gray-700 rounded-none animate-pulse"
              />
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
    <div className={`sticky top-20 bg-white dark:bg-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] border-2 border-zinc-700 dark:border-zinc-400 flex flex-col ${className}`}>
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
        <div className="flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1 -mx-1 px-1 touch-pan-x [scrollbar-width:thin]">
          <button
            type="button"
            title="All categories"
            onClick={() => handleCategorySelect('')}
            className={`flex max-w-[10rem] flex-shrink-0 items-center gap-2 px-2.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide rounded-none border-2 cursor-pointer transition-colors sm:text-xs ${
              !selectedCategory
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400'
            }`}
          >
            <span className="flex-shrink-0">
              <ICONS.Star className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="min-w-0 truncate">All</span>
          </button>
          {categories?.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                title={category.name}
                onClick={() => handleCategorySelect(category.id)}
                className={`flex max-w-[10rem] flex-shrink-0 items-center gap-2 px-2.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide rounded-none border-2 cursor-pointer transition-colors sm:text-xs ${
                  isSelected
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400'
                }`}
              >
                <span className="flex-shrink-0">{renderCategoryIcon(category.name, 'h-4 w-4 sm:h-5 sm:w-5')}</span>
                <span className="min-w-0 truncate">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const FiltersAndSorting = React.memo(FiltersAndSortingInner);