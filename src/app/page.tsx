'use client';

import React, { useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { FeaturedMemes } from '@/components/meme';
import { Button, Stats, Newsletter, FeaturedCreator, TrendingTags } from '@/components/ui';

import { useMemes } from '@/lib/hooks/useMemes';
import { useCategories } from '@/lib/hooks/useCategories';
import { useMemeInteractions } from '@/lib/hooks/useMemeInteractions';

// Mock data for components that don't have APIs yet
const mockStats = [
  { label: 'Total Memes', value: 12543, suffix: '+', icon: '🎭', color: 'text-blue-600' },
  { label: 'Active Users', value: 8921, suffix: '', icon: '👥', color: 'text-green-600' },
  { label: 'Total Likes', value: 456789, suffix: '', icon: '❤️', color: 'text-red-600' },
  { label: 'Daily Uploads', value: 234, suffix: '', icon: '📤', color: 'text-purple-600' }
];

const mockTags = [
  { id: '1', name: 'programming', count: 15420, trending: true },
  { id: '2', name: 'gaming', count: 12340 },
  { id: '3', name: 'animals', count: 9876 },
  { id: '4', name: 'work', count: 8765 },
  { id: '5', name: 'coffee', count: 7654 },
  { id: '6', name: 'monday', count: 6543 },
  { id: '7', name: 'debugging', count: 5432 },
  { id: '8', name: 'life', count: 4321 }
];

const mockCreators = [
  {
    id: '1',
    name: 'MemeMaster Pro',
    username: 'mememaster',
    avatar: '/images/memes/472430542_1126225565970074_979514438589799433_n.jpg',
    followers: 15420,
    totalMemes: 234,
    totalLikes: 45678,
    bestMeme: {
      id: 'best1',
      title: 'The perfect debugging meme',
      imageUrl: '/images/memes/475860537_939831201626003_5967668030448102085_n.jpg',
      likes: 1234
    },
    isFollowing: false
  },
  {
    id: '2',
    name: 'FunnyGamer',
    username: 'funnygamer',
    avatar: '/images/memes/473097286_9541662545852430_6677387785309997730_n.jpg',
    followers: 8921,
    totalMemes: 156,
    totalLikes: 23456,
    bestMeme: {
      id: 'best2',
      title: 'Gaming life in a nutshell',
      imageUrl: '/images/memes/476970358_1149823343610296_9211814444182508066_n.jpg',
      likes: 987
    },
    isFollowing: true
  }
];

export default function Home() {
  // Fetch real memes and categories - sorted by views for featured section
  const { memes, loading: memesLoading, error: memesError } = useMemes({ 
    limit: 6, 
    sort_by: 'views', 
    sort_order: 'desc'
  });
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { likeMeme } = useMemeInteractions();
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [localMemes, setLocalMemes] = useState<typeof memes>([]);

  // Initialize local memes when memes change from the hook
  React.useEffect(() => {
    setLocalMemes(memes);
  }, [memes]);

  // Use local memes if available, otherwise use memes from the hook
  const displayMemes = localMemes.length > 0 ? localMemes : memes;

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search functionality here
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
      const updatedMemes = localMemes.map(meme => {
        if (meme.slug === slug) {
          return {
            ...meme,
            likes_count: isLiked ? meme.likes_count + 1 : Math.max(0, meme.likes_count - 1)
          };
        }
        return meme;
      });
      
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

  const handleTagClick = (tag: { id: string; name: string; count: number; trending?: boolean }) => {
    console.log('Tag clicked:', tag);
    // Implement tag filtering functionality here
  };

  const handleFollowCreator = (creatorId: string) => {
    console.log('Following creator:', creatorId);
    // Implement follow functionality here
  };

  const handleViewCreatorProfile = (creatorId: string) => {
    console.log('Viewing creator profile:', creatorId);
    // Implement profile navigation here
  };

  // Show loading state while fetching data
  if (memesLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={handleSearch} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold mb-2">Loading...</h2>
            <p className="text-gray-600 dark:text-gray-400">Fetching the most viewed memes</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state if there's an issue
  if (memesError || categoriesError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header onSearch={handleSearch} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-4xl mb-4">😢</div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {memesError || categoriesError}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to <span className="text-blue-600">IVEHITMYHEAD</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover, share, and create the funniest memes on the internet. 
            Join our community of meme enthusiasts!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" onClick={() => window.location.href = '/memes'}>
              🎭 Browse Memes
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" onClick={() => window.location.href = '/upload'}>
              📤 Upload Your Own
            </Button>
          </div>
        </section>

        {/* Most Viewed Memes Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Most Viewed Memes</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                The memes that everyone is talking about
              </p>
            </div>
            <Button variant="ghost" onClick={() => window.location.href = '/memes'}>
              View All →
            </Button>
          </div>
          
          {displayMemes.length > 0 ? (
            <FeaturedMemes
              memes={displayMemes}
              onLike={handleLike}
              onShare={handleShare}
              onComment={handleComment}
              likedMemes={likedMemes}
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😢</div>
              <h3 className="text-xl font-semibold mb-2">No memes yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Be the first to upload a meme!
              </p>
              <Button onClick={() => window.location.href = '/upload'}>
                Upload First Meme
              </Button>
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}
