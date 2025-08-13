'use client';

import React, { useState, useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { CategoriesSidebar, Button } from '@/components/ui';
import { Meme, Category } from '@/lib/types/meme';
import { fetchMemes, fetchCategories } from '@/lib/data/mockData';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadMemes();
  }, []);

  // Load categories
  const loadCategories = async () => {
    try {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Load memes with category filtering
  const loadMemes = async (isLoadMore = false, categoryId?: string) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Reset page when changing categories
      const currentPage = isLoadMore ? page : 1;
      const categoryName = categoryId ? categories.find(cat => cat.id === categoryId)?.name : undefined;
      
      const result = await fetchMemes(currentPage, 5, categoryName);
      
      if (isLoadMore) {
        setMemes(prev => [...prev, ...result.memes]);
      } else {
        setMemes(result.memes);
      }
      
      setHasMore(result.hasMore);
      setPage(isLoadMore ? prev => prev + 1 : 2);
    } catch (error) {
      console.error('Failed to load memes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setHasMore(true);
    setShowMobileCategories(false); // Hide mobile menu after selection
    await loadMemes(false, categoryId);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadMemes(true, selectedCategory);
    }
  };

  const handleLike = (id: string) => {
    setMemes(prev => prev.map(meme => 
      meme.id === id 
        ? { ...meme, likes: meme.likes + 1 }
        : meme
    ));
  };

  const handleShare = (id: string) => {
    console.log('Sharing meme:', id);
    // Implement share functionality here
  };

  const handleComment = (id: string) => {
    console.log('Commenting on meme:', id);
    // Implement comment functionality here
  };

  if (loading && memes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={() => {}} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
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
            <MemeGrid
              memes={memes}
              onLike={handleLike}
              onShare={handleShare}
              onComment={handleComment}
              loading={loading}
              showLoadMore={true}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              layout="vertical"
            />
          </section>
        </div>

        {/* No memes found */}
        {!loading && memes.length === 0 && (
          <section className="text-center py-12">
            <div className="text-6xl mb-4">😢</div>
            <h3 className="text-xl font-semibold mb-2">No memes found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              {selectedCategory 
                ? `No memes found in the ${categories.find(cat => cat.id === selectedCategory)?.name} category yet.`
                : 'Looks like there are no memes yet. Be the first to upload something hilarious!'
              }
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
