'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { MemeGrid } from '@/components/meme';
import { MemesMobileFilterBars } from '@/components/ui/MemesMobileFilterBars';
import { useMemes } from '@/lib/hooks/useMemes';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { useMemesUIState, useMemesListState, MEMES_LIST_SCROLL_EXPIRY_AT_KEY } from '@/lib/contexts';
import { ICONS } from '@/lib/utils/categoryIcons';
import { shareMemeWithFallback } from '@/lib/utils/shareUtils';

interface MemesFeedPanelProps {
  memeGridRef: React.RefObject<HTMLDivElement | null>;
  sidebar: React.ReactNode;
}

export function MemesFeedPanel({ memeGridRef, sidebar }: MemesFeedPanelProps) {
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());

  const {
    filters,
    scrollPosition,
    isInitialized,
    setScrollPosition,
    setFilters,
  } = useMemesUIState();

  const {
    memes: listMemes,
    currentPage,
    updateMemeLikeCount,
    updateMemeShareCount,
    updateMemeLikedState,
  } = useMemesListState();

  const listMemesRef = useRef(listMemes);
  listMemesRef.current = listMemes;

  useEffect(() => {
    const fetchLikedMemes = async () => {
      try {
        console.log('Fetching user\'s liked memes...');
        const response = await fetch('/api/memes/liked');

        if (response.ok) {
          const data = await response.json();
          const likedSlugs = data.likedMemes || [];

          console.log('Fetched liked memes:', likedSlugs);
          setLikedMemes(new Set(likedSlugs));

          const memesSnapshot = listMemesRef.current;
          if (memesSnapshot.length > 0) {
            console.log('Updating memes in context with liked state...');
            memesSnapshot.forEach(meme => {
              const isLiked = likedSlugs.includes(meme.slug);
              if (meme.is_liked !== isLiked) {
                updateMemeLikedState(meme.slug, isLiked);
              }
            });
          }
        } else {
          console.warn('Failed to fetch liked memes, using empty set');
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
      console.log('Updating memes in context with liked state...');
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
    if (scrollPosition > 0 && window.scrollY === 0) {
      console.log('Restoring scroll position:', scrollPosition);

      const timer = setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'instant'
        });
        console.log('Scroll position restored to:', scrollPosition);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [scrollPosition, isInitialized]);

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

  const { memes, loading: memesLoading, error: memesError, hasMore, loadMore, refresh } = useMemes({
    category_id: filters.category_id || undefined,
    limit: 7,
    time_period: filters.time_period,
    ...getSortParams
  });

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const raw = sessionStorage.getItem(MEMES_LIST_SCROLL_EXPIRY_AT_KEY);
    if (raw === null) {
      return;
    }
    const expiresAt = parseInt(raw, 10);
    if (Number.isNaN(expiresAt)) {
      sessionStorage.removeItem(MEMES_LIST_SCROLL_EXPIRY_AT_KEY);
      return;
    }
    if (Date.now() <= expiresAt) {
      return;
    }
    sessionStorage.removeItem(MEMES_LIST_SCROLL_EXPIRY_AT_KEY);
    setScrollPosition(0);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    refresh();
  }, [setScrollPosition, refresh]);

  useEffect(() => {
    if (memes.length > 0 && scrollPosition > 0 && window.scrollY === 0) {
      console.log('Memes loaded, restoring scroll position:', scrollPosition);

      const timer = setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'instant'
        });
        console.log('Scroll position restored after memes loaded:', scrollPosition);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [memes.length, scrollPosition]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' &&
          scrollPosition > 0 &&
          window.scrollY === 0) {
        console.log('Page became visible, restoring scroll position:', scrollPosition);

        setTimeout(() => {
          window.scrollTo({
            top: scrollPosition,
            behavior: 'instant'
          });
          console.log('Scroll position restored on visibility change:', scrollPosition);
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [scrollPosition]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing meme data to get updated counts');
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/memes') {
            window.dispatchEvent(new CustomEvent('refreshMemes'));
          }
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (scrollPosition > 0 && window.scrollY === 0) {
        console.log('Window focused, restoring scroll position:', scrollPosition);

        setTimeout(() => {
          window.scrollTo({
            top: scrollPosition,
            behavior: 'instant'
          });
          console.log('Scroll position restored on window focus:', scrollPosition);
        }, 300);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [scrollPosition]);

  useEffect(() => {
    if (scrollPosition > 0) {
      console.log('Component mounted, scheduling scroll restoration:', scrollPosition);

      const timers = [
        setTimeout(() => {
          if (window.scrollY === 0) {
            window.scrollTo({
              top: scrollPosition,
              behavior: 'instant'
            });
            console.log('Scroll restored on first attempt:', scrollPosition);
          }
        }, 100),
        setTimeout(() => {
          if (window.scrollY === 0) {
            window.scrollTo({
              top: scrollPosition,
              behavior: 'instant'
            });
            console.log('Scroll restored on second attempt:', scrollPosition);
          }
        }, 500),
        setTimeout(() => {
          if (window.scrollY === 0) {
            window.scrollTo({
              top: scrollPosition,
              behavior: 'instant'
            });
            console.log('Scroll restored on third attempt:', scrollPosition);
          }
        }, 1000)
      ];

      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [scrollPosition]);

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

  useEffect(() => {
    if (hasMore && !memesLoading && memes.length > 0) {
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800;

      if (isNearBottom) {
        console.log('Already near bottom of page, triggering load more');
        setTimeout(() => {
          loadMore();
        }, 100);
      }
    }
  }, [hasMore, memesLoading, memes.length, loadMore]);

  useEffect(() => {
    if (memes.length > 0 && hasMore && !memesLoading) {
      const currentPageEstimate = Math.ceil(memes.length / 7);

      if (currentPageEstimate > 1) {
        console.log('Returned to memes page with existing memes, checking if we need to load more');

        const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800;

        console.log('Scroll position check:', {
          windowHeight: window.innerHeight,
          scrollY: window.scrollY,
          documentHeight: document.documentElement.scrollHeight,
          isNearBottom
        });

        if (isNearBottom) {
          console.log('Near bottom with existing memes, triggering load more');
          setTimeout(() => {
            loadMore();
          }, 200);
        }
      }
    }
  }, [memes.length, hasMore, memesLoading, loadMore, filters, isInitialized, currentPage]);

  useEffect(() => {
    if (scrollPosition > 0 && memes.length > 0 && hasMore && !memesLoading) {
      console.log('Scroll restored, checking if we need to load more memes');

      const timer = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;

        const isNearBottom = currentScrollY + windowHeight >= documentHeight - 800;

        console.log('Post-scroll restoration check:', {
          currentScrollY,
          documentHeight,
          windowHeight,
          isNearBottom,
          savedPosition: scrollPosition
        });

        if (isNearBottom) {
          console.log('Near bottom after scroll restoration, triggering load more');
          loadMore();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [scrollPosition, memes.length, hasMore, memesLoading, loadMore]);

  useEffect(() => {
    if (scrollPosition > 0 && memes.length > 0 && hasMore && !memesLoading) {
      console.log('Checking if we need to aggressively load more memes after returning to page');

      const timers = [
        setTimeout(() => {
          if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 800) {
            console.log('Aggressive check 1: Near bottom, loading more');
            loadMore();
          }
        }, 300),
        setTimeout(() => {
          if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 800) {
            console.log('Aggressive check 2: Near bottom, loading more');
            loadMore();
          }
        }, 800),
        setTimeout(() => {
          if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 800) {
            console.log('Aggressive check 3: Near bottom, loading more');
            loadMore();
          }
        }, 1500)
      ];

      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [scrollPosition, memes.length, hasMore, memesLoading, loadMore]);

  const displayMemes = useMemo(() => memes, [memes]);

  const emptyMemesGridDescription = useMemo(() => {
    const { category_id, filter, time_period } = filters;
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
  }, [
    filters.category_id,
    filters.filter,
    filters.time_period,
  ]);

  const heroContent = useMemo(() => {
    const { category_id, filter, time_period } = filters;
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
  }, [filters.category_id, filters.filter, filters.time_period]);

  const handleLike = useCallback(async (slug: string) => {
    if (processingMemesRef.current.has(slug)) {
      console.log('Meme is already being processed, ignoring click:', slug);
      return;
    }

    try {
      console.log('handleLike called with slug:', slug);

      processingMemesRef.current.add(slug);

      const originalMeme = listMemes.find(meme => meme.slug === slug);
      if (!originalMeme) {
        console.warn('Meme not found in current state:', slug);
        return;
      }

      const originalLikeCount = Math.max(0, originalMeme.likes_count || 0);

      if (originalMeme.likes_count < 0) {
        console.warn('Found negative like count in database, clamping to 0:', {
          slug,
          databaseCount: originalMeme.likes_count,
          clampedCount: originalLikeCount
        });
      }

      const actualIsLiked = await likeMeme(slug);
      console.log('API returned isLiked:', actualIsLiked);

      let finalLikeCount: number;

      if (actualIsLiked) {
        finalLikeCount = originalLikeCount + 1;
      } else {
        finalLikeCount = Math.max(0, originalLikeCount - 1);
      }

      if (finalLikeCount < 0) {
        console.warn('Calculated negative like count, clamping to 0:', {
          slug,
          originalCount: originalLikeCount,
          finalCount: finalLikeCount
        });
        finalLikeCount = 0;
      }

      console.log('Calculated final like count:', {
        slug,
        originalCount: originalLikeCount,
        actualIsLiked,
        finalCount: finalLikeCount
      });

      updateMemeLikeCount(slug, finalLikeCount);
      updateMemeLikedState(slug, actualIsLiked);

      setLikedMemes(prev => {
        const newSet = new Set(prev);
        if (actualIsLiked) {
          newSet.add(slug);
        } else {
          newSet.delete(slug);
        }
        console.log('Final likedMemes state after API call:', Array.from(newSet));
        return newSet;
      });

      console.log('Like operation completed successfully:', {
        slug,
        originalCount: originalLikeCount,
        finalCount: finalLikeCount,
        isLiked: actualIsLiked
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
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {memesLoading && !isInitialized ? (
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto max-w-md"></div>
          ) : (
            heroContent.categoryText
          )}
        </h1>
        {memesLoading && !isInitialized ? (
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto max-w-lg mb-8"></div>
        ) : (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {heroContent.description}
          </p>
        )}
      </section>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {sidebar}
        <section className="flex-1">
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
            <div className="text-center py-12">
              <div className="text-4xl mb-4 flex justify-center">
                <ICONS.Star className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Failed to load memes</h3>
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
                onLoadMore={loadMore}
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
