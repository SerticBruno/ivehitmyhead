'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MemeTemplate, TextField } from '../../lib/types/meme';
import { 
  isPointInTextField,
  getResizeHandle
} from '../../lib/utils/templateUtils';

interface MemeCanvasProps {
  selectedTemplate: MemeTemplate | null;
  textFields: TextField[];
  activeField: string | null;
  hoveredField: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldHover: (fieldId: string | null) => void;
  onFieldMove: (fieldId: string, x: number, y: number) => void;
  onFieldResize: (fieldId: string, width: number, height: number) => void;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({
  selectedTemplate,
  textFields,
  activeField,
  hoveredField,
  onFieldSelect,
  onFieldHover,
  onFieldMove,
  onFieldResize
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartState, setResizeStartState] = useState({
    field: null as TextField | null,
    mouseX: 0,
    mouseY: 0,
    startWidth: 0,
    startHeight: 0,
    startX: 0,
    startY: 0
  });

  // Helper function to wrap text to fit within a specified width
  const wrapText = useCallback((ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
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
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if clicking on a text field
    const clickedField = textFields.find(field => {
      return isPointInTextField(x, y, field, rect.width, rect.height);
    });

    if (clickedField) {
      onFieldSelect(clickedField.id);
      
      // Check if clicking on a resize handle
      const handle = getResizeHandle(x, y, clickedField, rect.width, rect.height);
      if (handle) {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeHandle(handle);
        
        // Set the appropriate resize cursor
        const cursorMap = {
          'nw': 'nw-resize',
          'ne': 'ne-resize',
          'sw': 'sw-resize',
          'se': 'se-resize'
        };
        e.currentTarget.style.cursor = cursorMap[handle];
        
        // Store initial state for delta-based resizing
        setResizeStartState({
          field: clickedField,
          mouseX: x,
          mouseY: y,
          startWidth: clickedField.width,
          startHeight: clickedField.height,
          startX: clickedField.x,
          startY: clickedField.y
        });
        
        // For resizing, we don't need to store drag offset since we're not moving the field
        setDragOffset({ x: 0, y: 0 });
      } else {
        // Regular dragging
        setIsDragging(true);
        e.currentTarget.style.cursor = 'grabbing';
        
        const fieldCenterX = (clickedField.x / 100) * rect.width;
        const fieldCenterY = (clickedField.y / 100) * rect.height;
        
        setDragOffset({
          x: x - fieldCenterX,
          y: y - fieldCenterY
        });
      }
    } else {
      onFieldSelect(null);
    }
  }, [textFields, onFieldSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for hover on text fields
    const hoveredField = textFields.find(field => {
      return isPointInTextField(x, y, field, rect.width, rect.height, 20);
    });
    onFieldHover(hoveredField?.id || null);

    // Update cursor based on what we're hovering over
    if (hoveredField) {
      const handle = getResizeHandle(x, y, hoveredField, rect.width, rect.height);
      if (handle) {
        const cursorMap = {
          'nw': 'nw-resize',
          'ne': 'ne-resize',
          'sw': 'sw-resize',
          'se': 'se-resize'
        };
        e.currentTarget.style.cursor = cursorMap[handle];
      } else if (hoveredField.id === activeField) {
        e.currentTarget.style.cursor = 'grab';
      } else {
        e.currentTarget.style.cursor = 'pointer';
      }
    } else if (activeField) {
      e.currentTarget.style.cursor = 'default';
    } else {
      e.currentTarget.style.cursor = 'default';
    }

    if (!activeField) return;

    if (isResizing && resizeHandle && resizeStartState.field) {
      // Handle resizing from the specific corner using delta movement
      // Calculate mouse movement delta from start position
      const deltaX = x - resizeStartState.mouseX;
      const deltaY = y - resizeStartState.mouseY;
      
      // Convert delta to percentage of canvas
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;
      
      let newWidth = resizeStartState.startWidth;
      let newHeight = resizeStartState.startHeight;
      let newX = resizeStartState.startX;
      let newY = resizeStartState.startY;
      
      switch (resizeHandle) {
        case 'nw': // Northwest handle - anchor at southeast corner
          // Resize based on delta movement
          newWidth = Math.max(20, resizeStartState.startWidth - deltaXPercent);
          newHeight = Math.max(20, resizeStartState.startHeight - deltaYPercent);
          
          // Calculate new center position to keep southeast corner fixed
          const nwRightEdge = (resizeStartState.startX + resizeStartState.startWidth / 2) / 100 * rect.width;
          const nwBottomEdge = (resizeStartState.startY + resizeStartState.startHeight / 2) / 100 * rect.height;
          newX = ((nwRightEdge - (newWidth / 100 * rect.width / 2)) / rect.width) * 100;
          newY = ((nwBottomEdge - (newHeight / 100 * rect.height / 2)) / rect.height) * 100;
          break;
          
        case 'ne': // Northeast handle - anchor at southwest corner
          // Resize based on delta movement
          newWidth = Math.max(20, resizeStartState.startWidth + deltaXPercent);
          newHeight = Math.max(20, resizeStartState.startHeight - deltaYPercent);
          
          // Calculate new center position to keep southwest corner fixed
          const neLeftEdge = (resizeStartState.startX - resizeStartState.startWidth / 2) / 100 * rect.width;
          const neBottomEdge = (resizeStartState.startY + resizeStartState.startHeight / 2) / 100 * rect.height;
          newX = ((neLeftEdge + (newWidth / 100 * rect.width / 2)) / rect.width) * 100;
          newY = ((neBottomEdge - (newHeight / 100 * rect.height / 2)) / rect.height) * 100;
          break;
          
        case 'sw': // Southwest handle - anchor at northeast corner
          // Resize based on delta movement
          newWidth = Math.max(20, resizeStartState.startWidth - deltaXPercent);
          newHeight = Math.max(20, resizeStartState.startHeight + deltaYPercent);
          
          // Calculate new center position to keep northeast corner fixed
          const swRightEdge = (resizeStartState.startX + resizeStartState.startWidth / 2) / 100 * rect.width;
          const swTopEdge = (resizeStartState.startY - resizeStartState.startHeight / 2) / 100 * rect.height;
          newX = ((swRightEdge - (newWidth / 100 * rect.width / 2)) / rect.width) * 100;
          newY = ((swTopEdge + (newHeight / 100 * rect.height / 2)) / rect.height) * 100;
          break;
          
        case 'se': // Southeast handle - anchor at northwest corner
          // Resize based on delta movement
          newWidth = Math.max(20, resizeStartState.startWidth + deltaXPercent);
          newHeight = Math.max(20, resizeStartState.startHeight + deltaYPercent);
          
          // Calculate new center position to keep northwest corner fixed
          const seLeftEdge = (resizeStartState.startX - resizeStartState.startWidth / 2) / 100 * rect.width;
          const seTopEdge = (resizeStartState.startY - resizeStartState.startHeight / 2) / 100 * rect.height;
          newX = ((seLeftEdge + (newWidth / 100 * rect.width / 2)) / rect.width) * 100;
          newY = ((seTopEdge + (newHeight / 100 * rect.height / 2)) / rect.height) * 100;
          break;
      }
      
      // Update both size and position to maintain the corner-based behavior
      onFieldResize(activeField, newWidth, newHeight);
      onFieldMove(activeField, newX, newY);
      
      // Debug info (can be removed in production)
      console.log(`Resizing ${resizeHandle}: delta(${deltaXPercent.toFixed(2)},${deltaYPercent.toFixed(2)}) → ${newWidth.toFixed(2)}x${newHeight.toFixed(2)}`);
    } else if (isDragging) {
      // Handle dragging
      const newX = Math.max(0, Math.min(100, ((x - dragOffset.x) / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, ((y - dragOffset.y) / rect.height) * 100));
      
      onFieldMove(activeField, newX, newY);
    }
  }, [isDragging, isResizing, activeField, resizeHandle, dragOffset, textFields, onFieldHover, onFieldMove, onFieldResize, resizeStartState]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const activeFieldElement = textFields.find(f => f.id === activeField);
      
      if (activeFieldElement) {
        const mouseX = rect.width / 2;
        const mouseY = rect.height / 2;
        
        if (isPointInTextField(mouseX, mouseY, activeFieldElement, rect.width, rect.height)) {
          canvasRef.current.style.cursor = 'grab';
        } else {
          canvasRef.current.style.cursor = 'default';
        }
      } else {
        canvasRef.current.style.cursor = 'default';
      }
    }
  }, [activeField, textFields]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isDragging || isResizing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedField = textFields.find(field => {
      return isPointInTextField(x, y, field, rect.width, rect.height);
    });

    if (clickedField) {
      onFieldSelect(clickedField.id);
      // Focus the corresponding input field
      const inputElement = document.querySelector(`input[data-field-id="${clickedField.id}"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    } else {
      onFieldSelect(null);
    }
  }, [textFields, isDragging, isResizing, onFieldSelect]);

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isDragging || isResizing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedField = textFields.find(field => {
      return isPointInTextField(x, y, field, rect.width, rect.height);
    });

    if (clickedField) {
      onFieldSelect(clickedField.id);
      const inputElement = document.querySelector(`input[data-field-id="${clickedField.id}"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [textFields, isDragging, isResizing, onFieldSelect]);

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !selectedTemplate) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const containerWidth = container.clientWidth - 40;
      let containerHeight = container.clientHeight - 40;
      
      const imageAspectRatio = img.height / img.width;
      const idealHeight = containerWidth * imageAspectRatio;
      const limitedHeight = Math.max(300, Math.min(500, idealHeight));
      
      if (Math.abs(containerHeight - limitedHeight) > 20) {
        container.style.height = `${limitedHeight}px`;
        containerHeight = limitedHeight;
      }
      
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const scale = Math.min(scaleX, scaleY);
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (containerWidth - scaledWidth) / 2;
      const y = (containerHeight - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Draw text fields
      textFields.forEach(field => {
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
        ctx.textBaseline = 'middle';

        const textX = (field.x / 100) * containerWidth;
        const textY = (field.y / 100) * containerHeight;
        const textBoxWidth = (field.width / 100) * containerWidth;
        
        const wrappedLines = wrapText(ctx, field.text, textBoxWidth);
        const lineHeight = (field.fontSize * scale) * 1.2;
        const totalHeight = wrappedLines.length * lineHeight;
        const topPadding = 16 * scale;
        const startY = textY - (totalHeight / 2) + topPadding;
        
        let lineX = textX;
        const padding = 16 * scale;
        
        if (field.textAlign === 'left') {
          lineX = textX - (textBoxWidth / 2) + padding;
        } else if (field.textAlign === 'right') {
          lineX = textX + (textBoxWidth / 2) - padding;
        } else {
          lineX = textX;
        }
        
        wrappedLines.forEach((line, index) => {
          const lineY = startY + (index * lineHeight);
          ctx.strokeText(line, lineX, lineY);
          ctx.fillText(line, lineX, lineY);
        });
      });
    };
    img.src = selectedTemplate.src;
  }, [selectedTemplate, textFields, wrapText]);

