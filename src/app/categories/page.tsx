'use client';

import React, { useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { CategorySorting, Button } from '@/components/ui';
import { useMemes } from '@/lib/hooks/useMemes';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [localMemes, setLocalMemes] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'created_at' | 'views' | 'likes' | 'comments'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch real data
  const { memes, loading: memesLoading, error: memesError, hasMore, loadMore, refresh } = useMemes({
    category_id: selectedCategory || undefined,
    limit: 12,
    sort_by: sortBy,
    sort_order: sortOrder
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
    setLocalMemes([]); // Reset local memes when changing categories
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
            {selectedCategory ? 'Category Memes' : 'All Categories'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {selectedCategory 
              ? 'Discover memes from this category'
              : 'Discover memes from all categories. Scroll through our entire collection and find something that makes you laugh!'
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
            <CategorySorting
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </aside>

          {/* Memes Grid */}
          <section className="flex-1">
            {/* Meme Sorting Controls */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedCategory ? 'Category Memes' : 'All Memes'}
                </h3>
                
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sort by:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      const newSortBy = e.target.value as 'created_at' | 'views' | 'likes' | 'comments';
                      setSortBy(newSortBy);
                      setLocalMemes([]); // Reset local memes when changing sorting
                    }}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="views">Most Viewed</option>
                    <option value="likes">Most Liked</option>
                    <option value="comments">Most Commented</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setLocalMemes([]); // Reset local memes when changing sort order
                    }}
                    title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {sortBy === 'created_at' && (sortOrder === 'desc' ? 'Newest first' : 'Oldest first')}
                    {sortBy === 'views' && (sortOrder === 'desc' ? 'Most viewed first' : 'Least viewed first')}
                    {sortBy === 'likes' && (sortOrder === 'desc' ? 'Most liked first' : 'Least liked first')}
                    {sortBy === 'comments' && (sortOrder === 'desc' ? 'Most commented first' : 'Least commented first')}
                  </span>
                </div>
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
                ? 'No memes found in this category yet.'
                : 'Looks like there are no memes yet. Be the first to upload something hilarious!'
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
