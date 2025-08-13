# Categories Pages

This directory contains the categories functionality with infinite scroll for displaying memes.

## Pages

### `/categories` - Main Categories Page
- Displays all available meme categories in a grid layout
- Shows category emoji, name, description, and meme count
- Responsive grid (1-4 columns based on screen size)
- Platform statistics overview

### `/categories/[id]` - Individual Category Page
- Displays memes from a specific category
- **Vertical layout** with memes positioned one beneath the other
- **Infinite scroll** functionality for seamless loading
- Manual "Load More" button as fallback
- Category information header with emoji and description

## Features

### Infinite Scroll
- **Automatic loading** when user scrolls near the bottom
- **Intersection Observer** for efficient scroll detection
- **Loading states** with spinner and text
- **End of content** indicator when all memes are loaded

### Layout Options
- **Grid Layout**: Traditional grid for main pages (1-4 columns)
- **Vertical Layout**: List view for category pages (1 column)
- **Responsive Design**: Adapts to different screen sizes

### Data Management
- **Pagination**: Loads 12 memes per page
- **State Management**: Tracks loading, hasMore, and current page
- **Error Handling**: Graceful fallbacks for failed requests
- **Mock Data**: Simulated API calls with realistic delays

## Technical Implementation

### Hooks
- `useInfiniteScroll`: Custom hook for intersection observer logic
- Handles scroll detection and triggers loading callbacks

### Components
- `MemeGrid`: Flexible grid component with layout options
- `CategoryCard`: Individual category display component
- `MemeCard`: Meme display with consistent styling

### Data Flow
1. Category page loads category information
2. Initial memes are fetched (page 1)
3. User scrolls → intersection observer triggers
4. More memes are loaded and appended
5. Process continues until all memes are loaded

## Usage Examples

### Basic Category Page
```tsx
<MemeGrid
  memes={memes}
  onLike={handleLike}
  onShare={handleShare}
  onComment={handleComment}
  loading={loading}
  showLoadMore={true}
  onLoadMore={handleLoadMore}
  hasMore={hasMore}
  layout="vertical"
/>
```

### Infinite Scroll Setup
```tsx
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const handleLoadMore = () => {
  if (!loading && hasMore) {
    loadMemes(true);
  }
};
```

## Styling

### Vertical Layout
- **Card Spacing**: `space-y-4` for consistent vertical spacing
- **Card Height**: `h-48 sm:h-56` for optimal viewing
- **Hover Effects**: Smooth shadow transitions
- **Responsive**: Adapts to mobile and desktop

### Loading States
- **Skeleton Loading**: Placeholder cards during initial load
- **Spinner**: Animated loading indicator
- **Progress Text**: Clear loading messages

## Future Enhancements

- **Virtual Scrolling**: For very large meme collections
- **Search Within Categories**: Filter memes by tags or text
- **Category Subscriptions**: Follow specific categories
- **Advanced Filtering**: Sort by date, popularity, etc.
- **Keyboard Navigation**: Arrow keys for meme navigation
