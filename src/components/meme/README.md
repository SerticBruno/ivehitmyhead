# Meme Display Components

## Overview

This directory contains components for displaying memes with intelligent handling of different image dimensions and responsive design.

## Components

### MemeDetail
The main component for displaying individual memes with full-screen viewing capabilities.

**Features:**
- **Responsive Image Container**: Automatically adjusts to image dimensions
- **Smart Scaling**: Calculates optimal container size based on aspect ratio
- **Zoom Functionality**: Click to zoom in/out for detailed viewing
- **Keyboard Navigation**: Arrow keys for navigation, Z for zoom, ESC to go back
- **Touch-Friendly**: Mobile-optimized with touch gestures

### ResponsiveImage
A utility component for handling images with different dimensions intelligently.

**Features:**
- **Automatic Dimension Detection**: Detects natural image dimensions on load
- **Aspect Ratio Preservation**: Maintains image proportions across screen sizes
- **Responsive Container**: Adjusts container size based on image and viewport
- **Loading States**: Smooth loading animations and skeleton placeholders
- **Accessibility**: Proper alt text and keyboard navigation support

## Image Handling Strategy

### Problem
Memes come in various dimensions:
- Landscape (16:9, 4:3, etc.)
- Portrait (3:4, 2:3, etc.)
- Square (1:1)
- Ultra-wide or tall formats

### Solution
1. **Dynamic Container Sizing**: Container dimensions calculated based on image aspect ratio
2. **Viewport-Aware Scaling**: Maximum dimensions respect screen size and user preferences
3. **Object-Fit Contain**: Images scale to fit container while preserving aspect ratio
4. **Responsive Breakpoints**: Different behavior on mobile vs desktop

### Implementation Details

```typescript
// Calculate optimal container dimensions
const getContainerDimensions = () => {
  const aspectRatio = imageDimensions.width / imageDimensions.height;
  const maxHeight = Math.min(window.innerHeight * 0.7, 800);
  const maxWidth = Math.min(window.innerWidth * 0.9, 1200);

  if (aspectRatio > 1) {
    // Landscape: constrain by height
    const height = Math.min(maxHeight, maxWidth / aspectRatio);
    return { width: `${height * aspectRatio}px`, height: `${height}px` };
  } else {
    // Portrait: constrain by width
    const width = Math.min(maxWidth, maxHeight * aspectRatio);
    return { width: `${width}px`, height: `${width / aspectRatio}px` };
  }
};
```

## Usage Examples

### Basic Meme Display
```tsx
<MemeDetail
  meme={memeData}
  onNavigate={handleNavigate}
  onLike={handleLike}
  onShare={handleShare}
  onComment={handleComment}
/>
```

### Custom Responsive Image
```tsx
<ResponsiveImage
  src="/path/to/meme.jpg"
  alt="Meme description"
  showZoomHint={true}
  onClick={handleZoom}
  onLoad={(dimensions) => console.log('Image loaded:', dimensions)}
/>
```

## Keyboard Shortcuts

- **← →**: Navigate between memes
- **Z**: Toggle zoom mode
- **ESC**: Exit zoom or go back to home

## Mobile Optimizations

- Touch-friendly navigation buttons
- Swipe gestures for navigation (future enhancement)
- Responsive button sizing
- Mobile-first design approach

## Performance Considerations

- **Lazy Loading**: Images load only when needed
- **Priority Loading**: Current meme loads with high priority
- **Optimized Transitions**: Smooth animations with reduced motion support
- **Memory Management**: Cleanup on component unmount

## Accessibility Features

- **Screen Reader Support**: Proper alt text and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast Support**: Enhanced visibility options
- **Reduced Motion**: Respects user motion preferences

## Future Enhancements

- **Image Preloading**: Preload next/previous memes
- **Virtual Scrolling**: For large meme collections
- **Advanced Zoom**: Pinch-to-zoom, pan, and rotate
- **Image Filters**: Basic image adjustments
- **Social Sharing**: Direct sharing to social platforms
