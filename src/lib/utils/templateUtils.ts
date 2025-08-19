import { MemeTemplate, TextField } from '../types/meme';

/**
 * Initialize text fields for a template with default values
 */
export const initializeTextFields = (template: MemeTemplate): TextField[] => {
  return template.textFields.map(field => ({
    ...field,
    text: '', // Start with empty text
    rotation: field.rotation || 0, // Ensure rotation is initialized
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
  
  // Calculate the actual bounds of the text field (center-based coordinates)
  // This aligns with the border and resize handle positioning
  const fieldLeft = fieldPixelPos.x - fieldPixelWidth / 2;
  const fieldTop = fieldPixelPos.y - fieldPixelHeight / 2;
  const fieldRight = fieldPixelPos.x + fieldPixelWidth / 2;
  const fieldBottom = fieldPixelPos.y + fieldPixelHeight / 2;
  
  // Check if point is within the field bounds plus buffer zone
  return (
    pointX >= fieldLeft - bufferZone &&
    pointX <= fieldRight + bufferZone &&
    pointY >= fieldTop - bufferZone &&
    pointY <= fieldBottom + bufferZone
  );
};

/**
 * Calculate adjusted Y position for text fields based on their location
 * This ensures consistent padding behavior across the canvas
 */
export const calculateAdjustedYPosition = (
  fieldY: number,
  textY: number,
  fieldHeight: number,
  padding: number
): number => {
  // Position text at the top of the textbox with top padding
  // textY represents the center of the textbox, so we go up by half the field height
  // to get to the top edge, then add padding to position text below the top edge
  // Bottom padding is handled in the main rendering logic
  return textY - (fieldHeight / 2) + padding;
};



/**
 * Render text on a canvas context with proper positioning and styling
 * This function can be used for both preview and download rendering
 */
export const renderTextOnCanvas = (
  ctx: CanvasRenderingContext2D,
  field: TextField,
  canvasWidth: number,
  canvasHeight: number,
  scale: number = 1
): void => {
  if (!field.text.trim()) return;

  const fontFamily = field.fontFamily || 'Impact';
  const fontWeight = field.fontWeight || 'bold';
  const letterSpacing = field.letterSpacing || '0.05em';
  ctx.font = `${fontWeight} ${field.fontSize * scale}px ${fontFamily}, Arial, sans-serif`;
  
  if (letterSpacing) {
    ctx.letterSpacing = letterSpacing;
  }
  
  ctx.fillStyle = field.color;
  ctx.strokeStyle = field.strokeColor || '#000000';
  ctx.lineWidth = (field.strokeWidth || 6) * scale;
  
  if (field.textAlign === 'left') {
    ctx.textAlign = 'left';
  } else if (field.textAlign === 'right') {
    ctx.textAlign = 'right';
  } else {
    ctx.textAlign = 'center';
  }
  ctx.textBaseline = 'top';

  // Convert percentage coordinates to pixel coordinates
  const textX = (field.x / 100) * canvasWidth;
  const textY = (field.y / 100) * canvasHeight;
  const textBoxWidth = (field.width / 100) * canvasWidth;
  
  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };
  
  const wrappedLines = wrapText(field.text, textBoxWidth);
  const lineHeight = (field.fontSize * scale) * 1.2;

  const padding = 16 * scale;
  
  // Calculate Y position with smart vertical centering
  const textBoxHeight = (field.height / 100) * canvasHeight;
  const totalTextHeight = wrappedLines.length * lineHeight;
  const availableHeight = textBoxHeight - (padding * 2); // Account for both top and bottom padding
  
  let startY: number;
  
  if (totalTextHeight <= availableHeight) {
    // If text fits within available height, center it vertically
    startY = textY - (totalTextHeight / 2);
  } else {
    // If text is too long, start from top with padding
    startY = textY - (textBoxHeight / 2) + padding;
  }
  
  let lineX = textX;
  
  if (field.textAlign === 'left') {
    lineX = textX - (textBoxWidth / 2) + padding;
  } else if (field.textAlign === 'right') {
    lineX = textX + (textBoxWidth / 2) - padding;
  } else {
    lineX = textX;
  }
  
  // Save the current context state
  ctx.save();
  
  // Apply rotation if specified
  if (field.rotation && field.rotation !== 0) {
    ctx.translate(textX, textY);
    ctx.rotate((field.rotation * Math.PI) / 180);
    ctx.translate(-textX, -textY);
  }
  
  wrappedLines.forEach((line, index) => {
    const lineY = startY + (index * lineHeight);
    ctx.strokeText(line, lineX, lineY);
    ctx.fillText(line, lineX, lineY);
  });
  
  // Restore the context state
  ctx.restore();
};

/**
 * Render text on a canvas context specifically for downloading
 * This function ensures 1:1 fidelity with the preview by using the same
 * percentage-based calculations but at full resolution
 */
export const renderTextForDownload = (
  ctx: CanvasRenderingContext2D,
  field: TextField,
  canvasWidth: number,
  canvasHeight: number
): void => {
  if (!field.text.trim()) return;

  const fontFamily = field.fontFamily || 'Impact';
  const fontWeight = field.fontWeight || 'bold';
  const letterSpacing = field.letterSpacing || '0.05em';
  
  // For download, we want to maintain the same relative font size as the preview
  // The fontSize field represents a percentage of the image height
  const fontSizeInPixels = (field.fontSize / 100) * canvasHeight;
  
  ctx.font = `${fontWeight} ${fontSizeInPixels}px ${fontFamily}, Arial, sans-serif`;
  
  if (letterSpacing) {
    ctx.letterSpacing = letterSpacing;
  }
  
  ctx.fillStyle = field.color;
  ctx.strokeStyle = field.strokeColor || '#000000';
  ctx.lineWidth = field.strokeWidth || 6;
  
  if (field.textAlign === 'left') {
    ctx.textAlign = 'left';
  } else if (field.textAlign === 'right') {
    ctx.textAlign = 'right';
  } else {
    ctx.textAlign = 'center';
  }
  ctx.textBaseline = 'top';

  // Convert percentage coordinates to pixel coordinates
  const textX = (field.x / 100) * canvasWidth;
  const textY = (field.y / 100) * canvasHeight;
  const textBoxWidth = (field.width / 100) * canvasWidth;
  
  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };
  
  const wrappedLines = wrapText(field.text, textBoxWidth);
  const lineHeight = fontSizeInPixels * 1.2;

  const padding = 16; // Fixed padding for download (no scaling)
  
  // Calculate Y position with smart vertical centering
  const textBoxHeight = (field.height / 100) * canvasHeight;
  const totalTextHeight = wrappedLines.length * lineHeight;
  const availableHeight = textBoxHeight - (padding * 2);
  
  let startY: number;
  
  if (totalTextHeight <= availableHeight) {
    // If text fits within available height, center it vertically
    startY = textY - (totalTextHeight / 2);
  } else {
    // If text is too long, start from top with padding
    startY = textY - (textBoxHeight / 2) + padding;
  }
  
  let lineX = textX;
  
  if (field.textAlign === 'left') {
    lineX = textX - (textBoxWidth / 2) + padding;
  } else if (field.textAlign === 'right') {
    lineX = textX + (textBoxWidth / 2) - padding;
  } else {
    lineX = textX;
  }
  
  // Save the current context state
  ctx.save();
  
  // Apply rotation if specified
  if (field.rotation && field.rotation !== 0) {
    ctx.translate(textX, textY);
    ctx.rotate((field.rotation * Math.PI) / 180);
    ctx.translate(-textX, -textY);
  }
  
  wrappedLines.forEach((line, index) => {
    const lineY = startY + (index * lineHeight);
    ctx.strokeText(line, lineX, lineY);
    ctx.fillText(line, lineX, lineY);
  });
  
  // Restore the context state
  ctx.restore();
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
  
  const handleSize = 32; // Increased size for easier grabbing
  const handleOffset = handleSize / 2;
  
  // Calculate handle positions using center-based coordinates (consistent with borders)
  const fieldLeft = fieldPixelPos.x - fieldPixelWidth / 2;
  const fieldTop = fieldPixelPos.y - fieldPixelHeight / 2;
  const fieldRight = fieldPixelPos.x + fieldPixelWidth / 2;
  const fieldBottom = fieldPixelPos.y + fieldPixelHeight / 2;
  
  // Calculate handle positions with bounds checking
  const nw = {
    x: Math.max(handleOffset, fieldLeft),
    y: Math.max(handleOffset, fieldTop)
  };
  const ne = {
    x: Math.min(canvasWidth - handleOffset, fieldRight),
    y: Math.max(handleOffset, fieldTop)
  };
  const sw = {
    x: Math.max(handleOffset, fieldLeft),
    y: Math.min(canvasHeight - handleOffset, fieldBottom)
  };
  const se = {
    x: Math.min(canvasWidth - handleOffset, fieldRight),
    y: Math.min(canvasHeight - handleOffset, fieldBottom)
  };
  
  // Check if point is within handle area with improved detection
  if (Math.abs(pointX - nw.x) <= handleOffset && Math.abs(pointY - nw.y) <= handleOffset) return 'nw';
  if (Math.abs(pointX - ne.x) <= handleOffset && Math.abs(pointY - ne.y) <= handleOffset) return 'ne';
  if (Math.abs(pointX - sw.x) <= handleOffset && Math.abs(pointY - sw.y) <= handleOffset) return 'sw';
  if (Math.abs(pointX - se.x) <= handleOffset && Math.abs(pointY - se.y) <= handleOffset) return 'se';
  
  return null;
};
