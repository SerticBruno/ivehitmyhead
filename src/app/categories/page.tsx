'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { FiltersAndSorting, Button } from '@/components/ui';
import { useMemes } from '@/lib/hooks/useMemes';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'newest' | 'trending' | 'hottest'>('newest');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [localMemes, setLocalMemes] = useState<any[]>([]);

  // Ref for scrolling to meme grid
  const memeGridRef = useRef<HTMLElement>(null);

  // Get categories for mobile selector
  const { categories } = useCategories({ limit: 50 });

  // Function to scroll to top of meme grid
  const scrollToMemeGrid = () => {
    if (memeGridRef.current) {
      memeGridRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Reset local memes when filter or category changes
  useEffect(() => {
    setLocalMemes([]);
    // Scroll to top of meme grid when filters change
    scrollToMemeGrid();
  }, [selectedFilter, selectedCategory, selectedTimePeriod]);

  // Map filter values to API sort parameters
  const getSortParams = () => {
    switch (selectedFilter) {
      case 'trending':
        return { 
          sort_by: 'views' as const, 
          sort_order: 'desc' as const,
          secondary_sort: 'created_at' as const,
          secondary_order: 'desc' as const
        };
      case 'hottest':
        return { 
          sort_by: 'likes' as const, 
          sort_order: 'desc' as const,
          secondary_sort: 'created_at' as const,
          secondary_order: 'desc' as const
        };
      case 'newest':
      default:
        return { 
          sort_by: 'created_at' as const, 
          sort_order: 'desc' as const
        };
    }
  };

  const handleFilterChange = (filter: string) => {
    if (filter === 'newest' || filter === 'trending' || filter === 'hottest') {
      setSelectedFilter(filter);
    }
  };

  const handleTimePeriodChange = (period: string) => {
    if (period === 'all' || period === 'today' || period === 'week' || period === 'month') {
      setSelectedTimePeriod(period);
    }
  };

  // Fetch real data
  const { memes, loading: memesLoading, error: memesError, hasMore, loadMore, refresh } = useMemes({
    category_id: selectedCategory || undefined,
    limit: 7, // Changed from 2 to 7 for initial load
    time_period: selectedTimePeriod,
    ...getSortParams()
  });
  const { likeMeme } = useMemeInteractions();

  // Initialize local memes when memes change from the hook
  React.useEffect(() => {
    setLocalMemes(memes);
  }, [memes]);

  // Use local memes if available, otherwise use memes from the hook
  const displayMemes = localMemes.length > 0 ? localMemes : memes;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleLike = async (slug: string) => {
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
      
      // We need to update the memes in the useMemes hook
      // Since we can't directly modify the hook's state, we'll need to refresh
      // But we can optimize this by only updating the specific meme's like count
      // For now, let's use a local state to override the memes
      setLocalMemes(updatedMemes);
    } catch (error) {
      console.error('Failed to like meme:', error);
    }
  };

  const handleShare = (id: string) => {
    console.log('Sharing meme:', id);
    // Implement share functionality here
  };

  const handleComment = (id: string) => {
    console.log('Commenting on meme:', id);
    // Implement comment functionality here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {selectedCategory ? 'Category Memes' : 'All Memes'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {selectedCategory 
              ? `Discover ${selectedFilter} memes from this category${selectedTimePeriod !== 'all' ? ` in the last ${selectedTimePeriod === 'today' ? '24 hours' : selectedTimePeriod === 'week' ? '7 days' : '30 days'}` : ''}`
              : `Discover ${selectedFilter} memes from all categories${selectedTimePeriod !== 'all' ? ` in the last ${selectedTimePeriod === 'today' ? '24 hours' : selectedTimePeriod === 'week' ? '7 days' : '30 days'}` : ''}. Scroll through our entire collection and find something that makes you laugh!`
            }
          </p>
          {selectedCategory && (
            <button
              onClick={() => handleCategorySelect('')}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              ← Back to all categories
            </button>
          )}
        </section>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Categories Sidebar */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <FiltersAndSorting
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
              selectedFilter={selectedFilter}
              onFilterChange={handleFilterChange}
              selectedTimePeriod={selectedTimePeriod}
              onTimePeriodChange={handleTimePeriodChange}
            />
          </aside>

          {/* Memes Grid */}
          <section ref={memeGridRef} className="flex-1">
            {/* Mobile Time Period Selector */}
            <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'today', label: 'Today', icon: '🌙' },
                    { value: 'week', label: 'This Week', icon: '📅' },
                    { value: 'month', label: 'This Month', icon: '📅' },
                    { value: 'all', label: 'All Time', icon: '📅' }
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => handleTimePeriodChange(period.value)}
                      className={`flex flex-col items-center p-3 rounded-md transition-colors duration-150 ${
                        selectedTimePeriod === period.value
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="text-lg mb-1">{period.icon}</span>
                      <span className="text-xs font-medium">{period.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Filter Selector */}
            <div className="lg:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort By</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'newest', label: 'Newest', icon: '🆕' },
                    { value: 'trending', label: 'Trending', icon: '🔥' },
                    { value: 'hottest', label: 'Hottest', icon: '❤️' }
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => handleFilterChange(filter.value)}
                      className={`flex flex-col items-center p-3 rounded-md transition-colors duration-150 ${
                        selectedFilter === filter.value
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="text-lg mb-1">{filter.icon}</span>
                      <span className="text-xs font-medium">{filter.label}</span>
                    </button>
                  ))}
                </div>
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
                      !selectedCategory 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    🌟 All Categories
                  </button>
                  {categories?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                        selectedCategory === category.id 
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      {category.emoji} {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Meme Sorting Controls */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedFilter === 'newest' && 'Newest Memes'}
                  {selectedFilter === 'trending' && 'Trending Memes'}
                  {selectedFilter === 'hottest' && 'Hottest Memes'}
                  {selectedCategory && ` from ${selectedCategory ? 'this category' : 'all categories'}`}
                  {selectedTimePeriod !== 'all' && ` in the last ${selectedTimePeriod === 'today' ? '24 hours' : selectedTimePeriod === 'week' ? '7 days' : '30 days'}`}
                </h3>
              </div>
            </div>

            {memesError ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">😢</div>
                <h3 className="text-xl font-semibold mb-2">Failed to load memes</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{memesError}</p>
                <Button onClick={refresh}>Try Again</Button>
              </div>
            ) : (
              <MemeGrid
                memes={displayMemes}
                onLike={handleLike}
                onShare={handleShare}
                onComment={handleComment}
                loading={memesLoading}
                showLoadMore={true}
                onLoadMore={loadMore}
                hasMore={hasMore}
                layout="vertical"
                likedMemes={likedMemes}
              />
            )}
          </section>
        </div>

        {/* No memes found */}
        {!memesLoading && displayMemes.length === 0 && !memesError && (
          <section className="text-center py-12">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-xl font-semibold mb-2">No memes found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              {selectedCategory 
                ? `No ${selectedFilter} memes found in this category${selectedTimePeriod !== 'all' ? ` in the last ${selectedTimePeriod === 'today' ? '24 hours' : selectedTimePeriod === 'week' ? '7 days' : '30 days'}` : ''} yet.`
                : `No ${selectedFilter} memes found${selectedTimePeriod !== 'all' ? ` in the last ${selectedTimePeriod === 'today' ? '24 hours' : selectedTimePeriod === 'week' ? '7 days' : '30 days'}` : ''} yet. Be the first to upload something hilarious!`
              }
            </p>
            <Button onClick={() => window.location.href = '/upload'} className="mt-4">
              Upload First Meme
            </Button>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
