# Meme Components

This directory contains all meme-related components that follow a unified design system and support infinite scroll functionality.

## Components

### MemeCard
- Displays individual meme information in a card format
- Shows meme image, title, author, stats, and tags
- Includes category badge when available
- Handles click events to navigate to meme detail page
- Supports like, comment, and share actions

### MemeDetail
- Full-screen meme viewer with navigation controls
- Supports keyboard navigation (arrow keys, escape, Z for zoom)
- Image zoom functionality
- Integrated stats and action buttons
- Consistent design with other meme components

### MemeGrid
- Grid layout for displaying multiple memes
- Supports infinite scroll with intersection observer
- Loading states and empty states
- Responsive grid (1-4 columns based on screen size)
- Unified with infinite scroll hook

## Design System

All components follow a consistent design pattern:
- **Colors**: Consistent color scheme with dark mode support
- **Typography**: Unified font sizes and weights
- **Spacing**: Consistent padding and margins
- **Interactions**: Hover effects and transitions
- **Layout**: Responsive grid system

## Infinite Scroll

The infinite scroll functionality is implemented using:
- `useInfiniteScroll` hook for intersection observer logic
- Pagination support in data fetching
- Loading states for better UX
- Automatic detection of scroll position

## Types

All components use shared types from `@/lib/types/meme`:
- `Meme`: Core meme data structure
- `Category`: Category information
- `MemeCardProps`: Props for MemeCard component
- `MemeDetailProps`: Props for MemeDetail component
- `MemeGridProps`: Props for MemeGrid component

## Usage

```tsx
import { MemeGrid, MemeCard, MemeDetail } from '@/components/meme';

// Basic usage
<MemeGrid 
  memes={memes}
  onLike={handleLike}
  onShare={handleShare}
  onComment={handleComment}
  showLoadMore={true}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
/>

// With infinite scroll
<MemeGrid 
  memes={memes}
  loading={loading}
  showLoadMore={true}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
/>
```

## Data Flow

1. Components receive data through props
2. Actions (like, share, comment) are handled by parent components
3. Infinite scroll triggers data loading through callbacks
4. Loading states are managed at the component level
5. Error handling is implemented for failed requests

## Responsiveness

- Mobile-first design approach
- Grid adapts from 1 to 4 columns based on screen size
- Touch-friendly interactions on mobile devices
- Optimized image loading with Next.js Image component
