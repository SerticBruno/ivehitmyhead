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
      
      // Start dragging (resize handles are now handled by HTML overlay)
      setIsDragging(true);
      e.currentTarget.style.cursor = 'grabbing';
      
      const fieldCenterX = (clickedField.x / 100) * rect.width;
      const fieldCenterY = (clickedField.y / 100) * rect.height;
      
      setDragOffset({
        x: x - fieldCenterX,
        y: y - fieldCenterY
      });
    } else {
      onFieldSelect(null);
    }
  }, [textFields, onFieldSelect]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Don't reset resizing here - let the global handler do it
    
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
        
        // Debug: Draw corner markers to show exact handle positions
        ctx.fillStyle = '#ff0000';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        const cornerSize = 6;
        const corners = [
          { x: containerX - containerWidth_px / 2, y: containerY - containerHeight_px / 2 }, // NW
          { x: containerX + containerWidth_px / 2, y: containerY - containerHeight_px / 2 }, // NE
          { x: containerX - containerWidth_px / 2, y: containerY + containerHeight_px / 2 }, // SW
          { x: containerX + containerWidth_px / 2, y: containerY + containerHeight_px / 2 }  // SE
        ];
        
        corners.forEach(corner => {
          ctx.fillRect(corner.x - cornerSize/2, corner.y - cornerSize/2, cornerSize, cornerSize);
          ctx.strokeRect(corner.x - cornerSize/2, corner.y - cornerSize/2, cornerSize, cornerSize);
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
  }, [selectedTemplate, textFields, activeField, hoveredField]);

  // Simplified resize logic
  const handleResize = useCallback((handle: 'nw' | 'ne' | 'sw' | 'se', deltaX: number, deltaY: number) => {
    if (!activeField || !resizeStartState.field) return;
    
    const field = resizeStartState.field;
    const deltaXPercent = (deltaX / (canvasRef.current?.width || 1)) * 100;
    const deltaYPercent = (deltaY / (canvasRef.current?.height || 1)) * 100;
    
    let newWidth = resizeStartState.startWidth;
    let newHeight = resizeStartState.startHeight;
    let newX = resizeStartState.startX;
    let newY = resizeStartState.startY;
    
    // Simple resize logic - just adjust width/height based on handle
    switch (handle) {
      case 'nw': // Northwest - adjust left and top
        newWidth = Math.max(10, resizeStartState.startWidth - deltaXPercent);
        newHeight = Math.max(10, resizeStartState.startHeight - deltaYPercent);
        newX = resizeStartState.startX + (resizeStartState.startWidth - newWidth) / 2;
        newY = resizeStartState.startY + (resizeStartState.startHeight - newHeight) / 2;
        break;
      case 'ne': // Northeast - adjust right and top
        newWidth = Math.max(10, resizeStartState.startWidth + deltaXPercent);
        newHeight = Math.max(10, resizeStartState.startHeight - deltaYPercent);
        newX = resizeStartState.startX + (newWidth - resizeStartState.startWidth) / 2;
        newY = resizeStartState.startY + (resizeStartState.startHeight - newHeight) / 2;
        break;
      case 'sw': // Southwest - adjust left and bottom
        newWidth = Math.max(10, resizeStartState.startWidth - deltaXPercent);
        newHeight = Math.max(10, resizeStartState.startHeight + deltaYPercent);
        newX = resizeStartState.startX + (resizeStartState.startWidth - newWidth) / 2;
        newY = resizeStartState.startY + (newHeight - resizeStartState.startHeight) / 2;
        break;
      case 'se': // Southeast - adjust right and bottom
        newWidth = Math.max(10, resizeStartState.startWidth + deltaXPercent);
        newHeight = Math.max(10, resizeStartState.startHeight + deltaYPercent);
        newX = resizeStartState.startX + (newWidth - resizeStartState.startWidth) / 2;
        newY = resizeStartState.startY + (newHeight - resizeStartState.startHeight) / 2;
        break;
    }
    
    // Update the field
    onFieldResize(activeField, newWidth, newHeight);
    onFieldMove(activeField, newX, newY);
  }, [activeField, resizeStartState, onFieldResize, onFieldMove]);

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
      if (hoveredField.id === activeField) {
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
      // Handle resizing with simplified logic
      const deltaX = x - resizeStartState.mouseX;
      const deltaY = y - resizeStartState.mouseY;
      handleResize(resizeHandle, deltaX, deltaY);
    } else if (isDragging) {
      // Handle dragging
      const newX = Math.max(0, Math.min(100, ((x - dragOffset.x) / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, ((y - dragOffset.y) / rect.height) * 100));
      
      onFieldMove(activeField, newX, newY);
    }
  }, [isDragging, isResizing, activeField, resizeHandle, dragOffset, textFields, onFieldHover, onFieldMove, resizeStartState, handleResize]);

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

  // Global mouse event listeners for resize operations
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeHandle && resizeStartState.field && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const deltaX = x - resizeStartState.mouseX;
        const deltaY = y - resizeStartState.mouseY;
        
        handleResize(resizeHandle, deltaX, deltaY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isResizing) {
        console.log('RESIZE END');
        setIsResizing(false);
        setResizeHandle(null);
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isResizing, resizeHandle, resizeStartState, handleResize]);

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
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center flex-1 p-4 relative" style={{ minHeight: '300px', maxHeight: '500px' }}>
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
      
      {/* HTML Overlay Resize Handles */}
      {activeField && selectedTemplate && (
        (() => {
          const selectedField = textFields.find(f => f.id === activeField);
          if (!selectedField) return null;
          
          const container = canvasRef.current?.parentElement;
          if (!container) return null;
          
                     // Get the actual canvas dimensions and position
           const canvasRect = canvasRef.current?.getBoundingClientRect();
           if (!canvasRect) return null;
           
           const containerRect = container.getBoundingClientRect();
           
           // Calculate the offset between container and canvas
           const offsetX = canvasRect.left - containerRect.left;
           const offsetY = canvasRect.top - containerRect.top;
           
           // Use the same dimensions that the canvas rendering uses
           const canvasWidth = container.clientWidth - 40;
           const canvasHeight = container.clientHeight - 40;
           
           const canvasX = (selectedField.x / 100) * canvasWidth;
           const canvasY = (selectedField.y / 100) * canvasHeight;
           const canvasWidth_px = (selectedField.width / 100) * canvasWidth;
           const canvasHeight_px = (selectedField.height / 100) * canvasHeight;
          
          const handleSize = 20;
          
          // Calculate handle positions relative to the container, accounting for canvas offset
          const handles = [
            { 
              x: offsetX + canvasX - canvasWidth_px / 2, 
              y: offsetY + canvasY - canvasHeight_px / 2, 
              type: 'nw',
              cursor: 'nw-resize'
            },
            { 
              x: offsetX + canvasX + canvasWidth_px / 2, 
              y: offsetY + canvasY - canvasHeight_px / 2, 
              type: 'ne',
              cursor: 'ne-resize'
            },
            { 
              x: offsetX + canvasX - canvasWidth_px / 2, 
              y: offsetY + canvasY + canvasHeight_px / 2, 
              type: 'sw',
              cursor: 'sw-resize'
            },
            { 
              x: offsetX + canvasX + canvasWidth_px / 2, 
              y: offsetY + canvasY + canvasHeight_px / 2, 
              type: 'se',
              cursor: 'se-resize'
            }
          ];
          
          return handles.map((handle, index) => (
            <div
              key={handle.type}
              className="absolute bg-blue-500 border-2 border-white rounded cursor-pointer hover:bg-blue-600 transition-colors shadow-lg z-50"
                             style={{
                 width: handleSize,
                 height: handleSize,
                 left: handle.x - handleSize/2,
                 top: handle.y - handleSize/2,
                 cursor: handle.cursor
               }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`RESIZE START: ${handle.type} for field ${selectedField.id}`);
                
                setIsResizing(true);
                setResizeHandle(handle.type as 'nw' | 'ne' | 'sw' | 'se');
                
                // Get canvas coordinates for the resize start
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                
                const canvasX = e.clientX - rect.left;
                const canvasY = e.clientY - rect.top;
                
                setResizeStartState({
                  field: selectedField,
                  mouseX: canvasX,
                  mouseY: canvasY,
                  startWidth: selectedField.width,
                  startHeight: selectedField.height,
                  startX: selectedField.x,
                  startY: selectedField.y
                });
              }}
              title={`Resize ${handle.type.toUpperCase()}`}
            >
              
            </div>
          ));
        })()
      )}
    </div>
  );
};
