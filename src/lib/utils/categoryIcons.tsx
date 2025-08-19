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
  'Funny': Laugh,
  'Gaming': Gamepad2,
  'Tech': Monitor,
  'Animals': Dog,
  'Movies': Film,
  'Sports': Trophy,
  'Food': Pizza,
  'School': BookOpen,
  'Work': Briefcase,
  'Random': Dice5,
  // Add more mappings as needed
  'classic': Star,
  'politics': Flame,
  'advanced': TrendingUp,
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
