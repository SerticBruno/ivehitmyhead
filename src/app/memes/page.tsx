'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MemeGrid } from '@/components/meme';
import { FiltersAndSorting } from '@/components/ui';
import { useMemes } from '@/lib/hooks/useMemes';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { useMemesState } from '@/lib/contexts';
import { Meme } from '@/lib/types/meme';
import { ICONS, getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';

export default function MemesPage() {
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [userInitiated, setUserInitiated] = useState(false);
  
  // Get memes state context
  const { state: memesState, setScrollPosition } = useMemesState();
  
  // Ref for scrolling to meme grid
  const memeGridRef = useRef<HTMLDivElement>(null);
  
  // Track which memes have been viewed in this session to prevent double counting
  // Using sessionStorage to persist across filter changes and component re-renders
  const viewedMemesRef = useRef<Set<string>>(new Set());
  
  // Ref to track which memes have been processed in the current render cycle
  const processedMemesRef = useRef<Set<string>>(new Set());
  
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

  // Get categories for mobile selector
  const { categories, loading: categoriesLoading } = useCategories({ limit: 50 });

  // Function to scroll to top of meme grid
  const scrollToMemeGrid = useCallback(() => {
    if (memeGridRef.current) {
      // Get the navbar height dynamically
      const header = document.querySelector('header');
      const navbarHeight = header ? header.offsetHeight : 80;
      
      // Calculate the position to scroll to (accounting for navbar)
      const elementTop = memeGridRef.current.offsetTop;
      const offsetPosition = elementTop - navbarHeight - 20; // Extra 20px for breathing room
      
      // Scroll to the calculated position
      window.scrollTo({
        top: Math.max(0, offsetPosition), // Ensure we don't scroll to negative values
        behavior: 'smooth'
      });
    }
  }, []);

  // Restore scroll position when returning to the page
  useEffect(() => {
    if (memesState.isInitialized && memesState.scrollPosition > 0) {
      // Use setTimeout to ensure the DOM is fully rendered
      const timer = setTimeout(() => {
        window.scrollTo({
          top: memesState.scrollPosition,
          behavior: 'instant' // Use instant to avoid animation when restoring position
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [memesState.isInitialized, memesState.scrollPosition]);

  // Save scroll position when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setScrollPosition(window.scrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollPosition]);

  // Reset viewed memes tracking when major filters change to ensure fresh tracking
  useEffect(() => {
    // Clear viewed memes tracking when filters change significantly
    // This ensures that if a user changes filters, we track views for the new set of memes
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('viewedMemes');
      viewedMemesRef.current.clear();
      processedMemesRef.current.clear();
    }
  }, [memesState.filters.filter, memesState.filters.category_id, memesState.filters.time_period]);

  // Map filter values to API sort parameters
  const getSortParams = useMemo(() => {
    switch (memesState.filters.filter) {
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
  }, [memesState.filters.filter]);

  const handleFilterChange = useCallback((filter: string) => {
    if (filter === 'newest' || filter === 'trending' || filter === 'hottest') {
      setUserInitiated(true);
      // The useMemes hook will handle updating the context filters
    }
  }, []);

  const handleTimePeriodChange = useCallback((period: string) => {
    if (period === 'all' || period === 'today' || period === 'week' || period === 'month') {
      setUserInitiated(true);
      // The useMemes hook will handle updating the context filters
    }
  }, []);

  // Fetch real data using the global context state
  const { memes, loading: memesLoading, error: memesError, hasMore, loadMore } = useMemes({
    category_id: memesState.filters.category_id || undefined,
    limit: 7, // Changed from 2 to 7 for initial load
    time_period: memesState.filters.time_period,
    ...getSortParams
  });
  
  const { likeMeme, recordView } = useMemeInteractions();

  // Track views for memes when they are displayed
  useEffect(() => {
    if (memes.length > 0) {
      const viewedMemes = getViewedMemes();
      const newMemes = memes.filter(meme => 
        !viewedMemes.has(meme.slug) && !processedMemesRef.current.has(meme.slug)
      );
      
      // Only record views for memes we haven't seen before
      newMemes.forEach(meme => {
        processedMemesRef.current.add(meme.slug);
        addViewedMeme(meme.slug);
        // Record view asynchronously without blocking the UI
        recordView(meme.slug).catch(err => {
          console.error('Failed to record view for meme:', meme.slug, err);
        });
      });
    }
  }, [memes, addViewedMeme, recordView, getViewedMemes]);

  // Check if we need to load more when returning to the page
  useEffect(() => {
    if (hasMore && !memesLoading && memes.length > 0) {
      // Check if we're already near the bottom of the page (e.g., from restored scroll position)
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800;
      
      if (isNearBottom) {
        console.log('Already near bottom of page, triggering load more');
        // Small delay to ensure the page is fully rendered
        setTimeout(() => {
          loadMore();
        }, 100);
      }
    }
  }, [hasMore, memesLoading, memes.length, loadMore]);

  // Simplified effect to handle returning from single meme page
  useEffect(() => {

    // Only trigger load more if we have memes, have more to load, and are not currently loading
    if (memes.length > 0 && hasMore && !memesLoading) {
      // Check if we're on a page > 1 (meaning we've loaded more than initial memes)
      const currentPage = Math.ceil(memes.length / 7); // Assuming 7 memes per page
      
      if (currentPage > 1) {
        console.log('Returned to memes page with existing memes, checking if we need to load more');
        
        // Check if we're near the bottom
        const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800;
        
        console.log('Scroll position check:', {
          windowHeight: window.innerHeight,
          scrollY: window.scrollY,
          documentHeight: document.documentElement.scrollHeight,
          isNearBottom
        });
        
        if (isNearBottom) {
          console.log('Near bottom with existing memes, triggering load more');
          // Just trigger one load more - let the infinite scroll handle the rest
          setTimeout(() => {
            loadMore();
          }, 200);
        }
      }
    }
  }, [memes.length, hasMore, memesLoading, loadMore, memesState.filters, memesState.isInitialized, memesState.currentPage]);

  // Memoize the display memes to prevent unnecessary re-renders
  const displayMemes = useMemo(() => memes, [memes]);

  // Memoize the hero section content to prevent unnecessary re-renders
  const heroContent = useMemo(() => {
    const { category_id, filter, time_period } = memesState.filters;
    const categoryText = category_id ? 'Category Memes' : 'All Memes';
    const description = category_id 
      ? `Discover ${filter} memes from this category${time_period !== 'all' ? ` in the last ${time_period === 'today' ? '24 hours' : time_period === 'week' ? '7 days' : '30 days'}` : ''}`
      : `Discover ${filter} memes from all categories${time_period !== 'all' ? ` in the last ${time_period === 'today' ? '24 hours' : time_period === 'week' ? '7 days' : '30 days'}` : ''}.`;
    
    return { categoryText, description };
  }, [memesState.filters]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setUserInitiated(true);
    // The useMemes hook will handle updating the context filters
  }, []);

  const handleLike = useCallback(async (slug: string) => {
    try {
      const isLiked = await likeMeme(slug);
      
      // Update local state to reflect the like change
      setLikedMemes(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(slug);
        } else {
          newSet.delete(slug);
        }
        return newSet;
      });

      // Update the meme's likes count locally without refreshing the page
      const updatedMemes = memes.map(meme => {
        if (meme.slug === slug) {
          return {
            ...meme,
            likes_count: isLiked ? meme.likes_count + 1 : Math.max(0, meme.likes_count - 1)
          };
        }
        return meme;
      });
      
      // Since we can't directly modify the hook's state, we'll need to refresh
      // But we can optimize this by only updating the specific meme's like count
      // For now, let's use a local state to override the memes
      // This will be handled by the context state management
    } catch (error) {
      console.error('Failed to like meme:', error);
    }
  }, [memes, likeMeme]);

  const handleShare = useCallback((id: string) => {
    console.log('Sharing meme:', id);
    // Implement share functionality here
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {memesLoading && !memesState.isInitialized ? (
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto max-w-md"></div>
            ) : (
              heroContent.categoryText
            )}
          </h1>
          {memesLoading && !memesState.isInitialized ? (
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto max-w-lg mb-8"></div>
          ) : (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {heroContent.description}
            </p>
          )}
        </section>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Categories Sidebar */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            {memesLoading && !memesState.isInitialized ? (
              <div className="sticky top-20 h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 rounded-b-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meme Filters</h3>
                </div>

                {/* Time Period Filter */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Period</h4>
                  <div className="flex justify-between gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                </div>

                {/* Filter Options */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sort By</h4>
                  <div className="flex justify-between gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-1"></div>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="p-4 flex-1 flex flex-col min-h-0">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <FiltersAndSorting
                selectedCategory={memesState.filters.category_id}
                onCategorySelect={handleCategorySelect}
                selectedFilter={memesState.filters.filter}
                onFilterChange={handleFilterChange}
                selectedTimePeriod={memesState.filters.time_period}
                onTimePeriodChange={handleTimePeriodChange}
              />
            )}
          </aside>

          {/* Memes Grid */}
          <section className="flex-1">
            {/* Mobile Time Period Selector */}
            <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period</h4>
                {memesLoading && !memesState.isInitialized ? (
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'today', label: 'Today', icon: <ICONS.Moon className="w-5 h-5" /> },
                      { value: 'week', label: 'This Week', icon: <ICONS.Calendar className="w-5 h-5" /> },
                      { value: 'month', label: 'This Month', icon: <ICONS.Calendar className="w-5 h-5" /> },
                      { value: 'all', label: 'All Time', icon: <ICONS.Calendar className="w-5 h-5" /> }
                    ].map((period) => (
                      <button
                        key={period.value}
                        onClick={() => handleTimePeriodChange(period.value)}
                        className={`flex flex-col items-center p-3 rounded-md transition-colors duration-150 ${
                          memesState.filters.time_period === period.value
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        <span className="mb-1">{period.icon}</span>
                        <span className="text-xs font-medium">{period.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Filter Selector */}
            <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</h4>
                {memesLoading && !memesState.isInitialized ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'hottest', label: 'Hottest', icon: <ICONS.Heart className="w-5 h-5" /> },
                      { value: 'trending', label: 'Trending', icon: <ICONS.Flame className="w-5 h-5" /> },
                      { value: 'newest', label: 'Newest', icon: <ICONS.Star className="w-5 h-5" /> }
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleFilterChange(filter.value)}
                        className={`flex flex-col items-center p-3 rounded-md transition-colors duration-150 ${
                          memesState.filters.filter === filter.value
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
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

            {/* Mobile Category Selector */}
            <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                      !memesState.filters.category_id 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <ICONS.Star className="w-4 h-4 inline mr-1" />
                    All Categories
                  </button>
                  {categoriesLoading ? (
                    // Show loading skeleton for categories
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    ))
                  ) : (
                    categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                          memesState.filters.category_id === category.id 
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        {getCategoryIconOrEmoji(category.name, category.emoji)}
                        <span className="ml-1">{category.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

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
                {/* Scroll anchor positioned exactly at the top of the meme grid */}
                <div ref={memeGridRef}></div>
                <MemeGrid
                  memes={displayMemes}
                  onLike={handleLike}
                  onShare={handleShare}
                  loading={memesLoading}
                  showLoadMore={true}
                  onLoadMore={loadMore}
                  hasMore={hasMore}
                  layout="vertical"
                  likedMemes={likedMemes}
                />
              </>
            )}
          </section>
        </div>

        {/* No memes found */}
        {!memesLoading && displayMemes.length === 0 && !memesError && (
          <section className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <ICONS.Star className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No memes found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              {memesState.filters.category_id 
                ? `No ${memesState.filters.filter} memes found in this category${memesState.filters.time_period !== 'all' ? ` in the last ${memesState.filters.time_period === 'today' ? '24 hours' : memesState.filters.time_period === 'week' ? '7 days' : '30 days'}` : ''} yet.`
                : `No ${memesState.filters.filter} memes found${memesState.filters.time_period !== 'all' ? ` in the last ${memesState.filters.time_period === 'today' ? '24 hours' : memesState.filters.time_period === 'week' ? '7 days' : '30 days'}` : ''} yet. Be the first to upload something hilarious!`
              }
            </p>
          </section>
        )}
      </main>
    </div>
  );
}