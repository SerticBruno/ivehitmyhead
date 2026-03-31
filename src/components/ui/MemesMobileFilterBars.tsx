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

const PANEL_CLASS =
  'lg:hidden mb-6 bg-white dark:bg-gray-900 rounded-none border-2 border-zinc-700 dark:border-zinc-400 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] p-4';

const BTN_ON =
  'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white';
const BTN_OFF =
  'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-[#f7f4ee] dark:hover:bg-gray-800 border-zinc-700 dark:border-zinc-400';

const TIME_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' },
  { value: 'all', label: 'All time' },
] as const;

const SORT_FILTERS = [
  { value: 'hottest', label: 'Hottest' },
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
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
      <div className={PANEL_CLASS}>
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period</h4>
          {showFilterSkeleton ? (
            <div className="flex w-full flex-nowrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 min-w-0 flex-1 bg-gray-200 dark:bg-gray-700 rounded-none animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex w-full flex-nowrap gap-2">
              {TIME_PERIODS.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => onTimePeriodChange(period.value)}
                  className={`flex flex-1 min-w-0 items-center justify-center text-center text-xs font-bold uppercase tracking-wide leading-tight px-1 py-2.5 rounded-none border-2 cursor-pointer transition-colors duration-150 ${
                    selectedTimePeriod === period.value ? BTN_ON : BTN_OFF
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={PANEL_CLASS}>
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</h4>
          {showFilterSkeleton ? (
            <div className="flex justify-between gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 flex-1 bg-gray-200 dark:bg-gray-700 rounded-none animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-between gap-2">
              {SORT_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onFilterChange(filter.value)}
                  className={`flex flex-col items-center px-3 py-3 text-xs font-bold uppercase tracking-wide rounded-none flex-1 min-w-0 border-2 cursor-pointer transition-colors duration-150 ${
                    selectedFilter === filter.value ? BTN_ON : BTN_OFF
                  }`}
                >
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={PANEL_CLASS}>
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories</h4>
          <nav className="space-y-2">
            <button
              type="button"
              onClick={() => onCategorySelect('')}
              className={`w-full flex items-center px-3 py-3 text-sm font-semibold uppercase tracking-wide rounded-none border-2 cursor-pointer transition-colors duration-150 ${
                !selectedCategoryId ? BTN_ON : BTN_OFF
              }`}
            >
              <span className="mr-3 flex-shrink-0">
                <ICONS.Star className="w-5 h-5" />
              </span>
              <span className="flex-1 text-left font-medium">All Categories</span>
            </button>
            {categoriesLoading
              ? [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-none animate-pulse"
                  />
                ))
              : categories?.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onCategorySelect(category.id)}
                    className={`w-full flex items-center px-3 py-3 text-sm font-semibold uppercase tracking-wide rounded-none border-2 cursor-pointer transition-colors duration-150 ${
                      selectedCategoryId === category.id ? BTN_ON : BTN_OFF
                    }`}
                  >
                    <span className="mr-3 flex-shrink-0">
                      {getCategoryIconOrEmoji(category.name, category.emoji)}
                    </span>
                    <span className="flex-1 text-left font-medium min-w-0 truncate">
                      {category.name}
                    </span>
                  </button>
                ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export const MemesMobileFilterBars = memo(MemesMobileFilterBarsInner);
