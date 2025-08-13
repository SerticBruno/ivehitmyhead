# Meme Components

This directory contains all the components related to meme display and interaction.

## Components

### MemeCard
A single meme card component that displays meme information with like, share, and comment functionality.

### FeaturedMemeCard
A simplified meme card component specifically for featured memes. Shows only essential information:
- Title (with line clamping for long titles)
- Author
- Image (fixed height for consistency)
- No tags, categories, or interaction buttons
- Clean, minimal design

### MemeDetail
A detailed view component for individual memes with navigation between memes.

### MemeGrid
A grid layout component for displaying multiple memes with infinite scroll support.

### FeaturedMemes
A specialized component for displaying featured memes on the home page. Shows only the first 3 memes with:
- Clean, simplified design
- 3-column grid layout (1 column on mobile, 3 on tablet+)
- Uses FeaturedMemeCard for consistent styling
- No hover effects or extra decorations

## Usage

```tsx
import { MemeCard, FeaturedMemeCard, MemeDetail, MemeGrid, FeaturedMemes } from '@/components/meme';

// For featured memes (home page) - simplified display
<FeaturedMemes
  memes={memes}
  onLike={handleLike}
  onShare={handleShare}
  onComment={handleComment}
/>

// For individual featured meme cards
<FeaturedMemeCard
  {...meme}
  onLike={handleLike}
  onShare={handleShare}
  onComment={handleComment}
/>

// For full meme grids (memes page, categories) - full functionality
<MemeGrid
  memes={memes}
  onLike={handleLike}
  onShare={handleShare}
  onComment={handleComment}
  loading={loading}
  showLoadMore={true}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
/>
```

## Props

All components accept standard meme interaction handlers:
- `onLike`: Function called when meme is liked
- `onShare`: Function called when meme is shared  
- `onComment`: Function called when meme is commented on
