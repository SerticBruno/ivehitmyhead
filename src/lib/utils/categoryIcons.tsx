import React from 'react';
import { 
  Flower2,
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

/** Lucide icon component for this category name, or undefined if unmapped. */
export const getCategoryIcon = (
  categoryName: string,
): React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined =>
  resolveCategoryIcon(categoryName);

/**
 * Renders a Lucide icon for a category. Unmapped names use {@link FolderOpen}.
 * We intentionally do not render emoji anywhere in the app UI.
 */
export function renderCategoryIcon(
  categoryName: string,
  className = 'w-5 h-5',
): React.ReactNode {
  const IconComponent = resolveCategoryIcon(categoryName) ?? FolderOpen;
  return <IconComponent className={className} aria-hidden />;
}

// Export all icons for use in other components
export const ICONS = {
  Flower2,
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
