'use client';

import React, { useRef, useCallback } from 'react';
import { FiltersAndSorting } from '@/components/ui';
import { useMemesUIState } from '@/lib/contexts';
import { MemesFeedPanel } from './MemesFeedPanel';

export default function MemesPage() {
  const memeGridRef = useRef<HTMLDivElement>(null);
  const { filters, setFilters } = useMemesUIState();

  const handleCategorySelect = useCallback((categoryId: string) => {
    setFilters({ category_id: categoryId });
  }, [setFilters]);

  const handleFilterChange = useCallback((filter: string) => {
    if (filter === 'newest' || filter === 'trending' || filter === 'hottest') {
      setFilters({ filter });
    }
  }, [setFilters]);

  const handleTimePeriodChange = useCallback((period: string) => {
    if (period === 'all' || period === 'today' || period === 'week' || period === 'month') {
      setFilters({ time_period: period });
    }
  }, [setFilters]);

  const sidebar = (
    <aside className="hidden lg:block lg:w-80 flex-shrink-0">
      <FiltersAndSorting
        selectedCategory={filters.category_id}
        onCategorySelect={handleCategorySelect}
        selectedFilter={filters.filter}
        onFilterChange={handleFilterChange}
        selectedTimePeriod={filters.time_period}
        onTimePeriodChange={handleTimePeriodChange}
        memeGridRef={memeGridRef}
      />
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MemesFeedPanel memeGridRef={memeGridRef} sidebar={sidebar} />
      </main>
    </div>
  );
}
