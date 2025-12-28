'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MemeGrid } from '@/components/meme';
import { FiltersAndSorting } from '@/components/ui';
import { useMemes } from '@/lib/hooks/useMemes';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { useMemesState } from '@/lib/contexts';
import { ICONS, getCategoryIconOrEmoji } from '@/lib/utils/categoryIcons';
import { shareMemeWithFallback } from '@/lib/utils/shareUtils';

export default function MemesPage() {
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  
  // Get memes state context
  const { state: memesState, setScrollPosition, updateMemeLikeCount, updateMemeShareCount, updateMemeLikedState } = useMemesState();
  
  // Initialize likedMemes state by fetching user's liked memes from API
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
          
          // Update the memes in context with their liked state
          if (memesState.memes.length > 0) {
            console.log('Updating memes in context with liked state...');
            memesState.memes.forEach(meme => {
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

    // Only fetch once when the component mounts
    if (likedMemes.size === 0) {
      fetchLikedMemes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to avoid infinite loops

  // Update memes with liked state whenever memes change in context
  useEffect(() => {
    if (likedMemes.size > 0 && memesState.memes.length > 0) {
      console.log('Updating memes in context with liked state...');
      memesState.memes.forEach(meme => {
        const isLiked = likedMemes.has(meme.slug);
        if (meme.is_liked !== isLiked) {
          updateMemeLikedState(meme.slug, isLiked);
        }
      });
    }
  }, [memesState.memes, likedMemes, updateMemeLikedState]);
  
  // Ref for scrolling to meme grid
  const memeGridRef = useRef<HTMLDivElement>(null);
  
  // Track which memes have been viewed in this session to prevent double counting
  // Using sessionStorage to persist across filter changes and component re-renders
  const viewedMemesRef = useRef<Set<string>>(new Set());
  
  // Ref to track which memes have been processed in the current render cycle
  const processedMemesRef = useRef<Set<string>>(new Set());
  
  // Track which memes are currently being processed to prevent double-clicks
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

  // Get categories for mobile selector
  const { categories, loading: categoriesLoading } = useCategories({ limit: 50 });

  // Restore scroll position when returning to the page
  useEffect(() => {
    // Check if we have a saved scroll position and we're not at the top
    if (memesState.scrollPosition > 0 && window.scrollY === 0) {
      console.log('Restoring scroll position:', memesState.scrollPosition);
      
      // Use a longer delay to ensure the page is fully rendered and memes are displayed
      const timer = setTimeout(() => {
        window.scrollTo({
          top: memesState.scrollPosition,
          behavior: 'instant' // Use instant to avoid animation when restoring position
        });
        console.log('Scroll position restored to:', memesState.scrollPosition);
      }, 300); // Increased delay to ensure proper rendering
      
      return () => clearTimeout(timer);
    }
  }, [memesState.scrollPosition, memesState.isInitialized]);

  // Save scroll position when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        // Only save if we've scrolled down significantly (not just tiny movements)
        if (currentScrollY > 10) {
          setScrollPosition(currentScrollY);
        }
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
      // The useMemes hook will handle updating the context filters
    }
  }, []);

  const handleTimePeriodChange = useCallback((period: string) => {
    if (period === 'all' || period === 'today' || period === 'week' || period === 'month') {
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
  
  // Additional effect to restore scroll when memes are loaded and we have a saved position
  useEffect(() => {
    if (memes.length > 0 && memesState.scrollPosition > 0 && window.scrollY === 0) {
      console.log('Memes loaded, restoring scroll position:', memesState.scrollPosition);
      
      const timer = setTimeout(() => {
        window.scrollTo({
          top: memesState.scrollPosition,
          behavior: 'instant'
        });
        console.log('Scroll position restored after memes loaded:', memesState.scrollPosition);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [memes.length, memesState.scrollPosition]);

  // Listen for page visibility changes to restore scroll when returning to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          memesState.scrollPosition > 0 && 
          window.scrollY === 0) {
        console.log('Page became visible, restoring scroll position:', memesState.scrollPosition);
        
        // Use a longer delay to ensure everything is rendered
        setTimeout(() => {
          window.scrollTo({
            top: memesState.scrollPosition,
            behavior: 'instant'
          });
          console.log('Scroll position restored on visibility change:', memesState.scrollPosition);
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [memesState.scrollPosition]);

  // Refresh meme data when returning to the page to get updated counts
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing meme data to get updated counts');
        // Small delay to ensure the page is fully loaded
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/memes') {
            // Trigger a refresh of the meme data to get updated share/like counts
            window.dispatchEvent(new CustomEvent('refreshMemes'));
          }
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Additional scroll restoration on window focus (when returning from another tab/window)
  useEffect(() => {
    const handleFocus = () => {
      if (memesState.scrollPosition > 0 && window.scrollY === 0) {
        console.log('Window focused, restoring scroll position:', memesState.scrollPosition);
        
        setTimeout(() => {
          window.scrollTo({
            top: memesState.scrollPosition,
            behavior: 'instant'
          });
          console.log('Scroll position restored on window focus:', memesState.scrollPosition);
        }, 300);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [memesState.scrollPosition]);

  // Force scroll restoration after a delay when the component mounts
  useEffect(() => {
    if (memesState.scrollPosition > 0) {
      console.log('Component mounted, scheduling scroll restoration:', memesState.scrollPosition);
      
      // Try multiple times with increasing delays to ensure it works
      const timers = [
        setTimeout(() => {
          if (window.scrollY === 0) {
            window.scrollTo({
              top: memesState.scrollPosition,
              behavior: 'instant'
            });
            console.log('Scroll restored on first attempt:', memesState.scrollPosition);
          }
        }, 100),
        setTimeout(() => {
          if (window.scrollY === 0) {
            window.scrollTo({
              top: memesState.scrollPosition,
              behavior: 'instant'
            });
            console.log('Scroll restored on second attempt:', memesState.scrollPosition);
          }
        }, 500),
        setTimeout(() => {
          if (window.scrollY === 0) {
            window.scrollTo({
              top: memesState.scrollPosition,
              behavior: 'instant'
            });
            console.log('Scroll restored on third attempt:', memesState.scrollPosition);
          }
        }, 1000)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [memesState.scrollPosition]);
  
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

  // Enhanced effect to handle returning from single meme page and auto-load more memes
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

  // New effect specifically for handling scroll restoration and auto-loading
  useEffect(() => {
    // This effect runs after scroll restoration to check if we need to load more
    if (memesState.scrollPosition > 0 && memes.length > 0 && hasMore && !memesLoading) {
      console.log('Scroll restored, checking if we need to load more memes');
      
      // Wait a bit for the scroll to settle, then check position
      const timer = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        
        // Check if we're near the bottom after scroll restoration
        const isNearBottom = currentScrollY + windowHeight >= documentHeight - 800;
        
        console.log('Post-scroll restoration check:', {
          currentScrollY,
          documentHeight,
          windowHeight,
          isNearBottom,
          savedPosition: memesState.scrollPosition
        });
        
        if (isNearBottom) {
          console.log('Near bottom after scroll restoration, triggering load more');
          loadMore();
        }
      }, 500); // Wait 500ms for scroll to settle
      
      return () => clearTimeout(timer);
    }
  }, [memesState.scrollPosition, memes.length, hasMore, memesLoading, loadMore]);

  // Aggressive check for loading more memes when returning to the page
  useEffect(() => {
    // This effect specifically handles the case when returning from a single meme page
    if (memesState.scrollPosition > 0 && memes.length > 0 && hasMore && !memesLoading) {
      console.log('Checking if we need to aggressively load more memes after returning to page');
      
      // Check multiple times with increasing delays to catch edge cases
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
  }, [memesState.scrollPosition, memes.length, hasMore, memesLoading, loadMore]);
  
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
    // The useMemes hook will handle updating the context filters
    console.log('Category selected:', categoryId);
  }, []);

  const handleLike = useCallback(async (slug: string) => {
    // Prevent double-clicks by checking if this meme is already being processed
    if (processingMemesRef.current.has(slug)) {
      console.log('Meme is already being processed, ignoring click:', slug);
      return;
    }
    
    try {
      console.log('handleLike called with slug:', slug);
      
      // Mark this meme as being processed
      processingMemesRef.current.add(slug);
      
      // Store the original like count before making the API call
      const originalMeme = memesState.memes.find(meme => meme.slug === slug);
      if (!originalMeme) {
        console.warn('Meme not found in current state:', slug);
        return;
      }
      
      const originalLikeCount = Math.max(0, originalMeme.likes_count || 0);
      
      // Log warning if we found a negative like count in the database
      if (originalMeme.likes_count < 0) {
        console.warn('Found negative like count in database, clamping to 0:', {
          slug,
          databaseCount: originalMeme.likes_count,
          clampedCount: originalLikeCount
        });
      }
      
      // Make the API call first to get the actual result
      const actualIsLiked = await likeMeme(slug);
      console.log('API returned isLiked:', actualIsLiked);
      
      // Now update the UI based on the actual API result
      let finalLikeCount: number;
      
      if (actualIsLiked) {
        // User just liked the meme
        finalLikeCount = originalLikeCount + 1;
      } else {
        // User just unliked the meme
        finalLikeCount = Math.max(0, originalLikeCount - 1);
      }
      
      // Additional safety check to prevent negative counts
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
      
      // Update the like count to match the API result
      updateMemeLikeCount(slug, finalLikeCount);
      
      // Update the liked state in the context to match the API result
      updateMemeLikedState(slug, actualIsLiked);
      
      // Update the liked state to match the API result
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
      
      // On error, we don't need to revert anything since we didn't make optimistic updates
      // Just log the error and let the user try again
    } finally {
      // Always remove the processing flag, even if there was an error
      processingMemesRef.current.delete(slug);
    }
  }, [likeMeme, memesState.memes, updateMemeLikeCount, updateMemeLikedState]);

  const handleShare = useCallback(async (id: string) => {
    // Find the meme by ID to get its slug
    const meme = memesState.memes.find(m => m.id === id);
    if (!meme) {
      console.error('Meme not found for sharing:', id);
      return;
    }
    
    // Share the meme first
    const wasShared = await shareMemeWithFallback(meme.title, meme.slug);
    
    if (wasShared) {
      // Update the local share count immediately for better UX
      const newShareCount = (meme.shares_count || 0) + 1;
      updateMemeShareCount(meme.slug, newShareCount);
    }
  }, [memesState.memes, updateMemeShareCount]);

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
                memeGridRef={memeGridRef}
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
                 <div ref={memeGridRef} className="scroll-anchor" style={{ height: '1px', marginTop: '-1px' }}></div>
                 <MemeGrid
                   memes={displayMemes}
                   onLike={handleLike}
                   onShare={handleShare}
                   loading={memesLoading}
                   showLoadMore={true}
                   onLoadMore={loadMore}
                   hasMore={hasMore}
                   layout="vertical"
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