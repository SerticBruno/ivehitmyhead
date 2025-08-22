'use client';

import React, { useState, useEffect } from 'react';
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';

interface ScrollRestorationDemoProps {
  pageKey: string;
}

export const ScrollRestorationDemo: React.FC<ScrollRestorationDemoProps> = ({ pageKey }) => {
  const [items, setItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Scroll restoration hook
  const { saveScrollState } = useScrollRestoration({
    pageKey,
    restoreInfiniteScroll: true,
    onRestoreInfiniteScroll: (state) => {
      console.log('🔄 Restoring scroll state:', state);
      // Here you would restore your infinite scroll data
      // For demo purposes, we'll just log it
    }
  });

  // Simulate loading more items
  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      const newItems = Array.from({ length: 10 }, (_, i) => items.length + i + 1);
      setItems(prev => [...prev, ...newItems]);
      setLoading(false);
      
      // Save scroll state with current data
      saveScrollState({
        page: Math.ceil(items.length / 10) + 1,
        loadedItems: items.length + newItems.length
      });
    }, 500);
  };

  // Load initial items
  useEffect(() => {
    const initialItems = Array.from({ length: 20 }, (_, i) => i + 1);
    setItems(initialItems);
    
    // Save initial state
    saveScrollState({
      page: 1,
      loadedItems: initialItems.length
    });
  }, [saveScrollState]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Scroll Restoration Demo</h2>
      <p className="text-gray-600 mb-4">
        Scroll down and click on an item, then use browser back button to return.
        Your scroll position should be restored!
      </p>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item}
            className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              // Simulate navigation to item detail
              window.history.pushState({}, '', `/item/${item}`);
              alert(`Clicked item ${item}. Now use browser back button to return!`);
            }}
          >
            <h3 className="font-semibold">Item {item}</h3>
            <p className="text-gray-600">This is item number {item}</p>
          </div>
        ))}
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading more items...</p>
          </div>
        )}
        
        {!loading && (
          <button
            onClick={loadMore}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load More Items
          </button>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Scroll down and load more items</li>
          <li>Click on any item to simulate navigation</li>
          <li>Use browser back button to return</li>
          <li>Your scroll position should be restored instantly!</li>
        </ol>
      </div>
    </div>
  );
};

export default function TestScrollPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Scroll Restoration Test</h1>
        <ScrollRestorationDemo pageKey="test-scroll-page" />
      </div>
    </div>
  );
}
