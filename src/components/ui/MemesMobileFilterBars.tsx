'use client';

import React, { memo, useState, useCallback } from 'react';
import { Category } from '@/lib/types/meme';
import { cn } from '@/lib/utils';
import { ICONS, renderCategoryIcon } from '@/lib/utils/categoryIcons';

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

const WRAPPER_CLASS = 'lg:hidden mb-6';

const PANEL_SHELL =
  'bg-white dark:bg-gray-900 rounded-none border-2 border-zinc-700 dark:border-zinc-400 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]';

const BTN_ON =
  'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white';
/** Hover only when device supports hover (avoids sticky “hover” on touch while scrolling). */
const BTN_OFF =
  'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-zinc-700 dark:border-zinc-400 [@media(hover:hover)]:hover:bg-[#f7f4ee] dark:[@media(hover:hover)]:hover:bg-gray-800';

const TIME_PERIODS = [
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' },
  { value: 'all', label: 'All time' },
] as const;

const SORT_FILTERS = [
  { value: 'hottest', label: 'Hottest' },
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
] as const;

type TabId = 'time' | 'sort' | 'categories';

const TABS: { id: TabId; label: string }[] = [
  { id: 'time', label: 'Time' },
  { id: 'sort', label: 'Sort' },
  { id: 'categories', label: 'Categories' },
];

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
  const [activeTab, setActiveTab] = useState<TabId>('time');

  const onTabKeyDown = useCallback((e: React.KeyboardEvent, tabId: TabId) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === tabId);
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const next = TABS[(i + delta + TABS.length) % TABS.length];
    setActiveTab(next.id);
    const el = document.getElementById(`memes-filter-tab-${next.id}`);
    el?.focus();
  }, []);

  return (
    <div className={WRAPPER_CLASS}>
      <div className={PANEL_SHELL}>
        <div
          role="tablist"
          aria-label="Meme filters"
          className="flex border-b-2 border-zinc-700 dark:border-zinc-400 bg-[#f7f4ee] dark:bg-gray-950"
        >
          {TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`memes-filter-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`memes-filter-tabpanel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => onTabKeyDown(e, tab.id)}
                className={cn(
                  'flex-1 min-w-0 px-1 py-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-wide border-r-2 border-zinc-700 dark:border-zinc-400 last:border-r-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-500 active:opacity-90',
                  selected
                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 [@media(hover:hover)]:hover:bg-white/80 dark:[@media(hover:hover)]:hover:bg-gray-900/50',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="memes-filter-tabpanel-time"
          aria-labelledby="memes-filter-tab-time"
          hidden={activeTab !== 'time'}
          className="p-4"
        >
          {showFilterSkeleton ? (
            <div className="flex w-full flex-nowrap gap-2">
              {[...Array(3)].map((_, i) => (
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

        <div
          role="tabpanel"
          id="memes-filter-tabpanel-sort"
          aria-labelledby="memes-filter-tab-sort"
          hidden={activeTab !== 'sort'}
          className="p-4"
        >
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

        <div
          role="tabpanel"
          id="memes-filter-tabpanel-categories"
          aria-labelledby="memes-filter-tab-categories"
          hidden={activeTab !== 'categories'}
          className="min-h-0 max-h-[55vh] touch-pan-y overflow-y-auto p-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <nav className="touch-pan-y space-y-2">
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
                      {renderCategoryIcon(category.name, 'w-5 h-5')}
                    </span>
                    <span className="flex-1 text-left font-medium min-w-0 truncate">{category.name}</span>
                  </button>
                ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export const MemesMobileFilterBars = memo(MemesMobileFilterBarsInner);
