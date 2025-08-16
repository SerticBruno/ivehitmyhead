export interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  created_at: string;
  count?: number; // For display purposes
}

export interface Meme {
  id: string;
  title: string;
  slug: string; // URL-friendly version of the title
  image_url: string;
  cloudinary_public_id: string;
  author_id: string;
  author?: User;
  category_id?: string;
  category?: Category;
  tags: string[];
  views: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean; // For current user
}

export interface MemeLike {
  id: string;
  meme_id: string;
  user_id: string;
  created_at: string;
}

export interface MemeComment {
  id: string;
  meme_id: string;
  author_id: string;
  author?: User;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  replies?: MemeComment[];
}

export interface MemeView {
  id: string;
  meme_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  viewed_at: string;
}

// Component Props
export interface MemeCardProps {
  meme: Meme;
  onLike?: (slug: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
  className?: string;
  isLiked?: boolean;
}

export interface MemeDetailProps {
  meme: Meme | null;
  isLoading?: boolean;
  transitionDirection?: 'left' | 'right' | null;
  onNavigate: (direction: 'prev' | 'next') => void;
  onLike: (slug: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
}

export interface MemeGridProps {
  memes: Meme[];
  onLike?: (slug: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
  className?: string;
  loading?: boolean;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  layout?: 'grid' | 'vertical';
  likedMemes?: Set<string>;
}

// API Types
export interface CreateMemeRequest {
  title: string;
  image: File;
  category_id?: string;
  tags?: string[];
}

export interface UpdateMemeRequest {
  title?: string;
  category_id?: string;
  tags?: string[];
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface TextField {
  id: string;
  text: string;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  width: number; // percentage of image width
  height: number; // percentage of image height
  fontSize: number; // percentage of image height
  color: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number; // percentage of image width
  strokeColor?: string; // outline color
  strokeWidth?: number; // outline width
  rotation?: number; // rotation in degrees
  letterSpacing?: string; // letter spacing (e.g., '0.05em')
  isDragging?: boolean;
  isResizing?: boolean;
}

export interface MemeTemplate {
  id: string;
  name: string;
  description?: string;
  src: string;
  width: number; // original image width
  height: number; // original image height
  textFields: Omit<TextField, 'text' | 'isDragging'>[];
  defaultFont?: string;
  defaultFontSize?: number;
  defaultColor?: string;
  tags?: string[];
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  templates: MemeTemplate[];
}
