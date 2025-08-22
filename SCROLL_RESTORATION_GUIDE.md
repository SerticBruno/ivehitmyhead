# Scroll Restoration Guide for Next.js Infinite Scroll

This guide explains how to implement the 9gag-style scroll restoration where users return to their exact scroll position after navigating back from a meme detail page.

## What We're Building

The behavior you described from 9gag:
- User scrolls through infinite feed
- User clicks on a meme to view details
- User clicks browser back button
- User returns to the exact same scroll position instantly
- No loading states, no jumping around

## How It Works

### 1. Scroll Position Tracking
- **Automatic tracking**: Scroll position is saved on every scroll event (debounced)
- **Navigation events**: Position is saved before navigation (beforeunload, visibilitychange)
- **State persistence**: Uses `sessionStorage` to persist across browser sessions

### 2. Infinite Scroll State Restoration
- **Page tracking**: Remembers which page of infinite scroll data was loaded
- **Item count**: Tracks how many items were loaded
- **Smart restoration**: Only restores recent data (within 30 minutes)

### 3. Instant Restoration
- **No API calls**: Position is restored immediately from memory
- **Smooth experience**: User lands exactly where they left off
- **Performance optimized**: Uses `requestAnimationFrame` for smooth scrolling

## Implementation Steps

### Step 1: Install the Hook

The `useScrollRestoration` hook is already created in `src/lib/hooks/useScrollRestoration.ts`.

### Step 2: Basic Usage in Your Memes Page

```tsx
import { useScrollRestoration } from '@/lib/hooks/useScrollRestoration';

export default function MemesPage() {
  // Your existing state and hooks...
  
  // Add scroll restoration
  const { saveScrollState } = useScrollRestoration({
    pageKey: `memes-${selectedCategory}-${selectedFilter}-${selectedTimePeriod}`,
    restoreInfiniteScroll: true,
    onRestoreInfiniteScroll: (state) => {
      // This callback runs when returning to the page
      console.log('Restoring state:', state);
      // You can restore your infinite scroll data here
    }
  });

  // Save scroll state when memes change
  useEffect(() => {
    if (memes.length > 0) {
      saveScrollState({
        page: Math.ceil(memes.length / 7), // Assuming 7 items per page
        loadedItems: memes.length
      });
    }
  }, [memes, saveScrollState]);

  // ... rest of your component
}
```

### Step 3: Enhanced Integration with Your Existing Code

For better integration with your current setup, you can enhance the `useMemes` hook:

```tsx
// In useMemes.ts
export const useMemes = (options: UseMemesOptions = {}): UseMemesReturn => {
  // ... existing code ...

  const saveScrollState = useCallback((scrollData: any) => {
    // This will be called from the parent component
    if (typeof window !== 'undefined') {
      const key = `memes-${options.category_id || 'all'}-${options.sort_by}-${options.time_period || 'all'}`;
      sessionStorage.setItem(`infinite_${key}`, JSON.stringify({
        page,
        loadedItems: memes.length,
        scrollPosition: window.scrollY,
        timestamp: Date.now()
      }));
    }
  }, [page, memes.length, options.category_id, options.sort_by, options.time_period]);

  return {
    memes,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    saveScrollState // Add this to the return object
  };
};
```

### Step 4: Advanced State Restoration

For complete state restoration, you might want to implement data preloading:

```tsx
const onRestoreInfiniteScroll = useCallback((state: InfiniteScrollState) => {
  if (state.loadedItems > 0 && state.loadedItems > memes.length) {
    // We need to load more data to restore the previous state
    const pagesToLoad = Math.ceil(state.loadedItems / 7) - 1;
    
    // Load all the data that was previously loaded
    for (let i = 0; i < pagesToLoad; i++) {
      loadMore();
    }
  }
}, [memes.length, loadMore]);
```

## Key Features

### 1. Automatic Cleanup
- Old scroll data is automatically cleaned up after 1 hour
- Prevents memory leaks and stale data

### 2. Debounced Saving
- Scroll position is saved with a 100ms debounce
- Prevents excessive storage writes during fast scrolling

### 3. Smart Key Generation
- Each page/filter combination gets a unique key
- Ensures different views don't interfere with each other

### 4. Error Handling
- Gracefully handles corrupted storage data
- Falls back gracefully if restoration fails

## Testing the Implementation

### 1. Basic Test
1. Navigate to `/test-scroll` to see the demo
2. Scroll down and load more items
3. Click on an item to simulate navigation
4. Use browser back button
5. Verify scroll position is restored

### 2. Integration Test
1. Go to your memes page
2. Scroll down and apply filters
3. Click on a meme to view details
4. Use browser back button
5. Verify you return to the exact same position

## Troubleshooting

### Common Issues

1. **Scroll position not restored**
   - Check browser console for errors
   - Verify `sessionStorage` is working
   - Ensure the hook is mounted before navigation

2. **Infinite scroll state not restored**
   - Check the `onRestoreInfiniteScroll` callback
   - Verify the data structure matches
   - Check if the callback is being called

3. **Performance issues**
   - Reduce debounce time if needed
   - Check if too many scroll events are firing
   - Verify cleanup is working properly

### Debug Mode

Add this to see what's happening:

```tsx
const { saveScrollState, restoreScrollState, getPageKey } = useScrollRestoration({
  pageKey: 'your-key',
  restoreInfiniteScroll: true,
  onRestoreInfiniteScroll: (state) => {
    console.log('🔄 Restoring scroll state:', state);
  }
});

// Add this to see when scroll state is saved
useEffect(() => {
  console.log('🔑 Current page key:', getPageKey());
}, [getPageKey]);
```

## Browser Compatibility

- **Modern browsers**: Full support
- **Mobile browsers**: Works on iOS Safari, Chrome Mobile
- **Older browsers**: Graceful degradation (scroll position may not be restored)

## Performance Considerations

- **Storage size**: Each page state uses ~200 bytes
- **Scroll events**: Debounced to prevent excessive calls
- **Memory usage**: Minimal impact, automatic cleanup
- **Network**: No additional API calls during restoration

## Next Steps

1. **Test the basic implementation** with the demo page
2. **Integrate with your memes page** following the examples
3. **Customize the restoration logic** for your specific needs
4. **Add advanced features** like data preloading if needed

## Advanced Features You Can Add

1. **Data preloading**: Preload memes that were previously loaded
2. **Scroll animation**: Smooth scroll to restored position
3. **State persistence**: Save across browser sessions
4. **Analytics**: Track scroll restoration success rates
5. **Fallback handling**: Graceful degradation for edge cases

This implementation gives you the exact behavior you described from 9gag - instant scroll position restoration with no loading states!
