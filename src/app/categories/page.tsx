'use client';

import React from 'react';
import { Header, Footer } from '@/components/layout';
import { CategoryCard } from '@/components/ui';
import { useCategories } from '@/lib/hooks/useCategories';
import { ICONS } from '@/lib/utils/categoryIcons';

export default function CategoriesPage() {
  const { categories, loading, error } = useCategories({ limit: 100 });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4 flex justify-center">
              <ICONS.Star className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Failed to load categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <section className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
              <ICONS.FolderOpen className="w-8 h-8 mr-2" />
              Meme Categories
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse memes by category and discover content that matches your interests
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
