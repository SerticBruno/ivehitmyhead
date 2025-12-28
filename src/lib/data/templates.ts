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
    name: 'AB',
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
        x: 7, // 10% from left
        y: 10, // 5% from top
        width: 35, // 35% of image width
        height: 35, // 20% of image height
        fontSize: 42, // Smaller font size (in pixels for base 600px height)
        color: '#ffffff',
        rotation: -13,
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 40, // 40% of image width
        strokeColor: '#000000',
        strokeWidth: 4
      },
      {
        id: 'top-right',
        x: 43, // 55% from left (right side)
        y: 6, // 5% from top
        width: 35, // 35% of image width
        height: 20, // 20% of image height
        fontSize: 42, // Smaller font size
        rotation: -11,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 40, // 40% of image width
        strokeColor: '#000000',
        strokeWidth: 4
      },
      {
        id: 'bottom',
        x: 35, // center horizontally
        y: 80, // 80% from top
        width: 35, // 80% of image width
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
    name: 'I\'m Once Again',
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
        x: 35, // center horizontally
        y: 85, // 85% from top
        width: 25, // 70% of image width
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
    name: 'Transcendenace',
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
        x: 2, // center horizontally
        y: 9, // 15% from top
        width: 45, // 70% of image width
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
        x: 2, // 20% from left
        y: 33, // 45% from top
        width: 45, // 25% of image width
        height: 15, // 15% of image height
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 70, // 25% of image width
        strokeColor: '#000000',
        strokeWidth: 4
      },
      {
        id: 'middle-right',
        x: 2, // 65% from left
        y: 57, // 45% from top
        width: 45, // 25% of image width
        height: 15, // 15% of image height
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 70, // 25% of image width
        strokeColor: '#000000',
        strokeWidth: 4
      },
      {
        id: 'bottom',
        x: 2, // center horizontally
        y: 82, // 80% from top
        width: 45, // 80% of image width
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
  },
  {
    id: 'hotlinebling',
    name: 'Hotline Bling',
    description: 'Drake Hotline Bling template with two text areas - left (disapproving) and right (approving)',
    src: '/images/templates/drakehotlinebling.png',
    width: 800,
    height: 600,
    defaultFont: 'Arial',
    defaultFontSize: 36,
    defaultColor: '#000000',
    textFields: [
      {
        id: 'left',
        x: 55, // 10% from left
        y: 20, // 20% from top
        width: 35, // 35% of image width
        height: 25, // 25% of image height
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 40, // 40% of image width
        strokeWidth: 0
      },
      {
        id: 'right',
        x: 55, // 55% from left (right side)
        y: 70, // 70% from top
        width: 35, // 35% of image width
        height: 25, // 25% of image height
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 40, // 40% of image width
        strokeWidth: 0
      }
    ],
    tags: ['drake', 'hotline-bling', 'two-text', 'arial-font'],
    category: 'classic',
    difficulty: 'easy'
  },
  {
    id: 'runningawayballoon',
    name: 'Running Away Balloon',
    description: 'Running Away Balloon template with five text areas using shadow effect',
    src: '/images/templates/runningawayballoon.png',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 36,
    defaultColor: '#ffffff',
    textFields: [
      {
        id: 'balloon1',
        x: 68, // 20% from left
        y: 13, // 15% from top
        width: 25, // 25% of image width
        height: 12, // 12% of image height
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 30, // 30% of image width
        useShadow: true,
        shadowColor: '#000000',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        strokeWidth: 0
      },
      {
        id: 'balloon2',
        x: 6, // 50% from left
        y: 31, // 25% from top
        width: 25, // 25% of image width
        height: 12, // 12% of image height
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 30, // 30% of image width
        useShadow: true,
        shadowColor: '#000000',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        strokeWidth: 0
      },
      {
        id: 'balloon3',
        x: 73, // 75% from left
        y: 60, // 40% from top
        width: 25, // 20% of image width
        height: 12, // 12% of image height
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 25, // 25% of image width
        useShadow: true,
        shadowColor: '#000000',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        strokeWidth: 0
      },
      {
        id: 'balloon4',
        x: 33, // 15% from left
        y: 74, // 60% from top
        width: 25, // 25% of image width
        height: 12, // 12% of image height
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 30, // 30% of image width
        useShadow: true,
        shadowColor: '#000000',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        strokeWidth: 0
      },
      {
        id: 'balloon5',
        x: 5, // 60% from left
        y: 80, // 75% from top
        width: 25, // 25% of image width
        height: 12, // 12% of image height
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 30, // 30% of image width
        useShadow: true,
        shadowColor: '#000000',
        shadowBlur: 8,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        strokeWidth: 0
      }
    ],
    tags: ['running-away', 'balloon', 'five-text', 'shadow', 'impact-font'],
    category: 'classic',
    difficulty: 'medium'
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
