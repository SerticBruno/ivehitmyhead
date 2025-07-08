# IVEHITMYHEAD Component Library

This directory contains reusable components for the IVEHITMYHEAD meme page built with Next.js, TypeScript, and Tailwind CSS.

## Component Structure

```
src/components/
├── ui/                 # Base UI components
│   ├── Button.tsx     # Reusable button with variants
│   ├── Card.tsx       # Card components with header, content, footer
│   ├── Input.tsx      # Form input with validation
│   └── index.ts       # UI component exports
├── layout/            # Layout components
│   ├── Header.tsx     # Navigation header with search
│   ├── Footer.tsx     # Site footer
│   └── index.ts       # Layout component exports
├── meme/              # Meme-specific components
│   ├── MemeCard.tsx   # Individual meme display
│   ├── MemeGrid.tsx   # Grid layout for multiple memes
│   └── index.ts       # Meme component exports
└── README.md          # This documentation
```

## Usage Examples

### Basic Button Usage
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg">
  Click me
</Button>
```

### Meme Card Usage
```tsx
import { MemeCard } from '@/components/meme';

<MemeCard
  id="1"
  title="Funny Meme"
  imageUrl="/path/to/image.jpg"
  author="User123"
  likes={42}
  comments={5}
  shares={2}
  createdAt="2 hours ago"
  tags={['funny', 'viral']}
  onLike={(id) => console.log('Liked:', id)}
  onShare={(id) => console.log('Shared:', id)}
  onComment={(id) => console.log('Commented:', id)}
/>
```

### Meme Grid Usage
```tsx
import { MemeGrid } from '@/components/meme';

<MemeGrid
  memes={memeData}
  onLike={handleLike}
  onShare={handleShare}
  onComment={handleComment}
  loading={false}
/>
```

### Header with Search
```tsx
import { Header } from '@/components/layout';

<Header 
  onSearch={(query) => console.log('Search:', query)}
  showSearch={true}
/>
```

## Component Features

### Button Component
- **Variants**: primary, secondary, outline, ghost, danger
- **Sizes**: sm, md, lg
- **Features**: Fully accessible, hover states, focus management

### Card Component
- **Sub-components**: CardHeader, CardContent, CardFooter, CardTitle, CardDescription
- **Features**: Responsive design, dark mode support

### MemeCard Component
- **Features**: Like, share, comment functionality
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation

### MemeGrid Component
- **Features**: Loading states, empty states, responsive grid
- **Grid Layout**: 1 column on mobile, up to 4 columns on desktop

### Header Component
- **Features**: Search functionality, navigation links
- **Responsive**: Mobile-friendly design
- **Customizable**: Optional search bar

## Styling

All components use Tailwind CSS classes and support:
- **Dark mode**: Automatic dark mode support
- **Responsive design**: Mobile-first approach
- **Customization**: Accept className prop for additional styling
- **Consistent spacing**: Uses Tailwind's spacing scale

## TypeScript Support

All components are fully typed with TypeScript interfaces:
- Props interfaces for each component
- Proper event handling types
- Generic component types where applicable

## Best Practices

1. **Import from index files**: Use `@/components/ui` instead of individual files
2. **Consistent props**: Follow the established prop patterns
3. **Accessibility**: All components include proper ARIA attributes
4. **Performance**: Components use React.memo where beneficial
5. **Testing**: Components are designed to be easily testable

## Adding New Components

When adding new components:

1. Create the component in the appropriate directory
2. Add TypeScript interfaces for props
3. Include proper accessibility attributes
4. Add to the corresponding index.ts file
5. Update this README with usage examples
6. Test across different screen sizes and themes 