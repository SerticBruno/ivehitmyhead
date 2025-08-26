import React from 'react';
import { 
  Laugh, 
  Gamepad2, 
  Monitor, 
  Dog, 
  Film, 
  Trophy, 
  Pizza, 
  BookOpen, 
  Briefcase, 
  Dice5,
  Heart,
  Flame,
  Star,
  TrendingUp,
  Clock,
  Eye,
  ThumbsUp,
  Share2,
  User,
  Calendar,
  FolderOpen,
  MessageSquare,
  BookOpen as GitHub,
  ArrowRight,
  Upload,
  Moon,
  Image,
  AlertCircle
} from 'lucide-react';

// Map category names to Lucide React icons
export const CATEGORY_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // Common categories
  'Funny': Laugh,
  'Gaming': Gamepad2,
  'Tech': Monitor,
  'Technology': Monitor,
  'Animals': Dog,
  'Movies': Film,
  'Film': Film,
  'Sports': Trophy,
  'Food': Pizza,
  'School': BookOpen,
  'Education': BookOpen,
  'Work': Briefcase,
  'Business': Briefcase,
  'Random': Dice5,
  'Misc': Dice5,
  
  // Specific categories
  'classic': Star,
  'politics': Flame,
  'Political': Flame,
  'advanced': TrendingUp,
  'Trending': TrendingUp,
  'Popular': Heart,
  'Viral': TrendingUp,
  'New': Clock,
  'Recent': Clock,
  'Old': Calendar,
  'Vintage': Calendar,
  'Modern': TrendingUp,
  'Traditional': BookOpen,
  'Contemporary': TrendingUp,
  
  // Fallback mappings for common variations
  'funny': Laugh,
  'gaming': Gamepad2,
  'tech': Monitor,
  'technology': Monitor,
  'animals': Dog,
  'movies': Film,
  'film': Film,
  'sports': Trophy,
  'food': Pizza,
  'school': BookOpen,
  'education': BookOpen,
  'work': Briefcase,
  'business': Briefcase,
  'random': Dice5,
  'misc': Dice5,
};

// Fallback icon for unknown categories
export const DEFAULT_CATEGORY_ICON = Star;

// Function to get icon for a category
export const getCategoryIcon = (categoryName: string): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
  return CATEGORY_ICONS[categoryName] || DEFAULT_CATEGORY_ICON;
};

// Function to get icon for a category with fallback to emoji
export const getCategoryIconOrEmoji = (
  categoryName: string, 
  emoji?: string
): React.ReactNode => {
  const IconComponent = getCategoryIcon(categoryName);
  
  if (IconComponent) {
    return <IconComponent className="w-5 h-5" />;
  }
  
  // Fallback to emoji if no icon mapping exists
  return emoji || '📁';
};

// Export all icons for use in other components
export const ICONS = {
  Laugh,
  Gamepad2,
  Monitor,
  Dog,
  Film,
  Trophy,
  Pizza,
  BookOpen,
  Briefcase,
  Dice5,
  Heart,
  Flame,
  Star,
  TrendingUp,
  Clock,
  Eye,
  ThumbsUp,
  Share2,
  User,
  Calendar,
  FolderOpen,
  MessageSquare,
  GitHub,
  ArrowRight,
  Upload,
  Moon,
  Image,
  AlertCircle
};
