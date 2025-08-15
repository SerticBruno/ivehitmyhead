'use client';

import React, { useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { CategoriesSidebar, Button } from '@/components/ui';
import { useMemes } from '@/lib/hooks/useMemes';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [localMemes, setLocalMemes] = useState<any[]>([]);

  // Fetch real data
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { memes, loading: memesLoading, error: memesError, hasMore, loadMore, refresh } = useMemes({
    category_id: selectedCategory || undefined,
    limit: 12
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
    setShowMobileCategories(false); // Hide mobile menu after selection
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

  // Show loading state while fetching categories
  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={() => {}} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading categories...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state if there's an issue with categories
  if (categoriesError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={() => {}} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4">😢</div>
            <h2 className="text-2xl font-bold mb-2">Failed to load categories</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{categoriesError}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {selectedCategory ? categories.find(cat => cat.id === selectedCategory)?.name : 'All Categories'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {selectedCategory 
              ? `Discover memes from the ${categories.find(cat => cat.id === selectedCategory)?.name} category`
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

        {/* Mobile Category Selector */}
        <div className="lg:hidden mb-6">
          <Button
            onClick={() => setShowMobileCategories(!showMobileCategories)}
            variant="outline"
            className="w-full justify-between"
          >
            <span>
              {selectedCategory 
                ? categories.find(cat => cat.id === selectedCategory)?.name 
                : 'All Categories'
              }
            </span>
            <span>{showMobileCategories ? '▼' : '▶'}</span>
          </Button>
          
          {showMobileCategories && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={cn(
                    "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    !selectedCategory 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <span className="text-lg mr-3">🌟</span>
                  <span>All Categories</span>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                      "hover:bg-gray-50 dark:hover:bg-gray-700",
                      selectedCategory === category.id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <span className="text-lg mr-3">{category.emoji}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Categories Sidebar */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <CategoriesSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </aside>

          {/* Memes Grid */}
          <section className="flex-1">
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
                ? `No memes found in the ${categories.find(cat => cat.id === selectedCategory)?.name} category yet.`
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
