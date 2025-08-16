import { MemeTemplate, TextField } from '../types/meme';

/**
 * Initialize text fields for a template with default values
 */
export const initializeTextFields = (template: MemeTemplate): TextField[] => {
  return template.textFields.map(field => ({
    ...field,
    text: '', // Start with empty text
    isDragging: false,
    isResizing: false
  }));
};

/**
 * Calculate font size in pixels based on percentage and canvas height
 */
export const calculateFontSize = (fontSizePercent: number, canvasHeight: number): number => {
  return (fontSizePercent / 100) * canvasHeight;
};

/**
 * Convert percentage coordinates to pixel coordinates
 */
export const percentageToPixels = (
  percentageX: number, 
  percentageY: number, 
  canvasWidth: number, 
  canvasHeight: number
): { x: number; y: number } => {
  return {
    x: (percentageX / 100) * canvasWidth,
    y: (percentageY / 100) * canvasHeight
  };
};

/**
 * Convert pixel coordinates to percentage coordinates
 */
export const pixelsToPercentage = (
  pixelX: number, 
  pixelY: number, 
  canvasWidth: number, 
  canvasHeight: number
): { x: number; y: number } => {
  return {
    x: (pixelX / canvasWidth) * 100,
    y: (pixelY / canvasHeight) * 100
  };
};

/**
 * Get default values for a template
 */
export const getTemplateDefaults = (template: MemeTemplate) => {
  return {
    font: template.defaultFont || 'Impact',
    fontSize: template.defaultFontSize || 6,
    color: template.defaultColor || '#ffffff'
  };
};

/**
 * Validate template data structure
 */
export const validateTemplate = (template: MemeTemplate): boolean => {
  if (!template.id || !template.name || !template.src) {
    return false;
  }
  
  if (!template.textFields || template.textFields.length === 0) {
    return false;
  }
  
  // Validate each text field
  for (const field of template.textFields) {
    if (!field.id || typeof field.x !== 'number' || typeof field.y !== 'number') {
      return false;
    }
    
    // Ensure coordinates are within bounds (0-100)
    if (field.x < 0 || field.x > 100 || field.y < 0 || field.y > 100) {
      return false;
    }
  }
  
  return true;
};

/**
 * Get recommended text for a template based on its structure
 */
export const getTemplateSuggestions = (template: MemeTemplate): Record<string, string> => {
  const suggestions: Record<string, string> = {};
  
  template.textFields.forEach(field => {
    switch (field.id) {
      case 'top':
        suggestions[field.id] = 'Top text here';
        break;
      case 'top-left':
        suggestions[field.id] = 'Top left text here';
        break;
      case 'top-right':
        suggestions[field.id] = 'Top right text here';
        break;
      case 'bottom':
        suggestions[field.id] = 'Bottom text here';
        break;
      case 'title':
        suggestions[field.id] = 'Title text';
        break;
      case 'left-text':
        suggestions[field.id] = 'Left side text';
        break;
      case 'right-text':
        suggestions[field.id] = 'Right side text';
        break;
      default:
        suggestions[field.id] = `${field.id} text`;
    }
  });
  
  return suggestions;
};

/**
 * Calculate text positioning for different text alignments
 */
export const calculateTextPosition = (
  field: TextField,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number; textAlign: CanvasTextAlign } => {
  const pixelPos = percentageToPixels(field.x, field.y, canvasWidth, canvasHeight);
  
  let textAlign: CanvasTextAlign = 'left';
  const adjustedX = pixelPos.x;
  
  if (field.textAlign === 'center') {
    textAlign = 'center';
    // No adjustment needed for center alignment
  } else if (field.textAlign === 'right') {
    textAlign = 'right';
    // No adjustment needed for right alignment
  } else {
    // Left alignment - no adjustment needed
  }
  
  return {
    x: adjustedX,
    y: pixelPos.y,
    textAlign
  };
};

/**
 * Check if a point is within a text field's bounds (including buffer zone)
 */
export const isPointInTextField = (
  pointX: number,
  pointY: number,
  field: TextField,
  canvasWidth: number,
  canvasHeight: number,
  bufferZone: number = 20 // Buffer zone in pixels around the field
): boolean => {
  const fieldPixelPos = percentageToPixels(field.x, field.y, canvasWidth, canvasHeight);
  const fieldPixelWidth = (field.width / 100) * canvasWidth;
  const fieldPixelHeight = (field.height / 100) * canvasHeight;
  
  // Add buffer zone around the field
  const bufferedWidth = fieldPixelWidth + (bufferZone * 2);
  const bufferedHeight = fieldPixelHeight + (bufferZone * 2);
  
  return (
    pointX >= fieldPixelPos.x - bufferedWidth / 2 &&
    pointX <= fieldPixelPos.x + bufferedWidth / 2 &&
    pointY >= fieldPixelPos.y - bufferedHeight / 2 &&
    pointY <= fieldPixelPos.y + bufferedHeight / 2
  );
};

/**
 * Check if a point is near a resize handle
 */
export const getResizeHandle = (
  pointX: number,
  pointY: number,
  field: TextField,
  canvasWidth: number,
  canvasHeight: number
): 'nw' | 'ne' | 'sw' | 'se' | null => {
  const fieldPixelPos = percentageToPixels(field.x, field.y, canvasWidth, canvasHeight);
  const fieldPixelWidth = (field.width / 100) * canvasWidth;
  const fieldPixelHeight = (field.height / 100) * canvasHeight;
  
  const handleSize = 16; // Increased size for easier grabbing
  
  // Check each corner with extended handle areas
  const nw = {
    x: fieldPixelPos.x - fieldPixelWidth / 2,
    y: fieldPixelPos.y - fieldPixelHeight / 2
  };
  const ne = {
    x: fieldPixelPos.x + fieldPixelWidth / 2,
    y: fieldPixelPos.y - fieldPixelHeight / 2
  };
  const sw = {
    x: fieldPixelPos.x - fieldPixelWidth / 2,
    y: fieldPixelPos.y + fieldPixelHeight / 2
  };
  const se = {
    x: fieldPixelPos.x + fieldPixelWidth / 2,
    y: fieldPixelPos.y + fieldPixelHeight / 2
  };
  
  // Check if point is within handle area (extended for easier grabbing)
  if (Math.abs(pointX - nw.x) <= handleSize && Math.abs(pointY - nw.y) <= handleSize) return 'nw';
  if (Math.abs(pointX - ne.x) <= handleSize && Math.abs(pointY - ne.y) <= handleSize) return 'ne';
  if (Math.abs(pointX - sw.x) <= handleSize && Math.abs(pointY - sw.y) <= handleSize) return 'sw';
  if (Math.abs(pointX - se.x) <= handleSize && Math.abs(pointY - se.y) <= handleSize) return 'se';
  
  return null;
};
