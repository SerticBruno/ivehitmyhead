import React from 'react';
import { 
  Flower2,
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
  AlertCircle,
  Joystick,
  Trash2,
  RefreshCw
} from 'lucide-react';

// Map category names to Lucide React icons
export const CATEGORY_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // Common categories
  'Wholesome': Flower2,
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
  'Gaming': Joystick,
  'Games': Joystick,
  
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
  'wholesome': Flower2,
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
  'gaming': Joystick,
  'games': Joystick,
};

// Fallback when no Lucide mapping exists (see getCategoryIcon)
export const DEFAULT_CATEGORY_ICON = Star;

function resolveCategoryIcon(
  categoryName: string,
): React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined {
  const trimmed = categoryName.trim();
  if (!trimmed) return undefined;
  const direct = CATEGORY_ICONS[trimmed];
  if (direct) return direct;
  const lower = trimmed.toLowerCase();
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (key.toLowerCase() === lower) {
      return CATEGORY_ICONS[key];
    }
  }
  return undefined;
}

/** Lucide icon for this category name, or undefined so callers can use DB emoji. */
export const getCategoryIcon = (
  categoryName: string,
): React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined =>
  resolveCategoryIcon(categoryName);

// Prefer Lucide when mapped; otherwise use emoji from Supabase; last resort folder emoji
export const getCategoryIconOrEmoji = (
  categoryName: string, 
  emoji?: string
): React.ReactNode => {
  const IconComponent = resolveCategoryIcon(categoryName);
  if (IconComponent) {
    return <IconComponent className="w-5 h-5" />;
  }
  return emoji?.trim() || '📁';
};

// Export all icons for use in other components
export const ICONS = {
  Flower2,
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
  AlertCircle,
  Joystick,
  Trash2,
  RefreshCw
};
