# Scroll Position and Meme State Preservation

This feature ensures that when users navigate away from the memes page (e.g., to view a meme detail) and then return using the browser's back button, they are restored to their exact previous position with all previously loaded memes intact.

## How It Works

### 1. State Preservation
- **Meme State**: The current list of loaded memes, current page, and pagination state are saved to `sessionStorage`
- **Scroll Position**: The current scroll position is saved to `sessionStorage`
- **Storage Key**: Unique keys are generated based on current filters (category, sort, time period)

### 2. Automatic Saving
- State is automatically saved when:
  - Memes are loaded or updated
  - User scrolls the page
  - User navigates away (beforeunload, pagehide events)
  - Component unmounts

### 3. Automatic Restoration
- State is automatically restored when:
  - User returns to the page via browser back/forward buttons
  - Component mounts and detects saved state
  - State is less than 30 minutes old (to prevent stale data)

### 4. Filter Change Handling
- When filters change (category, sort, time period), all saved states are cleared
- This ensures a clean start for new filter combinations
- User is scrolled to the top of the meme grid

## Technical Implementation

### Hooks Used
- `useMemes`: Enhanced with state preservation capabilities
- `useScrollRestoration`: Handles scroll position saving/restoration
- `useNavigationWarning`: Marks navigation as intentional

### Storage Structure
```javascript
// Meme state storage
sessionStorage.setItem('memes_state_all_created_at_desc_all_none', JSON.stringify({
  memes: [...],
  page: 2,
  hasMore: true,
  timestamp: 1234567890
}));

// Scroll position storage
sessionStorage.setItem('memes_page_all_newest_all_scroll', '1500');
```

### Key Features
- **Unique Storage Keys**: Each filter combination gets its own storage key
- **Timestamp Validation**: States older than 30 minutes are automatically cleared
- **Error Handling**: Corrupted states are safely removed
- **Performance**: Uses `requestAnimationFrame` for smooth scroll restoration
- **Browser Compatibility**: Works with all modern browsers

## User Experience

### Before (Without Preservation)
1. User loads 7 memes initially
2. User scrolls down and loads 5 more memes (total: 12)
3. User clicks on a meme to view details
4. User clicks browser back button
5. Page resets to initial state (7 memes, top of page)

### After (With Preservation)
1. User loads 7 memes initially
2. User scrolls down and loads 5 more memes (total: 12)
3. User clicks on a meme to view details
4. User clicks browser back button
5. Page restores to previous state (12 memes, same scroll position)

## Debugging

The feature includes console logging to help debug issues:

- 💾 **Saved memes state**: When meme state is saved
- 🔄 **Restoring memes state**: When meme state is restored
- 🗑️ **Clearing old memes state**: When expired state is removed
- 📍 **Saved scroll position**: When scroll position is saved
- 📍 **Restoring scroll position**: When scroll position is restored

## Configuration

### Storage Expiration
- Meme states expire after 30 minutes
- Scroll positions are kept indefinitely (until filter changes)

### Batch Sizes
- Initial load: 7 memes
- Load more: 5 memes per batch
- These can be adjusted in the respective components

## Limitations

- Only works within the same browser session
- States are cleared when filters change
- Requires JavaScript to be enabled
- May not work perfectly with very fast navigation
