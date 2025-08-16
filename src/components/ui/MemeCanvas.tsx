'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MemeTemplate, TextField } from '../../lib/types/meme';
import { 
  isPointInTextField,
  getResizeHandle,
  calculateAdjustedYPosition,
  renderTextOnCanvas
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



  // Helper function to get resize handle information for a field
  const getResizeHandleInfo = useCallback((field: TextField, canvasWidth: number, canvasHeight: number) => {
    const containerX = (field.x / 100) * canvasWidth;
    const containerY = (field.y / 100) * canvasHeight;
    const containerWidth_px = (field.width / 100) * canvasWidth;
    const containerHeight_px = (field.height / 100) * canvasHeight;

    const scale = Math.min(canvasWidth / (canvasRef.current?.width || 1), canvasHeight / (canvasRef.current?.height || 1));
    const padding = 16 * scale;
    
    // Calculate the actual corners of the text field without padding adjustment
    // This ensures resize handles align with the visual text field boundaries
    const leftX = containerX - containerWidth_px / 2;
    const rightX = containerX + containerWidth_px / 2;
    const topY = containerY - containerHeight_px / 2;
    const bottomY = containerY + containerHeight_px / 2;
    
    const handles = [
      { x: leftX, y: topY, type: 'nw' as const, cursor: 'nw-resize' },
      { x: rightX, y: topY, type: 'ne' as const, cursor: 'ne-resize' },
      { x: leftX, y: bottomY, type: 'sw' as const, cursor: 'sw-resize' },
      { x: rightX, y: bottomY, type: 'se' as const, cursor: 'se-resize' }
    ];
    
    return { handles, handleSize: 12 };
  }, []);

  // Single render function that handles everything
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

      // Draw text fields using the shared utility function
      textFields.forEach(field => {
        renderTextOnCanvas(ctx, field, containerWidth, containerHeight, scale);
      });

      // Draw overlays and interactive elements
      if (activeField || hoveredField) {
        // Draw active field border
        if (activeField) {
          const selectedField = textFields.find(f => f.id === activeField);
          if (selectedField) {
            const containerX = (selectedField.x / 100) * containerWidth;
            const containerY = (selectedField.y / 100) * containerHeight;
            const containerWidth_px = (selectedField.width / 100) * containerWidth;
            const containerHeight_px = (selectedField.height / 100) * containerHeight;

            const padding = 16 * scale;
            
            // Draw border
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            
            // Calculate border coordinates to match resize handle positioning
            // Remove padding adjustment to align with resize handles
            const borderLeft = containerX - containerWidth_px / 2;
            const borderTop = containerY - containerHeight_px / 2;
            
            ctx.strokeRect(
              borderLeft,
              borderTop,
              containerWidth_px,
              containerHeight_px
            );
            
            // Draw resize handles
            const { handles, handleSize } = getResizeHandleInfo(selectedField, containerWidth, containerHeight);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            
            handles.forEach((handle, index) => {
              // Check if mouse is over this handle (we'll update this in mouse events)
              const isHovered = false; // Will be updated in mouse events
              
              ctx.fillStyle = isHovered ? '#0056b3' : '#007bff';
              ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
              ctx.strokeRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
            });
          }
        }

        // Draw hover field border
        if (hoveredField && hoveredField !== activeField) {
          const hoveredFieldObj = textFields.find(f => f.id === hoveredField);
          if (hoveredFieldObj) {
            const containerX = (hoveredFieldObj.x / 100) * containerWidth;
            const containerY = (hoveredFieldObj.y / 100) * containerHeight;
            const containerWidth_px = (hoveredFieldObj.width / 100) * containerWidth;
            const containerHeight_px = (hoveredFieldObj.height / 100) * containerHeight;

            const scale = Math.min(containerWidth / canvas.width, containerHeight / canvas.height);
            const padding = 16 * scale;
            
            // Calculate border coordinates to match resize handle positioning
            // Remove padding adjustment to align with resize handles
            const hoverBorderLeft = containerX - containerWidth_px / 2;
            const hoverBorderTop = containerY - containerHeight_px / 2;
            
            ctx.strokeStyle = '#6b7280';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            
            ctx.strokeRect(
              hoverBorderLeft,
              hoverBorderTop,
              containerWidth_px,
              containerHeight_px
            );
            ctx.setLineDash([]);
          }
        }
      }
    };
    img.src = selectedTemplate.src;
  }, [selectedTemplate, textFields, activeField, hoveredField]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a resize handle first
    if (activeField) {
      const selectedField = textFields.find(f => f.id === activeField);
      if (selectedField) {
        const { handles, handleSize } = getResizeHandleInfo(selectedField, rect.width, rect.height);
        
        // Check if clicking on a resize handle
        for (const handle of handles) {
          if (Math.abs(x - handle.x) <= handleSize/2 && Math.abs(y - handle.y) <= handleSize/2) {
            setIsResizing(true);
            setResizeHandle(handle.type);
            setResizeStartState({
              field: selectedField,
              mouseX: x,
              mouseY: y,
              startWidth: selectedField.width,
              startHeight: selectedField.height,
              startX: selectedField.x,
              startY: selectedField.y
            });
            return;
          }
        }
      }
    }

    // Find if clicking on a text field
    const clickedField = textFields.find(field => {
      return isPointInTextField(x, y, field, rect.width, rect.height);
    });

    if (clickedField) {
      onFieldSelect(clickedField.id);
      
      // Start dragging
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
  }, [textFields, onFieldSelect, activeField, textFields]);

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

    // Check if mouse is over a resize handle of the active field
    let isOverResizeHandle = false;
    let resizeCursor: string | null = null;
    
    if (activeField && hoveredField?.id === activeField) {
      const selectedField = textFields.find(f => f.id === activeField);
      if (selectedField) {
        const { handles, handleSize } = getResizeHandleInfo(selectedField, rect.width, rect.height);
        
        // Check if mouse is over a resize handle
        for (const handle of handles) {
          if (Math.abs(x - handle.x) <= handleSize/2 && Math.abs(y - handle.y) <= handleSize/2) {
            isOverResizeHandle = true;
            resizeCursor = handle.cursor;
            break;
          }
        }
      }
    }

    // Update cursor based on what we're hovering over
    if (isOverResizeHandle && resizeCursor) {
      e.currentTarget.style.cursor = resizeCursor;
    } else if (hoveredField) {
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
  }, [renderCanvas]);

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
    </div>
  );
};
