'use client';

import React, { useState } from 'react';
import { Header, Footer } from '@/components/layout';
import { MemeGrid } from '@/components/meme';
import { Button, Stats, Newsletter, FeaturedCreator, TrendingTags } from '@/components/ui';

// Mock data for demonstration
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

// Mock data for new components
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
  const [memes, setMemes] = useState(mockMemes);
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement search functionality here
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

  const handleTagClick = (tag: any) => {
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
            <Button size="lg" className="text-lg px-8">
              🎭 Browse Memes
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              📤 Upload Your Own
            </Button>
          </div>
        </section>

        {/* Featured Memes Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Memes</h2>
            <Button variant="ghost">
              View All →
            </Button>
          </div>
          
          <MemeGrid
            memes={memes}
            onLike={handleLike}
            onShare={handleShare}
            onComment={handleComment}
            loading={loading}
          />
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Programming', emoji: '💻', count: '1.2k' },
              { name: 'Gaming', emoji: '🎮', count: '856' },
              { name: 'Animals', emoji: '🐕', count: '2.1k' },
              { name: 'Work', emoji: '💼', count: '743' }
            ].map((category) => (
              <div
                key={category.name}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="text-3xl mb-2">{category.emoji}</div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} memes</p>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Platform Statistics</h2>
          <Stats stats={mockStats} />
        </section>

        {/* Trending Tags Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Trending Tags</h2>
          <TrendingTags 
            tags={mockTags} 
            onTagClick={handleTagClick}
            maxTags={8}
          />
        </section>

        {/* Featured Creators Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Creators</h2>
            <Button variant="ghost">
              View All Creators →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockCreators.map((creator) => (
              <FeaturedCreator
                key={creator.id}
                creator={creator}
                onFollow={handleFollowCreator}
                onViewProfile={handleViewCreatorProfile}
              />
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="mb-12">
          <Newsletter 
            title="Stay in the Loop!"
            description="Get notified about the latest memes, trending creators, and platform updates."
            showSocial={true}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
