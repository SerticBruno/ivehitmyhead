'use client';

import React, { memo } from 'react';
import { Category } from '@/lib/types/meme';
import { ICONS, getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';

export interface MemesMobileFilterBarsProps {
  showFilterSkeleton: boolean;
  categories: Category[];
  categoriesLoading: boolean;
  selectedCategoryId: string;
  selectedFilter: string;
  selectedTimePeriod: string;
  onCategorySelect: (categoryId: string) => void;
  onFilterChange: (filter: string) => void;
  onTimePeriodChange: (period: string) => void;
}

const TIME_PERIODS = [
  { value: 'today', label: 'Today', icon: <ICONS.Moon className="w-5 h-5" /> },
  { value: 'week', label: 'Last week', icon: <ICONS.Calendar className="w-5 h-5" /> },
  { value: 'month', label: 'Last month', icon: <ICONS.Calendar className="w-5 h-5" /> },
  { value: 'all', label: 'All time', icon: <ICONS.Calendar className="w-5 h-5" /> },
] as const;

const SORT_FILTERS = [
  { value: 'hottest', label: 'Hottest', icon: <ICONS.Heart className="w-5 h-5" /> },
  { value: 'trending', label: 'Trending', icon: <ICONS.Flame className="w-5 h-5" /> },
  { value: 'newest', label: 'Newest', icon: <ICONS.Star className="w-5 h-5" /> },
] as const;

function MemesMobileFilterBarsInner({
  showFilterSkeleton,
  categories,
  categoriesLoading,
  selectedCategoryId,
  selectedFilter,
  selectedTimePeriod,
  onCategorySelect,
  onFilterChange,
  onTimePeriodChange,
}: MemesMobileFilterBarsProps) {
  return (
    <>
      <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period</h4>
          {showFilterSkeleton ? (
            <div className="grid w-full grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid w-full grid-cols-4 gap-2">
              {TIME_PERIODS.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => onTimePeriodChange(period.value)}
                  className={`flex min-h-0 min-w-0 flex-col items-center justify-center gap-1 p-2 rounded-md text-center transition-colors duration-150 cursor-pointer ${
                    selectedTimePeriod === period.value
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="flex shrink-0 justify-center">{period.icon}</span>
                  <span className="w-full text-center text-xs font-medium leading-tight">{period.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</h4>
          {showFilterSkeleton ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {SORT_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onFilterChange(filter.value)}
                  className={`flex flex-col items-center p-3 rounded-md transition-colors duration-150 cursor-pointer ${
                    selectedFilter === filter.value
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mb-1">{filter.icon}</span>
                  <span className="text-xs font-medium">{filter.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories</h4>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategorySelect('')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer ${
                !selectedCategoryId
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <ICONS.Star className="w-4 h-4 inline mr-1" />
              All Categories
            </button>
            {categoriesLoading
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                ))
              : categories?.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onCategorySelect(category.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer ${
                      selectedCategoryId === category.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {getCategoryIconOrEmoji(category.name, category.emoji)}
                    <span className="ml-1">{category.name}</span>
                  </button>
                ))}
          </div>
        </div>
      </div>
    </>
  );
}

export const MemesMobileFilterBars = memo(MemesMobileFilterBarsInner);
