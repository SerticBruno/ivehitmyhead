'use client';

import React, { useState } from 'react';
import { CategorySorting } from '@/components/ui';

export default function TestCategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Category Sorting Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original CategoriesSidebar */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Original CategoriesSidebar</h2>
            <CategorySorting
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>

          {/* Selected Category Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Selected Category</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              {selectedCategory ? (
                <div>
                  <p className="text-lg font-medium">Category ID: {selectedCategory}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    This category is selected. You can now use this ID to filter memes.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium">No category selected</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Select a category from the sidebar to see it here.
                  </p>
                </div>
              )}
            </div>

            {/* API Test Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">API Test</h3>
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/categories/sorted?sort_by=views&sort_order=desc&limit=5');
                      const data = await response.json();
                      console.log('Categories sorted by views:', data);
                      alert('Check console for results');
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Error occurred - check console');
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Test: Sort by Views (Top 5)
                </button>

                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/categories/sorted?sort_by=likes&sort_order=desc&limit=5');
                      const data = await response.json();
                      console.log('Categories sorted by likes:', data);
                      alert('Check console for results');
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Error occurred - check console');
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Test: Sort by Likes (Top 5)
                </button>

                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/categories/sorted?sort_by=memes_count&sort_order=desc&limit=5');
                      const data = await response.json();
                      console.log('Categories sorted by meme count:', data);
                      alert('Check console for results');
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Error occurred - check console');
                    }
                  }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Test: Sort by Meme Count (Top 5)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
