'use client';

import React, { Suspense } from 'react';
import { RandomFeedPanel } from './RandomFeedPanel';

export default function RandomPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ee] dark:bg-gray-950">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-sm font-bold uppercase tracking-wide text-gray-500">
              Loading feed…
            </div>
          }
        >
          <RandomFeedPanel />
        </Suspense>
      </main>
    </div>
  );
}
