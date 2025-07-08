'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { MemeDetail } from '@/components/meme';

// Mock data - in a real app, this would come from an API
const mockMemes = [
  {
    id: '1',
    title: 'When you finally fix that bug',
    imageUrl: '/images/memes/480957114_1169193674883095_8090972759647921580_n.jpg',
    author: 'CodeMaster',
    likes: 1234,
    comments: 56,
    shares: 23,
    createdAt: '2 hours ago',
    tags: ['programming', 'bugs', 'relief']
  },
  {
    id: '2',
    title: 'Monday morning mood',
    imageUrl: '/images/memes/480787581_566108259796338_1662378605168267162_n.jpg',
    author: 'WeekendWarrior',
    likes: 856,
    comments: 34,
    shares: 12,
    createdAt: '4 hours ago',
    tags: ['monday', 'work', 'mood']
  },
  {
    id: '3',
    title: 'Coffee is life',
    imageUrl: '/images/memes/481693613_1167037158219367_4340552378064970754_n.jpg',
    author: 'CaffeineAddict',
    likes: 2341,
    comments: 89,
    shares: 45,
    createdAt: '6 hours ago',
    tags: ['coffee', 'life', 'addiction']
  },
  {
    id: '4',
    title: 'Debugging in production',
    imageUrl: '/images/memes/481081560_947604320823149_8918738186035253363_n.jpg',
    author: 'DevOpsGuru',
    likes: 567,
    comments: 23,
    shares: 8,
    createdAt: '8 hours ago',
    tags: ['debugging', 'production', 'panic']
  },
  {
    id: '5',
    title: 'The perfect debugging meme',
    imageUrl: '/images/memes/475860537_939831201626003_5967668030448102085_n.jpg',
    author: 'MemeMaster Pro',
    likes: 1892,
    comments: 67,
    shares: 34,
    createdAt: '1 day ago',
    tags: ['programming', 'debugging', 'funny']
  },
  {
    id: '6',
    title: 'Gaming life in a nutshell',
    imageUrl: '/images/memes/476970358_1149823343610296_9211814444182508066_n.jpg',
    author: 'FunnyGamer',
    likes: 1456,
    comments: 43,
    shares: 21,
    createdAt: '1 day ago',
    tags: ['gaming', 'life', 'relatable']
  }
];

// Simulate API call to fetch meme data
const fetchMemeData = async (memeId: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const meme = mockMemes.find(m => m.id === memeId);
  if (!meme) {
    throw new Error('Meme not found');
  }
  
  return meme;
};

export default function MemePage() {
  const router = useRouter();
  const params = useParams();
  const memeId = params.id as string;
  
  const [currentMeme, setCurrentMeme] = useState<typeof mockMemes[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right' | null>(null);

  // Initialize meme on first load
  useEffect(() => {
    if (memeId && !currentMeme) {
      const index = mockMemes.findIndex(m => m.id === memeId);
      if (index !== -1) {
        setCurrentMeme(mockMemes[index]);
        setCurrentIndex(index);
      }
    }
  }, [memeId, currentMeme]);

  // Handle URL changes for direct navigation (only on initial load or direct URL access)
  useEffect(() => {
    if (memeId && !currentMeme) {
      const index = mockMemes.findIndex(m => m.id === memeId);
      if (index !== -1) {
        setCurrentMeme(mockMemes[index]);
        setCurrentIndex(index);
      }
    }
  }, [memeId, currentMeme]);

  const handleMemeTransition = useCallback(async (newIndex: number, direction: 'left' | 'right') => {
    setIsLoading(true);
    setTransitionDirection(direction);
    
    try {
      // Fetch new meme data from API
      const newMeme = await fetchMemeData(mockMemes[newIndex].id);
      
      setCurrentMeme(newMeme);
      setCurrentIndex(newIndex);
      setIsLoading(false);
      setTransitionDirection(null);
      
      // Don't update URL - keep everything client-side
    } catch (error) {
      console.error('Failed to fetch meme:', error);
      setIsLoading(false);
      setTransitionDirection(null);
    }
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    let newIndex: number;
    let transitionDir: 'left' | 'right';

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : mockMemes.length - 1;
      transitionDir = 'left';
    } else {
      newIndex = currentIndex < mockMemes.length - 1 ? currentIndex + 1 : 0;
      transitionDir = 'right';
    }

    handleMemeTransition(newIndex, transitionDir);
  }, [currentIndex, handleMemeTransition]);

  const handleLike = (id: string) => {
    if (currentMeme) {
      setCurrentMeme(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
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

  // Show loading state if no meme is loaded
  if (!currentMeme) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
        <MemeDetail
          meme={currentMeme}
          isLoading={isLoading}
          transitionDirection={transitionDirection}
          onNavigate={handleNavigate}
          onLike={handleLike}
          onShare={handleShare}
          onComment={handleComment}
        />
      </main>
      <Footer />
    </div>
  );
} 