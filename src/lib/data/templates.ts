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
        width: 34.5, // 35% of image width
        height: 12.2, // 20% of image height
        fontSize: 42, // Smaller font size (in pixels for base 600px height)
        color: '#000000',
        rotation: -13,
        fontFamily: 'arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 40, // 40% of image width
        strokeColor: '#ffffff',
        strokeWidth: 0
      },
      {
        id: 'top-right',
        x: 41, // 55% from left (right side)
        y: 6, // 5% from top
        width: 35, // 35% of image width
        height: 10.4, // 20% of image height
        fontSize: 42, // Smaller font size
        rotation: -11,
        color: '#000000',
        fontFamily: 'arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 40, // 40% of image width
        strokeColor: '#000000',
        strokeWidth: 0
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
    description: 'Bernie Sanders — top setup and bottom caption',
    src: '/images/templates/imonceagain.png',
    width: 800,
    height: 600,
    defaultFont: 'Arial',
    defaultFontSize: 36,
    defaultColor: '#ffffff',
    allCaps: false,
    textFields: [
      {
        id: 'top',
        x: 3,
        y: 4,
        width: 36,
        height: 23,
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 36,
        strokeWidth: 0,
        allCaps: false,
      },
      {
        id: 'bottom',
        x: 10,
        y: 82,
        width: 82,
        height: 16,
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 92,
        strokeWidth: 0,
        allCaps: false,
      },
    ],
    tags: ['bernie', 'politics', 'two-text', 'arial-font'],
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
    description: 'Drake Hotline Bling — top panel (no) and bottom panel (yes)',
    src: '/images/templates/drakehotlinebling.png',
    width: 800,
    height: 600,
    defaultFont: 'Arial',
    defaultFontSize: 36,
    defaultColor: '#000000',
    textFields: [
      {
        id: 'left',
        x: 51.47,
        y: 1.47,
        width: 46.67,
        height: 47.33,
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 48,
        strokeWidth: 0,
      },
      {
        id: 'right',
        x: 50.67,
        y: 50.8,
        width: 47.6,
        height: 47.33,
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 49,
        strokeWidth: 0,
      },
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
  },
  {
    id: 'bike-fall',
    name: 'Bike Fall',
    description: 'Three-panel stick figure bike fall with top, middle, and bottom text',
    src: '/images/templates/bike-fall.png',
    width: 800,
    height: 600,
    defaultFont: 'Arial',
    defaultFontSize: 36,
    defaultColor: '#000000',
    textFields: [
      {
        id: 'top',
        x: 50.2,
        y: 9.85,
        width: 42,
        height: 26.03,
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 44,
        strokeWidth: 0,
      },
      {
        id: 'middle',
        x: 6.8,
        y: 41.18,
        width: 42,
        height: 26.91,
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 44,
        strokeWidth: 0,
      },
      {
        id: 'bottom',
        x: 49.2,
        y: 67.94,
        width: 42.8,
        height: 13.97,
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 45,
        strokeWidth: 0,
      },
    ],
    tags: ['bike', 'fall', 'three-text', 'arial-font'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'epic-handshake',
    name: 'Epic Handshake',
    description: 'Two sides agree on something in the middle — left label, shared agreement, right label',
    src: '/images/templates/epic-handshake.png',
    width: 800,
    height: 600,
    defaultFont: 'Arial',
    defaultFontSize: 36,
    defaultColor: '#ffffff',
    textFields: [
      {
        id: 'left',
        x: 7.16,
        y: 51.4,
        width: 29.94,
        height: 24,
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 32,
        strokeWidth: 0,
        rotation: 45,
      },
      {
        id: 'center',
        x: 23.35,
        y: 7.2,
        width: 29.94,
        height: 20,
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 32,
        strokeWidth: 0,
      },
      {
        id: 'right',
        x: 52.44,
        y: 45.4,
        width: 33.95,
        height: 24,
        fontSize: 36,
        color: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 36,
        strokeWidth: 0,
        rotation: 325,
      },
    ],
    tags: ['epic-handshake', 'three-text', 'arial-font'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'blank-nut-button',
    name: 'Blank Nut Button',
    description: 'Nut button meme with top caption and button text',
    src: '/images/templates/blank-nut-button.jpg',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 60,
    defaultColor: '#ffffff',
    textFields: [
      {
        id: 'top',
        x: 12,
        y: 12,
        width: 90,
        height: 22,
        fontSize: 60,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 92,
        strokeColor: '#000000',
        strokeWidth: 5,
      },
      {
        id: 'button',
        x: 0,
        y: 52,
        width: 56,
        height: 18,
        fontSize: 60,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 60,
        strokeColor: '#000000',
        strokeWidth: 5,
      },
    ],
    tags: ['nut-button', 'two-text', 'impact-font'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'goose-chase',
    name: 'Goose Chase',
    description: 'Two-panel template: smug goose on top, person chased by goose below',
    src: '/images/templates/goose-chase.png',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 40,
    defaultColor: '#ffffff',
    textFields: [
      {
        id: 'top',
        x: 60.2,
        y: 29.7,
        width: 39.8,
        height: 20.59,
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 42,
        strokeColor: '#000000',
        strokeWidth: 4,
      },
      {
        id: 'bottom',
        x: 0,
        y: 74.26,
        width: 37,
        height: 24.36,
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 40,
        strokeColor: '#000000',
        strokeWidth: 4,
      },
    ],
    tags: ['goose-chase', 'two-text', 'impact-font'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'is-this-a-pigeon',
    name: 'Is This a Pigeon?',
    description: 'Anime newbie mislabels a butterfly — label the person, the object, and the wrong take',
    src: '/images/templates/is-this-a-pigeon.jpg',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 38,
    defaultColor: '#ffffff',
    allCaps: true,
    textFields: [
      {
        id: 'person',
        x: 9.7,
        y: 9.26,
        width: 31.99,
        height: 22.02,
        fontSize: 38,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 34,
        strokeColor: '#000000',
        strokeWidth: 4,
        allCaps: true,
      },
      {
        id: 'butterfly',
        x: 59.95,
        y: 23.98,
        width: 38.04,
        height: 22.02,
        fontSize: 38,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 40,
        strokeColor: '#000000',
        strokeWidth: 4,
        allCaps: true,
      },
      {
        id: 'question',
        x: 22.17,
        y: 75.46,
        width: 56.05,
        height: 17.95,
        fontSize: 38,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 58,
        strokeColor: '#000000',
        strokeWidth: 4,
        allCaps: true,
      },
    ],
    tags: ['is-this-a-pigeon', 'anime', 'three-text', 'impact-font', 'all-caps'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'monkey-puppet',
    name: 'Monkey Puppet',
    description: 'Awkward side-eye vs. staring — two full-width caption strips',
    src: '/images/templates/monkey-puppet.png',
    width: 800,
    height: 600,
    defaultFont: 'Arial',
    defaultFontSize: 36,
    defaultColor: '#000000',
    textFields: [
      {
        id: 'top',
        x: 1.95,
        y: 2.47,
        width: 96.1,
        height: 21.88,
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 98,
        strokeWidth: 0,
      },
      {
        id: 'bottom',
        x: 1.95,
        y: 25.39,
        width: 95.99,
        height: 10.55,
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 98,
        strokeWidth: 0,
      },
    ],
    tags: ['monkey-puppet', 'awkward-monkey', 'two-text', 'arial-font'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'scooby-doo-mask-reveal',
    name: 'Scooby-Doo Mask Reveal',
    description: 'Four-panel unmasking — label each beat of the reveal',
    src: '/images/templates/scooby-doo-mask-reveal.png',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 34,
    defaultColor: '#ffffff',
    allCaps: true,
    textFields: [
      {
        id: 'panel-top-left',
        x: 1.8,
        y: 27.89,
        width: 43.2,
        height: 23.09,
        fontSize: 34,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 45,
        strokeColor: '#000000',
        strokeWidth: 4,
      },
      {
        id: 'panel-top-right',
        x: 53.6,
        y: 32.23,
        width: 44,
        height: 17.99,
        fontSize: 34,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 46,
        strokeColor: '#000000',
        strokeWidth: 4,
      },
      {
        id: 'panel-bottom-left',
        x: 1.8,
        y: 77.81,
        width: 44,
        height: 17.99,
        fontSize: 34,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 46,
        strokeColor: '#000000',
        strokeWidth: 4,
      },
      {
        id: 'panel-bottom-right',
        x: 53.8,
        y: 74.36,
        width: 44,
        height: 17.99,
        fontSize: 34,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 46,
        strokeColor: '#000000',
        strokeWidth: 4,
      },
    ],
    tags: ['scooby-doo', 'mask-reveal', 'four-text', 'impact-font', 'all-caps'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'sleeping-shaq',
    name: 'Sleeping Shaq',
    description: 'Peaceful sleep vs. the thing that isn’t — top and bottom captions',
    src: '/images/templates/sleeping-shaq.png',
    width: 800,
    height: 600,
    defaultFont: 'Arial',
    defaultFontSize: 36,
    defaultColor: '#000000',
    allCaps: false,
    textFields: [
      {
        id: 'top',
        x: 2.17,
        y: 2.2,
        width: 45.36,
        height: 49.2,
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 47,
        strokeWidth: 0,
        allCaps: false,
      },
      {
        id: 'bottom',
        x: 1.97,
        y: 54.6,
        width: 45.17,
        height: 43.2,
        fontSize: 36,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 47,
        strokeWidth: 0,
        allCaps: false,
      },
    ],
    tags: ['sleeping-shaq', 'two-text', 'arial-font'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'surprised-pikachu',
    name: 'Surprised Pikachu',
    description: 'Three stacked lines in the white strip above Pikachu',
    src: '/images/templates/surprised-pikachu.jpg',
    width: 800,
    height: 600,
    defaultFont: 'Arial',
    defaultFontSize: 34,
    defaultColor: '#000000',
    allCaps: false,
    textFields: [
      {
        id: 'setup-top',
        x: 1.85,
        y: 1.27,
        width: 96.2,
        height: 10.36,
        fontSize: 34,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 98,
        strokeWidth: 0,
        allCaps: false,
      },
      {
        id: 'setup-middle',
        x: 1.85,
        y: 11.63,
        width: 96.2,
        height: 11.42,
        fontSize: 34,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 98,
        strokeWidth: 0,
        allCaps: false,
      },
      {
        id: 'setup-bottom',
        x: 1.85,
        y: 23.05,
        width: 96.2,
        height: 13.11,
        fontSize: 34,
        color: '#000000',
        fontFamily: 'Arial',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 98,
        strokeWidth: 0,
        allCaps: false,
      },
    ],
    tags: ['surprised-pikachu', 'pokemon', 'three-text', 'arial-font'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'think-about-it',
    name: 'Think About It',
    description: 'Roll Safe / temple tap — matched top and bottom caption strips',
    src: '/images/templates/think-about-it.png',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 40,
    defaultColor: '#ffffff',
    allCaps: true,
    textFields: [
      {
        id: 'top',
        x: 2.64,
        y: 2.28,
        width: 95.16,
        height: 21.77,
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 97,
        strokeColor: '#000000',
        strokeWidth: 4,
        allCaps: true,
      },
      {
        id: 'bottom',
        x: 2.64,
        y: 74.43,
        width: 95.16,
        height: 21.52,
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 97,
        strokeColor: '#000000',
        strokeWidth: 4,
        allCaps: true,
      },
    ],
    tags: ['think-about-it', 'roll-safe', 'two-text', 'impact-font', 'all-caps'],
    category: 'classic',
    difficulty: 'easy',
  },
  {
    id: 'x-x-everywhere',
    name: 'X, X Everywhere',
    description: 'Toy Story eyes — matched top and bottom caption strips',
    src: '/images/templates/x-x-everywhere.png',
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 40,
    defaultColor: '#ffffff',
    allCaps: true,
    textFields: [
      {
        id: 'top',
        x: 2.25,
        y: 3.4,
        width: 95.17,
        height: 15.4,
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 97,
        strokeColor: '#000000',
        strokeWidth: 4,
        allCaps: true,
      },
      {
        id: 'bottom',
        x: 2.25,
        y: 74.4,
        width: 95.17,
        height: 22.4,
        fontSize: 40,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: 97,
        strokeColor: '#000000',
        strokeWidth: 4,
        allCaps: true,
      },
    ],
    tags: ['x-x-everywhere', 'toy-story', 'two-text', 'impact-font', 'all-caps'],
    category: 'classic',
    difficulty: 'easy',
  },
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

/**
 * User-uploaded image in the generator (not part of {@link MEME_TEMPLATES}).
 */
export const CUSTOM_PHOTO_TEMPLATE_ID = '__custom_photo__';

/**
 * Default text boxes for a custom upload: top center + bottom center, black text, white outline.
 */
export function createCustomPhotoMemeTemplate(imageObjectUrl: string): MemeTemplate {
  return {
    id: CUSTOM_PHOTO_TEMPLATE_ID,
    name: 'Custom photo',
    description: 'Your uploaded image',
    src: imageObjectUrl,
    width: 800,
    height: 600,
    defaultFont: 'Impact',
    defaultFontSize: 42,
    defaultColor: '#000000',
    textFields: [
      {
        id: 'custom-top',
        x: 5,
        y: 2,
        width: 90,
        height: 24,
        fontSize: 42,
        color: '#000000',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        strokeColor: '#ffffff',
        strokeWidth: 5,
      },
      {
        id: 'custom-bottom',
        x: 5,
        y: 74,
        width: 90,
        height: 24,
        fontSize: 42,
        color: '#000000',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center',
        strokeColor: '#ffffff',
        strokeWidth: 5,
      },
    ],
    tags: ['custom'],
    category: 'custom',
    difficulty: 'easy',
  };
}

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
