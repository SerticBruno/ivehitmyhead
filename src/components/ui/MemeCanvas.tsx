'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MemeTemplate, TextField } from '../../lib/types/meme';
import { 
  isPointInTextField,
  renderTextOnCanvas
} from '../../lib/utils/templateUtils';
import { FloatingSettingsPopup } from './FloatingSettingsPopup';

interface MemeCanvasProps {
  selectedTemplate: MemeTemplate | null;
  textFields: TextField[];
  activeField: string | null;
  hoveredField: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldHover: (fieldId: string | null) => void;
  onFieldMove: (fieldId: string, x: number, y: number) => void;
  onFieldResize: (fieldId: string, width: number, height: number) => void;
  onFieldRotate?: (fieldId: string, rotation: number) => void;
  onUpdateProperty?: (fieldId: string, property: string, value: string | number | boolean) => void;
}

export const MemeCanvas: React.FC<MemeCanvasProps> = ({
  selectedTemplate,
  textFields,
  activeField,
  hoveredField,
  onFieldSelect,
  onFieldHover,
  onFieldMove,
  onFieldResize,
  onFieldRotate,
  onUpdateProperty
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
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
  const [rotationStartState, setRotationStartState] = useState({
    field: null as TextField | null,
    mouseX: 0,
    mouseY: 0,
    startRotation: 0,
    centerX: 0,
    centerY: 0
  });

  // Settings popup state
  const [settingsPopup, setSettingsPopup] = useState<{
    isOpen: boolean;
    fieldId: string;
    x: number;
    y: number;
  } | null>(null);



  // Helper function to get resize handle information for a field
  const getResizeHandleInfo = useCallback((field: TextField, canvasWidth: number, canvasHeight: number) => {
    const containerX = (field.x / 100) * canvasWidth;
    const containerY = (field.y / 100) * canvasHeight;
    const containerWidth_px = (field.width / 100) * canvasWidth;
    const containerHeight_px = (field.height / 100) * canvasHeight;
    
    // Calculate the actual corners of the text field
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

  // Helper function to check if a point is over the rotation handle
  const isOverRotationHandle = useCallback((x: number, y: number, field: TextField, canvasWidth: number, canvasHeight: number): boolean => {
    const containerX = (field.x / 100) * canvasWidth;
    const containerY = (field.y / 100) * canvasHeight;
    const containerHeight_px = (field.height / 100) * canvasHeight;
    
    const rotationHandleSize = 18; // 12 * 1.5
    
    // Calculate the position above the text field, accounting for rotation (same logic as drawing)
    let rotationHandleX = containerX;
    let rotationHandleY = containerY - containerHeight_px / 2 - rotationHandleSize - 8;
    
    // If the field is rotated, adjust the rotation handle position to follow the rotated text
    if (field.rotation && field.rotation !== 0) {
      const angleRad = (field.rotation * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      
      // Calculate the offset from the center to the top of the text field
      const topOffset = containerHeight_px / 2 + rotationHandleSize + 8;
      
      // Apply rotation to the offset (corrected direction)
      const rotatedOffsetX = topOffset * sin;
      const rotatedOffsetY = -topOffset * cos;
      
      rotationHandleX = containerX + rotatedOffsetX;
      rotationHandleY = containerY + rotatedOffsetY;
    }
    
    // Simple distance calculation
    const distance = Math.sqrt((x - rotationHandleX) ** 2 + (y - rotationHandleY) ** 2);
    return distance <= rotationHandleSize / 2;
  }, []);

  // Helper function to check if a point is over a rotated resize handle
  const isOverRotatedResizeHandle = useCallback((x: number, y: number, handle: { x: number; y: number; type: string }, field: TextField, canvasWidth: number, canvasHeight: number): boolean => {
    if (!field.rotation || field.rotation === 0) {
      // No rotation, use simple distance calculation
      return Math.abs(x - handle.x) <= 6 && Math.abs(y - handle.y) <= 6;
    }
    
    // For rotated fields, we need to transform the mouse coordinates to the rotated coordinate system
    const containerX = (field.x / 100) * canvasWidth;
    const containerY = (field.y / 100) * canvasHeight;
    
    const angleRad = (field.rotation * Math.PI) / 180;
    const cos = Math.cos(-angleRad); // Negative angle to reverse the rotation
    const sin = Math.sin(-angleRad);
    
    // Translate to origin, rotate, then translate back
    const translatedX = x - containerX;
    const translatedY = y - containerY;
    const rotatedX = translatedX * cos - translatedY * sin;
    const rotatedY = translatedX * sin + translatedY * cos;
    
    // Check distance to the rotated handle position
    const handleX = handle.x - containerX;
    const handleY = handle.y - containerY;
    const distance = Math.sqrt((rotatedX - handleX) ** 2 + (rotatedY - handleY) ** 2);
    
    return distance <= 6; // 6 is half of handleSize (12)
  }, []);

  // Helper function to check if a point is over the settings cog
  const isOverSettingsCog = useCallback((x: number, y: number, field: TextField, canvasWidth: number, canvasHeight: number): boolean => {
    const containerX = (field.x / 100) * canvasWidth;
    const containerY = (field.y / 100) * canvasHeight;
    const containerHeight_px = (field.height / 100) * canvasHeight;
    
    const settingsCogSize = 14; // 12 * 1.2
    
    // Calculate the position beneath the text field
    let settingsCogX = containerX;
    let settingsCogY = containerY + containerHeight_px / 2 + settingsCogSize + 8;
    
    if (!field.rotation || field.rotation === 0) {
      // No rotation, use simple distance calculation
      const distance = Math.sqrt((x - settingsCogX) ** 2 + (y - settingsCogY) ** 2);
      return distance <= settingsCogSize / 2;
    }
    
    // For rotated fields, we need to transform the mouse coordinates to the rotated coordinate system
    const angleRad = (field.rotation * Math.PI) / 180;
    const cos = Math.cos(-angleRad); // Negative angle to reverse the rotation
    const sin = Math.sin(-angleRad);
    
    // Translate to origin, rotate, then translate back
    const translatedX = x - containerX;
    const translatedY = y - containerY;
    const rotatedX = translatedX * cos - translatedY * sin;
    const rotatedY = translatedX * sin + translatedY * cos;
    
    // Check distance to the rotated cog position
    const cogX = settingsCogX - containerX;
    const cogY = settingsCogY - containerY;
    const distance = Math.sqrt((rotatedX - cogX) ** 2 + (rotatedY - cogY) ** 2);
    
    return distance <= settingsCogSize / 2;
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


            
            // Draw border
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            
            // If the field is rotated, we need to rotate the border and handles
            if (selectedField.rotation && selectedField.rotation !== 0) {
              ctx.save();
              ctx.translate(containerX, containerY);
              ctx.rotate((selectedField.rotation * Math.PI) / 180);
              ctx.translate(-containerX, -containerY);
            }
            
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
            
            // Restore the context state if we rotated
            if (selectedField.rotation && selectedField.rotation !== 0) {
              ctx.restore();
            }
            
            // Draw resize handles - rotate with the text field
            const { handles, handleSize } = getResizeHandleInfo(selectedField, containerWidth, containerHeight);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            
            // If the field is rotated, we need to rotate the resize handles too
            if (selectedField.rotation && selectedField.rotation !== 0) {
              ctx.save();
              ctx.translate(containerX, containerY);
              ctx.rotate((selectedField.rotation * Math.PI) / 180);
              ctx.translate(-containerX, -containerY);
            }
            
            handles.forEach((handle) => {
              // Check if mouse is over this handle (we'll update this in mouse events)
              const isHovered = false; // Will be updated in mouse events
              
              ctx.fillStyle = isHovered ? '#0056b3' : '#007bff';
              ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
              ctx.strokeRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
            });
            
            // Restore the context state if we rotated
            if (selectedField.rotation && selectedField.rotation !== 0) {
              ctx.restore();
            }
            
            // Draw rotation handle (above the text field) - positioned to follow the rotated text field
            const rotationHandleSize = handleSize * 1.5;
            
            // Calculate the position above the text field, accounting for rotation
            let rotationHandleX = containerX;
            let rotationHandleY = containerY - containerHeight_px / 2 - rotationHandleSize - 8;
            
            // If the field is rotated, adjust the rotation handle position to follow the rotated text
            if (selectedField.rotation && selectedField.rotation !== 0) {
              const angleRad = (selectedField.rotation * Math.PI) / 180;
              const cos = Math.cos(angleRad);
              const sin = Math.sin(angleRad);
              
              // Calculate the offset from the center to the top of the text field
              const topOffset = containerHeight_px / 2 + rotationHandleSize + 8;
              
              // Apply rotation to the offset (corrected direction)
              const rotatedOffsetX = topOffset * sin;
              const rotatedOffsetY = -topOffset * cos;
              
              rotationHandleX = containerX + rotatedOffsetX;
              rotationHandleY = containerY + rotatedOffsetY;
            }
            
            // Draw rotation icon
            ctx.fillStyle = '#007bff';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            
            // Draw circular handle
            ctx.beginPath();
            ctx.arc(rotationHandleX, rotationHandleY, rotationHandleSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Draw rotation arrows
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Left arrow
            ctx.moveTo(rotationHandleX - 4, rotationHandleY - 2);
            ctx.lineTo(rotationHandleX - 8, rotationHandleY - 2);
            ctx.lineTo(rotationHandleX - 6, rotationHandleY - 4);
            ctx.moveTo(rotationHandleX - 8, rotationHandleY - 2);
            ctx.lineTo(rotationHandleX - 6, rotationHandleY);
            // Right arrow
            ctx.moveTo(rotationHandleX + 4, rotationHandleY + 2);
            ctx.lineTo(rotationHandleX + 8, rotationHandleY + 2);
            ctx.lineTo(rotationHandleX + 6, rotationHandleY + 4);
            ctx.moveTo(rotationHandleX + 8, rotationHandleY + 2);
            ctx.lineTo(rotationHandleX + 6, rotationHandleY);
            ctx.stroke();
            
            // Draw settings cog (beneath the text field) - positioned to follow the rotated text field
            const settingsCogSize = handleSize * 1.2;
            
            // Calculate the position beneath the text field, accounting for rotation
            let settingsCogX = containerX;
            let settingsCogY = containerY + containerHeight_px / 2 + settingsCogSize + 8;
            
            // Settings cog always positioned below the text field (no rotation following)
            
            // Draw settings cog icon - rotate with the text field
            if (selectedField.rotation && selectedField.rotation !== 0) {
              ctx.save();
              ctx.translate(containerX, containerY);
              ctx.rotate((selectedField.rotation * Math.PI) / 180);
              ctx.translate(-containerX, -containerY);
            }
            
            ctx.fillStyle = '#6b7280';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            
            // Draw circular background
            ctx.beginPath();
            ctx.arc(settingsCogX, settingsCogY, settingsCogSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Draw cog teeth
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            // Draw 6 cog teeth around the circle
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const outerRadius = settingsCogSize / 2 + 2;
              const innerRadius = settingsCogSize / 2 - 2;
              
              const outerX = settingsCogX + Math.cos(angle) * outerRadius;
              const outerY = settingsCogY + Math.sin(angle) * outerRadius;
              const innerX = settingsCogX + Math.cos(angle) * innerRadius;
              const innerY = settingsCogY + Math.sin(angle) * innerRadius;
              
              ctx.moveTo(outerX, outerY);
              ctx.lineTo(innerX, innerY);
            }
            ctx.stroke();
            
            if (selectedField.rotation && selectedField.rotation !== 0) {
              ctx.restore();
            }
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


            
            // If the field is rotated, we need to rotate the hover border too
            if (hoveredFieldObj.rotation && hoveredFieldObj.rotation !== 0) {
              ctx.save();
              ctx.translate(containerX, containerY);
              ctx.rotate((hoveredFieldObj.rotation * Math.PI) / 180);
              ctx.translate(-containerX, -containerY);
            }
            
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
            
            // Draw settings cog for hovered field (beneath the text field)
            const settingsCogSize = 12 * 1.2;
            
            // Calculate the position beneath the text field, accounting for rotation
            let settingsCogX = containerX;
            let settingsCogY = containerY + containerHeight_px / 2 + settingsCogSize + 8;
            
            // Settings cog always positioned below the text field (no rotation following)
            
            // Draw settings cog icon - rotate with the text field
            if (hoveredFieldObj.rotation && hoveredFieldObj.rotation !== 0) {
              ctx.save();
              ctx.translate(containerX, containerY);
              ctx.rotate((hoveredFieldObj.rotation * Math.PI) / 180);
              ctx.translate(-containerX, -containerY);
            }
            
            ctx.fillStyle = '#9ca3af';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            
            // Draw circular background
            ctx.beginPath();
            ctx.arc(settingsCogX, settingsCogY, settingsCogSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Draw cog teeth
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            // Draw 6 cog teeth around the circle
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const outerRadius = settingsCogSize / 2 + 1;
              const innerRadius = settingsCogSize / 2 - 1;
              
              const outerX = settingsCogX + Math.cos(angle) * outerRadius;
              const outerY = settingsCogY + Math.sin(angle) * outerRadius;
              const innerX = settingsCogX + Math.cos(angle) * innerRadius;
              const innerY = settingsCogY + Math.sin(angle) * innerRadius;
              
              ctx.moveTo(outerX, outerY);
              ctx.lineTo(innerX, innerY);
            }
            ctx.stroke();
            
            // Restore the context state if we rotated
            if (hoveredFieldObj.rotation && hoveredFieldObj.rotation !== 0) {
              ctx.restore();
            }
          }
        }
      }
    };
    img.src = selectedTemplate.src;
  }, [selectedTemplate, textFields, activeField, hoveredField, getResizeHandleInfo]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a settings cog first (for any field)
    for (const field of textFields) {
      if (isOverSettingsCog(x, y, field, rect.width, rect.height)) {
        // Open settings popup for this field
        // Use canvas-relative coordinates for absolute positioning
        const fieldCenterX = (field.x / 100) * rect.width;
        const fieldCenterY = (field.y / 100) * rect.height;
        
        // Calculate position beneath the cog (same logic as drawing the cog)
        const containerHeight_px = (field.height / 100) * rect.height;
        const settingsCogSize = 12 * 1.2;
        let settingsCogX = fieldCenterX;
        let settingsCogY = fieldCenterY + containerHeight_px / 2 + settingsCogSize + 8;
        
        // Settings cog always positioned below the text field (no rotation following)
        
        // Position popup below the cog (at the bottom of the text area)
        const canvasRect = canvasRef.current!.getBoundingClientRect();
        
        // Calculate cog position in screen coordinates
        const screenCogX = canvasRect.left + settingsCogX;
        const screenCogY = canvasRect.top + settingsCogY;
        
        // Calculate popup position below the cog
        let popupY = screenCogY + 20 + window.scrollY;
        let popupX = screenCogX;
        
        // Check if popup would go below viewport and adjust if needed
        const popupHeight = 300; // Approximate height of the popup
        const popupWidth = 320; // Approximate width of the popup (min-w-80 = 320px)
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        if (popupY + popupHeight > viewportHeight + window.scrollY) {
          // Position popup above the cog instead
          popupY = screenCogY - popupHeight - 20 + window.scrollY;
        }
        
        // Check if popup would go off the left or right edges (since we're centering on cog)
        if (popupX - popupWidth / 2 < 0) {
          popupX = popupWidth / 2; // Align to left edge
        } else if (popupX + popupWidth / 2 > viewportWidth) {
          popupX = viewportWidth - popupWidth / 2; // Align to right edge
        }
        
        // Ensure the field is selected when opening settings
        onFieldSelect(field.id);
        
        // Position popup below the cog so it's at the bottom of the text area
        // Add scroll offset to ensure correct positioning
        setSettingsPopup({
          isOpen: true,
          fieldId: field.id,
          x: popupX,
          y: popupY
        });
        return;
      }
    }
    
    // Check if clicking on a resize handle or rotation handle of the active field
    if (activeField) {
      const selectedField = textFields.find(f => f.id === activeField);
      if (selectedField) {
        // Check if clicking on rotation handle
        if (isOverRotationHandle(x, y, selectedField, rect.width, rect.height)) {
          setIsRotating(true);
          setRotationStartState({
            field: selectedField,
            mouseX: x,
            mouseY: y,
            startRotation: selectedField.rotation || 0,
            centerX: (selectedField.x / 100) * rect.width,
            centerY: (selectedField.y / 100) * rect.height
          });
          return;
        }
        
        const { handles } = getResizeHandleInfo(selectedField, rect.width, rect.height);
        
        // Check if clicking on a resize handle
        for (const handle of handles) {
          if (isOverRotatedResizeHandle(x, y, handle, selectedField, rect.width, rect.height)) {
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
    } else if (!settingsPopup) {
      // Only deselect if settings popup is not open
      onFieldSelect(null);
    }
  }, [textFields, onFieldSelect, activeField, isOverRotatedResizeHandle, isOverRotationHandle, getResizeHandleInfo, isOverSettingsCog, settingsPopup]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
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
      }
    }
  }, [textFields, isDragging, isResizing, onFieldSelect]);

  // Function to close settings popup
  const closeSettingsPopup = useCallback(() => {
    setSettingsPopup(null);
  }, []);

  // Function to handle property updates
  const handlePropertyUpdate = useCallback((fieldId: string, property: string, value: string | number | boolean) => {
    if (onUpdateProperty) {
      onUpdateProperty(fieldId, property, value);
    }
  }, [onUpdateProperty]);

  // Simplified resize logic
  const handleResize = useCallback((handle: 'nw' | 'ne' | 'sw' | 'se', deltaX: number, deltaY: number) => {
    if (!activeField || !resizeStartState.field) return;
    

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

    // Check if mouse is over a resize handle, rotation handle, or settings cog of any field
    let isOverResizeHandle = false;
    let isOverRotationHandleVar = false;
    let isOverSettingsCogVar = false;
    let resizeCursor: string | null = null;
    
    // Check all fields for settings cog hover
    for (const field of textFields) {
      if (isOverSettingsCog(x, y, field, rect.width, rect.height)) {
        isOverSettingsCogVar = true;
        break;
      }
    }
    
    if (activeField) {
      const selectedField = textFields.find(f => f.id === activeField);
      if (selectedField) {
        // Check if mouse is over rotation handle
        if (isOverRotationHandle(x, y, selectedField, rect.width, rect.height)) {
          isOverRotationHandleVar = true;
        }
        
        const { handles } = getResizeHandleInfo(selectedField, rect.width, rect.height);
        
        // Check if mouse is over a resize handle
        for (const handle of handles) {
          if (isOverRotatedResizeHandle(x, y, handle, selectedField, rect.width, rect.height)) {
            isOverResizeHandle = true;
            resizeCursor = handle.cursor;
            break;
          }
        }
      }
    }

    // Update cursor based on what we're hovering over
    if (isOverRotationHandleVar) {
      e.currentTarget.style.cursor = 'grab';
    } else if (isOverSettingsCogVar) {
      e.currentTarget.style.cursor = 'pointer';
    } else if (isOverResizeHandle && resizeCursor) {
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

    if (isRotating && rotationStartState.field && onFieldRotate) {
      // Handle rotation
      const centerX = rotationStartState.centerX;
      const centerY = rotationStartState.centerY;
      
      // Calculate angle from center to current mouse position
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      const currentAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      // Calculate angle from center to start mouse position
      const startDeltaX = rotationStartState.mouseX - centerX;
      const startDeltaY = rotationStartState.mouseY - centerY;
      const startAngle = Math.atan2(startDeltaY, startDeltaX) * 180 / Math.PI;
      
      // Calculate rotation difference
      let rotationDiff = currentAngle - startAngle;
      
      // Normalize to -180 to 180 range
      while (rotationDiff > 180) rotationDiff -= 360;
      while (rotationDiff < -180) rotationDiff += 360;
      
      const newRotation = rotationStartState.startRotation + rotationDiff;
      onFieldRotate(activeField, newRotation);
    } else if (isResizing && resizeHandle && resizeStartState.field) {
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
  }, [isDragging, isResizing, isRotating, activeField, resizeHandle, dragOffset, textFields, onFieldHover, onFieldMove, resizeStartState, rotationStartState, onFieldRotate, handleResize, isOverRotatedResizeHandle, getResizeHandleInfo, isOverRotationHandle, isOverSettingsCog]);

  // Effects
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Global mouse event listeners for resize and rotation operations
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeHandle && resizeStartState.field && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const deltaX = x - resizeStartState.mouseX;
        const deltaY = y - resizeStartState.mouseY;
        
        handleResize(resizeHandle, deltaX, deltaY);
      } else if (isRotating && rotationStartState.field && onFieldRotate && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Handle rotation
        const centerX = rotationStartState.centerX;
        const centerY = rotationStartState.centerY;
        
        // Calculate angle from center to current mouse position
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const currentAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // Calculate angle from center to start mouse position
        const startDeltaX = rotationStartState.mouseX - centerX;
        const startDeltaY = rotationStartState.mouseY - centerY;
        const startAngle = Math.atan2(startDeltaY, startDeltaX) * 180 / Math.PI;
        
        // Calculate rotation difference
        let rotationDiff = currentAngle - startAngle;
        
        // Normalize to -180 to 180 range
        while (rotationDiff > 180) rotationDiff -= 360;
        while (rotationDiff < -180) rotationDiff += 360;
        
        const newRotation = rotationStartState.startRotation + rotationDiff;
        onFieldRotate(activeField!, newRotation);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        setResizeHandle(null);
      }
      if (isRotating) {
        setIsRotating(false);
      }
    };

    if (isResizing || isRotating) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isResizing, isRotating, resizeHandle, resizeStartState, rotationStartState, onFieldRotate, activeField, handleResize]);

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

  // Global click handler to close settings popup when clicking outside
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (settingsPopup) {
        // Check if the click target is inside the settings popup
        const popupElement = document.querySelector('[data-settings-popup]');
        if (popupElement && popupElement.contains(e.target as Node)) {
          return; // Don't close if clicking inside popup
        }
        
        // Check if click is outside the canvas
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            setSettingsPopup(null);
          }
        }
      }
    };

    if (settingsPopup) {
      // Use a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleGlobalClick);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleGlobalClick);
      };
    }
  }, [settingsPopup]);

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
      
             {/* Settings Popup - rendered via portal outside canvas container */}
       {settingsPopup && (
         <FloatingSettingsPopup
           field={textFields.find(f => f.id === settingsPopup.fieldId)!}
           isOpen={settingsPopup.isOpen}
           x={settingsPopup.x}
           y={settingsPopup.y}
           onClose={closeSettingsPopup}
           onUpdateProperty={handlePropertyUpdate}
         />
       )}
    </div>
  );
};
