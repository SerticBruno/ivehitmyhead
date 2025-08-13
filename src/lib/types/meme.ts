export interface Meme {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  tags?: string[];
  category?: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  count: number;
  description?: string;
}

export interface MemeCardProps {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  tags?: string[];
  category?: string;
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
  className?: string;
}

export interface MemeDetailProps {
  meme: Meme | null;
  isLoading?: boolean;
  transitionDirection?: 'left' | 'right' | null;
  onNavigate: (direction: 'prev' | 'next') => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onComment: (id: string) => void;
}

export interface MemeGridProps {
  memes: Omit<MemeCardProps, 'onLike' | 'onShare' | 'onComment'>[];
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
  className?: string;
  loading?: boolean;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}
