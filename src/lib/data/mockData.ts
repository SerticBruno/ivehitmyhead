import { Meme, Category } from '../types/meme';

// Mock categories data
export const mockCategories: Category[] = [
  { id: '1', name: 'Programming', emoji: '💻', count: 15420, description: 'Code, bugs, and developer life' },
  { id: '2', name: 'Gaming', emoji: '🎮', count: 12340, description: 'Gaming memes and gamer culture' },
  { id: '3', name: 'Animals', emoji: '🐕', count: 9876, description: 'Funny animal moments' },
  { id: '4', name: 'Work', emoji: '💼', count: 8765, description: 'Office life and work struggles' },
  { id: '5', name: 'Coffee', emoji: '☕', count: 7654, description: 'Coffee addiction and morning struggles' },
  { id: '6', name: 'Monday', emoji: '😴', count: 6543, description: 'Monday blues and weekend withdrawal' },
  { id: '7', name: 'Debugging', emoji: '🐛', count: 5432, description: 'Debugging struggles and solutions' },
  { id: '8', name: 'Life', emoji: '🌟', count: 4321, description: 'Life moments and relatable situations' },
  { id: '9', name: 'Food', emoji: '🍕', count: 3456, description: 'Food memes and cooking disasters' },
  { id: '10', name: 'Sports', emoji: '⚽', count: 2345, description: 'Sports moments and athletic fails' },
  { id: '11', name: 'Music', emoji: '🎵', count: 1234, description: 'Music memes and concert moments' },
  { id: '12', name: 'Travel', emoji: '✈️', count: 987, description: 'Travel adventures and mishaps' }
];

// Mock memes data with categories
export const mockMemes: Meme[] = [
  {
    id: '1',
    title: 'When you finally fix that bug',
    imageUrl: '/images/memes/480957114_1169193674883095_8090972759647921580_n.jpg',
    author: 'CodeMaster',
    likes: 1234,
    comments: 56,
    shares: 23,
    createdAt: '2 hours ago',
    tags: ['programming', 'bugs', 'relief'],
    category: 'Programming'
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
    tags: ['monday', 'work', 'mood'],
    category: 'Monday'
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
    tags: ['coffee', 'life', 'addiction'],
    category: 'Coffee'
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
    tags: ['debugging', 'production', 'panic'],
    category: 'Debugging'
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
    tags: ['programming', 'debugging', 'funny'],
    category: 'Programming'
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
    tags: ['gaming', 'life', 'relatable'],
    category: 'Gaming'
  },
  {
    id: '7',
    title: 'Animal fails compilation',
    imageUrl: '/images/memes/475866307_10227739990630851_7466446956354749205_n.jpg',
    author: 'AnimalLover',
    likes: 2345,
    comments: 123,
    shares: 67,
    createdAt: '2 days ago',
    tags: ['animals', 'funny', 'fails'],
    category: 'Animals'
  },
  {
    id: '8',
    title: 'Work from home struggles',
    imageUrl: '/images/memes/475519798_499216039865627_6973489596584206514_n.jpg',
    author: 'RemoteWorker',
    likes: 987,
    comments: 45,
    shares: 23,
    createdAt: '2 days ago',
    tags: ['work', 'remote', 'struggles'],
    category: 'Work'
  },
  {
    id: '9',
    title: 'Coffee machine broken',
    imageUrl: '/images/memes/475221154_1018967710275617_644663250847847580_n.jpg',
    author: 'CoffeeAddict',
    likes: 1567,
    comments: 78,
    shares: 34,
    createdAt: '3 days ago',
    tags: ['coffee', 'broken', 'despair'],
    category: 'Coffee'
  },
  {
    id: '10',
    title: 'Monday motivation',
    imageUrl: '/images/memes/472430542_1126225565970074_979514438589799433_n.jpg',
    author: 'Motivator',
    likes: 876,
    comments: 34,
    shares: 12,
    createdAt: '3 days ago',
    tags: ['monday', 'motivation', 'work'],
    category: 'Monday'
  },
  {
    id: '11',
    title: 'Debugging at 3 AM',
    imageUrl: '/images/memes/473097286_9541662545852430_6677387785309997730_n.jpg',
    author: 'NightCoder',
    likes: 2341,
    comments: 89,
    shares: 45,
    createdAt: '4 days ago',
    tags: ['debugging', 'night', 'coding'],
    category: 'Debugging'
  },
  {
    id: '12',
    title: 'Life is like debugging',
    imageUrl: '/images/memes/449366591_8174517752559903_3811465733619302954_n.jpg',
    author: 'LifePhilosopher',
    likes: 3456,
    comments: 156,
    shares: 78,
    createdAt: '4 days ago',
    tags: ['life', 'debugging', 'philosophy'],
    category: 'Life'
  }
];

// Simulate API calls with pagination
export const fetchMemes = async (page: number = 1, limit: number = 12, category?: string): Promise<{ memes: Meme[], hasMore: boolean, total: number }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredMemes = mockMemes;
  if (category) {
    filteredMemes = mockMemes.filter(meme => meme.category === category);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMemes = filteredMemes.slice(startIndex, endIndex);
  
  return {
    memes: paginatedMemes,
    hasMore: endIndex < filteredMemes.length,
    total: filteredMemes.length
  };
};

export const fetchCategories = async (): Promise<Category[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCategories;
};

export const fetchCategoryById = async (id: string): Promise<Category | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockCategories.find(cat => cat.id === id) || null;
};