  const renderOverlays = useCallback(() => {
    if (!canvasRef.current || !selectedTemplate || (!activeField && !hoveredField)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;

    if (activeField) {
      const selectedField = textFields.find(f => f.id === activeField);
      if (selectedField) {
        const containerX = (selectedField.x / 100) * containerWidth;
        const containerY = (selectedField.y / 100) * containerHeight;
        const containerWidth_px = (selectedField.width / 100) * containerWidth;
        const containerHeight_px = (selectedField.height / 100) * containerHeight;

        // Draw active field border
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.strokeRect(
          containerX - containerWidth_px / 2,
          containerY - containerHeight_px / 2,
          containerWidth_px,
          containerHeight_px
        );

        // Draw resize handles with higher z-index (drawn on top)
        // This ensures handles are always clickable above the text field content
        const handleSize = 16;
        const handles = [
          { x: containerX - containerWidth_px / 2, y: containerY - containerHeight_px / 2, type: 'nw' }, // nw
          { x: containerX + containerWidth_px / 2, y: containerY - containerHeight_px / 2, type: 'ne' }, // ne
          { x: containerX - containerWidth_px / 2, y: containerY + containerHeight_px / 2, type: 'sw' }, // sw
          { x: containerX + containerWidth_px / 2, y: containerY + containerHeight_px / 2, type: 'se' }  // se
        ];

        handles.forEach(handle => {
          // Highlight the active resize handle
          if (isResizing && resizeHandle === handle.type) {
            ctx.fillStyle = '#ff6b6b'; // Red for active handle
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
          } else {
            ctx.fillStyle = '#007bff'; // Blue for inactive handles
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
          }
          
          ctx.fillRect(
            handle.x - handleSize / 2,
            handle.y - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.strokeRect(
            handle.x - handleSize / 2,
            handle.y - handleSize / 2,
            handleSize,
            handleSize
          );
        });
      }
    }

    if (hoveredField && hoveredField !== activeField) {
      const hoveredFieldObj = textFields.find(f => f.id === hoveredField);
      if (hoveredFieldObj) {
        const containerX = (hoveredFieldObj.x / 100) * containerWidth;
        const containerY = (hoveredFieldObj.y / 100) * containerHeight;
        const containerWidth_px = (hoveredFieldObj.width / 100) * containerWidth;
        const containerHeight_px = (hoveredFieldObj.height / 100) * containerHeight;

        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          containerX - containerWidth_px / 2,
          containerY - containerHeight_px / 2,
          containerWidth_px,
          containerHeight_px
        );
        ctx.setLineDash([]);
      }
    }
  }, [selectedTemplate, textFields, activeField, hoveredField, isResizing, resizeHandle]);

  // Effects
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    if (activeField || hoveredField) {
      requestAnimationFrame(() => {
        renderOverlays();
      });
    }
  }, [renderOverlays, activeField, hoveredField]);

  useEffect(() => {
    const handleResize = () => {
      renderCanvas();
      if (activeField || hoveredField) {
        requestAnimationFrame(() => {
          renderOverlays();
        });
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (canvasRef.current?.parentElement) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvasRef.current.parentElement);
    }

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [renderCanvas, renderOverlays, activeField, hoveredField]);

  if (!selectedTemplate) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-1 bg-gray-50" style={{ minHeight: '300px' }}>
        <div className="text-center text-gray-500">
          <p className="text-lg">Select a template to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center flex-1 p-4" style={{ minHeight: '300px', maxHeight: '500px' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-default"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseLeave={() => {
          onFieldHover(null);
          if (canvasRef.current) {
            canvasRef.current.style.cursor = 'default';
          }
          handleMouseUp();
        }}
      />
    </div>
  );
};
