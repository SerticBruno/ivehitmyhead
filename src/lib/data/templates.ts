/**
 * MEME TEMPLATES - SINGLE SOURCE OF TRUTH
 * 
 * This file contains all meme template definitions including:
 * - Template images
 * - Text field positions (x, y as percentages 0-100)
 * - Text field sizes (width, height as percentages 0-100)
 * - Font properties (size, family, color, stroke)
 * - Text alignment and styling
 * 
 * All templates used in the meme generator should be defined here.
 * To add a new template, add it to the MEME_TEMPLATES array below.
 */

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
        x: 14, // 10% from left
        y: 12, // 5% from top
        width: 35, // 35% of image width
        height: 20, // 20% of image height
        fontSize: 42, // Smaller font size (in pixels for base 600px height)
        color: '#ffffff',
        rotation: -13,
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 40, // 40% of image width
        strokeColor: '#000000',
        strokeWidth: 4
      },
      {
        id: 'top-right',
        x: 50, // 55% from left (right side)
        y: 7, // 5% from top
        width: 35, // 35% of image width
        height: 20, // 20% of image height
        fontSize: 42, // Smaller font size
        rotation: -11,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 40, // 40% of image width
        strokeColor: '#000000',
        strokeWidth: 4
      },
      {
        id: 'bottom',
        x: 40, // center horizontally
        y: 80, // 80% from top
        width: 80, // 80% of image width
        height: 15, // 15% of image height
        fontSize: 42, // Slightly larger for bottom text
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 80, // 80% of image width
        strokeColor: '#000000',
        strokeWidth: 4
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
        y: 90, // 85% from top
        width: 40, // 70% of image width
        height: 15, // 15% of image height
        fontSize: 42,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 80, // 80% of image width
        strokeColor: '#000000',
        strokeWidth: 6
      }
    ],
    tags: ['bernie', 'politics', 'single-text'],
    category: 'politics',
    difficulty: 'easy'
  },
  {
    id: 'transcendenace',
    name: 'Transcendenace Template',
    description: 'Template with four text areas for complex meme creation',
    src: '/images/templates/transcendenace.png',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 36,
    defaultColor: '#ffffff',
    textFields: [
      {
        id: 'top',
        x: 37, // center horizontally
        y: 12, // 15% from top
        width: 24, // 70% of image width
        height: 15, // 12% of image height
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 70, // 70% of image width
        strokeColor: '#000000',
        strokeWidth: 5
      },
      {
        id: 'middle-left',
        x: 37, // 20% from left
        y: 38, // 45% from top
        width: 24, // 25% of image width
        height: 15, // 15% of image height
        fontSize: 32,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'left',
        maxWidth: 70, // 25% of image width
        strokeColor: '#000000',
        strokeWidth: 4
      },
      {
        id: 'middle-right',
        x: 37, // 65% from left
        y: 63, // 45% from top
        width: 24, // 25% of image width
        height: 15, // 15% of image height
        fontSize: 32,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'right',
        maxWidth: 70, // 25% of image width
        strokeColor: '#000000',
        strokeWidth: 4
      },
      {
        id: 'bottom',
        x: 37, // center horizontally
        y: 87, // 80% from top
        width: 24, // 80% of image width
        height: 15, // 15% of image height
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 70, // 80% of image width
        strokeColor: '#000000',
        strokeWidth: 5
      }
    ],
    tags: ['complex', 'four-text', 'advanced'],
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
