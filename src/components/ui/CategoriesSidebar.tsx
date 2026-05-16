import React from 'react';
import { useMemesUIState } from '@/lib/contexts';

/** Matches `sticky top-20` on the filter panel (5rem - align scroll-to-grid with sticky column). */
const STICKY_FILTER_TOP_PX = 80;

export interface FiltersAndSortingProps {
  className?: string;
  onFilterChange?: (filter: string) => void;
  selectedFilter?: string;
  onTimePeriodChange?: (period: string) => void;
  selectedTimePeriod?: string;
  memeGridRef?: React.RefObject<HTMLDivElement | null>;
}

const FiltersAndSortingInner: React.FC<FiltersAndSortingProps> = ({
  className = '',
  onFilterChange,
  selectedFilter = 'newest',
  onTimePeriodChange,
  selectedTimePeriod = 'all',
  memeGridRef,
}) => {
  const [userInitiated, setUserInitiated] = React.useState(false);
  const { setFilters } = useMemesUIState();

  const scrollToTop = () => {
    if (userInitiated) {
      if (memeGridRef?.current) {
        const rect = memeGridRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - STICKY_FILTER_TOP_PX;
        window.scrollTo({ top: scrollTop, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: STICKY_FILTER_TOP_PX, behavior: 'smooth' });
      }
    }
  };

  const handleFilterChange = (filter: 'newest' | 'trending' | 'hottest') => {
    setUserInitiated(true);
    setFilters({ filter });
    onFilterChange?.(filter);
    scrollToTop();
  };

  const handleTimePeriodChange = (period: 'all' | 'week' | 'month') => {
    setUserInitiated(true);
    setFilters({ time_period: period });
    onTimePeriodChange?.(period);
    scrollToTop();
  };

  return (
    <div
      className={`sticky top-20 bg-white dark:bg-gray-900 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] border-2 border-zinc-700 dark:border-zinc-400 flex flex-col ${className}`}
    >
      <div className="p-4 border-b-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950">
        <h3 className="text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white">
          Narrow the scroll
        </h3>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Period</h4>
        <div className="flex w-full flex-nowrap gap-2">
          <button
            type="button"
            onClick={() => handleTimePeriodChange('week')}
            className={`flex flex-1 min-w-0 items-center justify-center text-center text-xs font-bold uppercase tracking-wide leading-tight px-1 py-2.5 rounded-none border-2 cursor-pointer ${
              selectedTimePeriod === 'week'
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400'
            }`}
          >
            Last week
          </button>
          <button
            type="button"
            onClick={() => handleTimePeriodChange('month')}
            className={`flex flex-1 min-w-0 items-center justify-center text-center text-xs font-bold uppercase tracking-wide leading-tight px-1 py-2.5 rounded-none border-2 cursor-pointer ${
              selectedTimePeriod === 'month'
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400'
            }`}
          >
            Last month
          </button>
          <button
            type="button"
            onClick={() => handleTimePeriodChange('all')}
            className={`flex flex-1 min-w-0 items-center justify-center text-center text-xs font-bold uppercase tracking-wide leading-tight px-1 py-2.5 rounded-none border-2 cursor-pointer ${
              selectedTimePeriod === 'all'
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400'
            }`}
          >
            All time
          </button>
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</h4>
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={() => handleFilterChange('hottest')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-bold uppercase tracking-wide rounded-none flex-1 border-2 cursor-pointer ${
              selectedFilter === 'hottest'
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400'
            }`}
          >
            <span>Hottest</span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('trending')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-bold uppercase tracking-wide rounded-none flex-1 border-2 cursor-pointer ${
              selectedFilter === 'trending'
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400'
            }`}
          >
            <span>Trending</span>
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('newest')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-bold uppercase tracking-wide rounded-none flex-1 border-2 cursor-pointer ${
              selectedFilter === 'newest'
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400'
            }`}
          >
            <span>Newest</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const FiltersAndSorting = React.memo(FiltersAndSortingInner);
