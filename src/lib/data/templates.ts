import { MemeTemplate, TemplateCategory } from '../types/meme';

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'ab',
    name: 'AB Template',
    description: 'Classic three-text meme template with top left, top right, and bottom text areas',
    src: '/images/templates/ab.png',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 40, // 6% of image height
    defaultColor: '#ffffff',
    textFields: [
      {
        id: 'top-left',
        x: 40, // 25% from left
        y: 20, // 20% from top
        width: 35, // 35% of image width
        height: 15, // 15% of image height
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 40, // 40% of image width
        strokeColor: '#000000',
        strokeWidth: 2
      },
      {
        id: 'top-right',
        x: 75, // 75% from left
        y: 20, // 20% from top
        width: 35, // 35% of image width
        height: 15, // 15% of image height
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 40, // 40% of image width
        strokeColor: '#000000',
        strokeWidth: 2
      },
      {
        id: 'bottom',
        x: 50, // center horizontally
        y: 80, // 80% from top
        width: 70, // 70% of image width
        height: 15, // 15% of image height
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 80, // 80% of image width
        strokeColor: '#000000',
        strokeWidth: 2
      }
    ],
    tags: ['classic', 'three-text', 'impact-font'],
    category: 'classic',
    difficulty: 'medium'
  },
  {
    id: 'imonceagain',
    name: 'I\'m Once Again Template',
    description: 'Bernie Sanders template with bottom text area only',
    src: '/images/templates/imonceagain.png',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 40, // 7% of image height
    defaultColor: '#ffffff',
    textFields: [
      {
        id: 'bottom',
        x: 50, // center horizontally
        y: 85, // 85% from top
        width: 70, // 70% of image width
        height: 15, // 15% of image height
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 80, // 80% of image width
        strokeColor: '#000000',
        strokeWidth: 2
      }
    ],
    tags: ['bernie', 'politics', 'single-text'],
    category: 'politics',
    difficulty: 'easy'
  },
  // Example of a more complex template with multiple text fields
  {
    id: 'complex-example',
    name: 'Complex Multi-Text Template',
    description: 'Example template showing advanced text positioning',
    src: '/images/templates/complex-example.png', // You'd need to add this image
    width: 800,
    height: 600,
    defaultFont: 'Arial',
    defaultFontSize: 40,
    defaultColor: '#ffffff',
    textFields: [
      {
        id: 'title',
        x: 50,
        y: 10,
        width: 80, // 80% of image width
        height: 12, // 12% of image height
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 90,
        strokeColor: '#000000',
        strokeWidth: 3
      },
      {
        id: 'left-text',
        x: 20,
        y: 50,
        width: 30, // 30% of image width
        height: 20, // 20% of image height
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal',
        textAlign: 'left',
        maxWidth: 35,
        strokeColor: '#000000',
        strokeWidth: 1
      },
      {
        id: 'right-text',
        x: 80,
        y: 50,
        width: 30, // 30% of image width
        height: 20, // 20% of image height
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'normal',
        textAlign: 'right',
        maxWidth: 35,
        strokeColor: '#000000',
        strokeWidth: 1
      },
      {
        id: 'bottom-note',
        x: 50,
        y: 90,
        width: 50, // 50% of image width
        height: 10, // 10% of image height
        fontSize: 40,
        color: '#ffff00',
        fontFamily: 'Comic Sans MS',
        fontWeight: 'normal',
        textAlign: 'center',
        maxWidth: 60,
        rotation: 5 // slight rotation for style
      }
    ],
    tags: ['complex', 'multi-text', 'advanced'],
    category: 'advanced',
    difficulty: 'hard'
  }
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: 'classic',
    name: 'Classic Memes',
    description: 'Timeless meme templates that never get old',
    templates: MEME_TEMPLATES.filter(t => t.category === 'classic')
  },
  {
    id: 'politics',
    name: 'Political Memes',
    description: 'Templates perfect for political humor',
    templates: MEME_TEMPLATES.filter(t => t.category === 'politics')
  },
  {
    id: 'advanced',
    name: 'Advanced Templates',
    description: 'Complex templates with multiple text areas and effects',
    templates: MEME_TEMPLATES.filter(t => t.category === 'advanced')
  }
];

// Helper function to get template by ID
export const getTemplateById = (id: string): MemeTemplate | undefined => {
  return MEME_TEMPLATES.find(template => template.id === id);
};

// Helper function to get templates by category
export const getTemplatesByCategory = (categoryId: string): MemeTemplate[] => {
  return MEME_TEMPLATES.filter(template => template.category === categoryId);
};

// Helper function to get all categories
export const getAllCategories = (): TemplateCategory[] => {
  return TEMPLATE_CATEGORIES;
};
