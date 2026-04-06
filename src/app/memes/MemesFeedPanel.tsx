'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { MemeGrid } from '@/components/meme';
import { MemesMobileFilterBars } from '@/components/ui/MemesMobileFilterBars';
import { useMemes } from '@/lib/hooks/useMemes';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { useMemesUIState, useMemesListState } from '@/lib/contexts';
import { ICONS } from '@/lib/utils/categoryIcons';
import { shareMemeWithFallback } from '@/lib/utils/shareUtils';

interface MemesFeedPanelProps {
  memeGridRef: React.RefObject<HTMLDivElement | null>;
  sidebar: React.ReactNode;
}

export function MemesFeedPanel({ memeGridRef, sidebar }: MemesFeedPanelProps) {
  const RETURN_TO_MEMES_SCROLL_KEY = 'restoreMemesScrollFromDetail';
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const searchParams = useSearchParams();
  const appliedUrlFiltersRef = useRef(false);

  const {
    filters,
    scrollPosition,
    isInitialized,
    setScrollPosition,
    setFilters,
  } = useMemesUIState();

  useEffect(() => {
    if (appliedUrlFiltersRef.current) return;
    appliedUrlFiltersRef.current = true;

    const filterParam = searchParams.get('filter');
    const timeParam = searchParams.get('time_period');
    const categoryParam = searchParams.get('category_id');

    const patch: Partial<{
      filter: 'newest' | 'trending' | 'hottest';
      time_period: 'all' | 'today' | 'week' | 'month';
      category_id: string;
    }> = {};

    if (filterParam === 'newest' || filterParam === 'trending' || filterParam === 'hottest') {
      patch.filter = filterParam;
    }
    if (
      timeParam === 'all' ||
      timeParam === 'today' ||
      timeParam === 'week' ||
      timeParam === 'month'
    ) {
      patch.time_period = timeParam;
    }
    if (categoryParam !== null && categoryParam !== '') {
      patch.category_id = categoryParam;
    }

    if (Object.keys(patch).length > 0) {
      setFilters(patch);
    }
  }, [searchParams, setFilters]);

  const {
    memes: listMemes,
    updateMemeLikeCount,
    updateMemeShareCount,
    updateMemeLikedState,
  } = useMemesListState();

  const listMemesRef = useRef(listMemes);
  listMemesRef.current = listMemes;

  useEffect(() => {
    const fetchLikedMemes = async () => {
      try {
        const response = await fetch('/api/memes/liked');

        if (response.ok) {
          const data = await response.json();
          const likedSlugs = data.likedMemes || [];

          setLikedMemes(new Set(likedSlugs));

          const memesSnapshot = listMemesRef.current;
          if (memesSnapshot.length > 0) {
            memesSnapshot.forEach(meme => {
              const isLiked = likedSlugs.includes(meme.slug);
              if (meme.is_liked !== isLiked) {
                updateMemeLikedState(meme.slug, isLiked);
              }
            });
          }
        } else {
          setLikedMemes(new Set());
        }
      } catch (error) {
        console.error('Error fetching liked memes:', error);
        setLikedMemes(new Set());
      }
    };

    if (likedMemes.size === 0) {
      fetchLikedMemes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (likedMemes.size > 0 && listMemes.length > 0) {
      listMemes.forEach(meme => {
        const isLiked = likedMemes.has(meme.slug);
        if (meme.is_liked !== isLiked) {
          updateMemeLikedState(meme.slug, isLiked);
        }
      });
    }
  }, [listMemes, likedMemes, updateMemeLikedState]);

  const viewedMemesRef = useRef<Set<string>>(new Set());
  const processedMemesRef = useRef<Set<string>>(new Set());
  const processingMemesRef = useRef<Set<string>>(new Set());
  const hasRestoredScrollRef = useRef(false);
  const suppressLoadMoreUntilRef = useRef(0);

  const getViewedMemes = useCallback(() => {
    if (viewedMemesRef.current.size === 0 && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('viewedMemes');
      if (stored) {
        viewedMemesRef.current = new Set(JSON.parse(stored));
      }
    }
    return viewedMemesRef.current;
  }, []);

  const addViewedMeme = useCallback((slug: string) => {
    const viewedMemes = getViewedMemes();
    viewedMemes.add(slug);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('viewedMemes', JSON.stringify([...viewedMemes]));
    }
  }, [getViewedMemes]);

  const { categories, loading: categoriesLoading } = useCategories({ limit: 50 });

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 10) {
          setScrollPosition(currentScrollY);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollPosition]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('viewedMemes');
      viewedMemesRef.current.clear();
      processedMemesRef.current.clear();
      hasRestoredScrollRef.current = false;
    }
  }, [filters.filter, filters.category_id, filters.time_period]);

  const getSortParams = useMemo(() => {
    switch (filters.filter) {
      case 'hottest':
        return {
          sort_by: 'likes' as const,
          sort_order: 'desc' as const
        };
      case 'trending':
        return {
          sort_by: 'views' as const,
          sort_order: 'desc' as const
        };
      case 'newest':
      default:
        return {
          sort_by: 'created_at' as const,
          sort_order: 'desc' as const
        };
    }
  }, [filters.filter]);

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

  const handleCategorySelect = useCallback((categoryId: string) => {
    setFilters({ category_id: categoryId });
  }, [setFilters]);

  const { memes, loading: memesLoading, error: memesError, hasMore, loadMore } = useMemes({
    category_id: filters.category_id || undefined,
    limit: 7,
    time_period: filters.time_period,
    ...getSortParams
  });

  const handleLoadMore = useCallback(() => {
    if (Date.now() < suppressLoadMoreUntilRef.current) {
      return;
    }
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const shouldRestoreFromDetail =
      sessionStorage.getItem(RETURN_TO_MEMES_SCROLL_KEY) === '1';
    if (hasRestoredScrollRef.current) {
      return;
    }
    if (!shouldRestoreFromDetail) {
      hasRestoredScrollRef.current = true;
      return;
    }
    if (!isInitialized || memes.length === 0 || scrollPosition <= 0) {
      return;
    }
    if (window.scrollY > 0) {
      hasRestoredScrollRef.current = true;
      sessionStorage.removeItem(RETURN_TO_MEMES_SCROLL_KEY);
      return;
    }

    hasRestoredScrollRef.current = true;
    suppressLoadMoreUntilRef.current = Date.now() + 1200;
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosition, left: 0, behavior: 'instant' });
      sessionStorage.removeItem(RETURN_TO_MEMES_SCROLL_KEY);
    });
  }, [isInitialized, memes.length, scrollPosition]);

  const { likeMeme, recordView } = useMemeInteractions();

  useEffect(() => {
    if (memes.length > 0) {
      const viewedMemes = getViewedMemes();
      const newMemes = memes.filter(meme =>
        !viewedMemes.has(meme.slug) && !processedMemesRef.current.has(meme.slug)
      );

      newMemes.forEach(meme => {
        processedMemesRef.current.add(meme.slug);
        addViewedMeme(meme.slug);
        recordView(meme.slug).catch(err => {
          console.error('Failed to record view for meme:', meme.slug, err);
        });
      });
    }
  }, [memes, addViewedMeme, recordView, getViewedMemes]);

  const displayMemes = useMemo(() => memes, [memes]);

  const { category_id, filter, time_period } = filters;

  const emptyMemesGridDescription = useMemo(() => {
    const timeSuffix =
      time_period !== 'all'
        ? time_period === 'today'
          ? ' today'
          : time_period === 'week'
            ? ' in the last week'
            : ' in the last month'
        : '';
    if (category_id) {
      return `No ${filter} memes found in this category${timeSuffix} yet.`;
    }
    return `No ${filter} memes found${timeSuffix} yet. Be the first to add to the pile.`;
  }, [category_id, filter, time_period]);

  const heroContent = useMemo(() => {
    const categoryText = category_id ? 'Category Memes' : 'All Memes';
    const timePhrase =
      time_period !== 'all'
        ? time_period === 'today'
          ? ' from today'
          : time_period === 'week'
            ? ' from the last week'
            : ' from the last month'
        : '';
    const description = category_id
      ? `${filter} memes in this category${timePhrase}. You picked the lane.`
      : `${filter} memes from every bucket${timePhrase}. Quantity over dignity.`;

    return { categoryText, description };
  }, [category_id, filter, time_period]);

  const handleLike = useCallback(async (slug: string) => {
    if (processingMemesRef.current.has(slug)) {
      return;
    }

    try {
      processingMemesRef.current.add(slug);

      const originalMeme = listMemes.find(meme => meme.slug === slug);
      if (!originalMeme) {
        return;
      }

      const originalLikeCount = Math.max(0, originalMeme.likes_count || 0);

      const actualIsLiked = await likeMeme(slug);

      let finalLikeCount: number;

      if (actualIsLiked) {
        finalLikeCount = originalLikeCount + 1;
      } else {
        finalLikeCount = Math.max(0, originalLikeCount - 1);
      }

      if (finalLikeCount < 0) {
        finalLikeCount = 0;
      }

      updateMemeLikeCount(slug, finalLikeCount);
      updateMemeLikedState(slug, actualIsLiked);

      setLikedMemes(prev => {
        const newSet = new Set(prev);
        if (actualIsLiked) {
          newSet.add(slug);
        } else {
          newSet.delete(slug);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Failed to like meme:', error);
    } finally {
      processingMemesRef.current.delete(slug);
    }
  }, [likeMeme, listMemes, updateMemeLikeCount, updateMemeLikedState]);

  const handleShare = useCallback(async (id: string) => {
    const meme = listMemes.find(m => m.id === id);
    if (!meme) {
      console.error('Meme not found for sharing:', id);
      return;
    }

    const wasShared = await shareMemeWithFallback(meme.title, meme.slug);

    if (wasShared) {
      const newShareCount = (meme.shares_count || 0) + 1;
      updateMemeShareCount(meme.slug, newShareCount);
    }
  }, [listMemes, updateMemeShareCount]);

  return (
    <>
      <section className="text-center mb-12 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)]">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
          {heroContent.categoryText}
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto min-h-[3.5rem]">
          {heroContent.description}
        </p>
      </section>

      <div className="flex min-h-0 min-w-0 flex-col gap-8 lg:flex-row max-w-7xl mx-auto">
        {sidebar}
        <section className="flex-1 min-h-0 min-w-0">
          <MemesMobileFilterBars
            showFilterSkeleton={memesLoading && !isInitialized}
            categories={categories ?? []}
            categoriesLoading={categoriesLoading}
            selectedCategoryId={filters.category_id}
            selectedFilter={filters.filter}
            selectedTimePeriod={filters.time_period}
            onCategorySelect={handleCategorySelect}
            onFilterChange={handleFilterChange}
            onTimePeriodChange={handleTimePeriodChange}
          />

          {memesError ? (
            <div className="text-center py-12 border-2 border-zinc-700 dark:border-zinc-400 bg-white dark:bg-gray-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.85)] dark:shadow-[6px_6px_0px_rgba(156,163,175,0.42)]">
              <div className="text-4xl mb-4 flex justify-center">
                <ICONS.Star className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wide mb-2">Failed to load memes</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{memesError}</p>
            </div>
          ) : (
            <>
              <div
                ref={memeGridRef}
                className="scroll-anchor scroll-mt-20"
                style={{ height: '1px', marginTop: '-1px' }}
              />
              <MemeGrid
                memes={displayMemes}
                onLike={handleLike}
                onShare={handleShare}
                loading={memesLoading}
                showLoadMore={true}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                layout="vertical"
                emptyStateDescription={emptyMemesGridDescription}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
