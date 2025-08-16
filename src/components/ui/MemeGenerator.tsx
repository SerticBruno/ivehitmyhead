'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from './Button';
import { Card } from './Card';

import { TemplateManager } from './TemplateManager';
import { MemeTemplate, TextField } from '../../lib/types/meme';
import { MEME_TEMPLATES } from '../../lib/data/templates';
import { 
  initializeTextFields, 
  isPointInTextField,
  getResizeHandle
} from '../../lib/utils/templateUtils';

export const MemeGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [textFields, setTextFields] = useState<TextField[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MemeTemplate | null>(null);
  const [openSettingsDropdown, setOpenSettingsDropdown] = useState<string | null>(null);



  const handleTextChange = useCallback((fieldId: string, text: string) => {
    setTextFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, text } : field
      )
    );
  }, []);

  const resetToMemeDefaults = useCallback(() => {
    if (!selectedTemplate) return;
    
    setTextFields(prev => 
      prev.map(field => ({
        ...field,
        fontFamily: 'Impact',
        fontWeight: 'bold',
        fontSize: 46,
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 6,
        textAlign: field.textAlign || 'center', // Keep existing alignment
        letterSpacing: '0.05em' // Classic Impact font letter spacing
      }))
    );
  }, [selectedTemplate]);

  const handleTemplateSelect = useCallback((template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTextFields(initializeTextFields(template));
  }, []);

  const handleCreateTemplate = useCallback(() => {
    setEditingTemplate(null);
    setShowTemplateManager(true);
  }, []);

  const handleEditTemplate = useCallback((template: MemeTemplate) => {
    setEditingTemplate(template);
    setShowTemplateManager(true);
  }, []);

  const handleSaveTemplate = useCallback((template: MemeTemplate) => {
    // In a real app, you'd save this to your database
    console.log('Saving template:', template);
    setShowTemplateManager(false);
    setEditingTemplate(null);
  }, []);

  const handleCancelTemplate = useCallback(() => {
    setShowTemplateManager(false);
    setEditingTemplate(null);
  }, []);

  const toggleSettingsDropdown = useCallback((fieldId: string) => {
    setOpenSettingsDropdown(openSettingsDropdown === fieldId ? null : fieldId);
  }, [openSettingsDropdown]);

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
      setActiveField(clickedField.id);
      
      // Check if clicking on a resize handle
      const handle = getResizeHandle(x, y, clickedField, rect.width, rect.height);
      if (handle) {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setResizeHandle(handle);
        // For resizing, we don't need drag offset since we calculate position directly
        setDragOffset({ x: 0, y: 0 });
        // Set cursor based on resize handle
        const cursorMap = {
          'nw': 'nw-resize',
          'ne': 'ne-resize',
          'sw': 'sw-resize',
          'se': 'se-resize'
        };
        e.currentTarget.style.cursor = cursorMap[handle];
      } else {
        // Regular dragging
        setIsDragging(true);
        e.currentTarget.style.cursor = 'grabbing';
        // Calculate offset from center of the field
        const fieldCenterX = (clickedField.x / 100) * rect.width;
        const fieldCenterY = (clickedField.y / 100) * rect.height;
        setDragOffset({
          x: x - fieldCenterX,
          y: y - fieldCenterY
        });
      }
    }
  }, [textFields]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for hover on text fields
    const hoveredField = textFields.find(field => {
      return isPointInTextField(x, y, field, rect.width, rect.height, 20); // 20px buffer zone
    });
    setHoveredField(hoveredField?.id || null);

    // Update cursor based on what we're hovering over
    if (hoveredField) {
      const handle = getResizeHandle(x, y, hoveredField, rect.width, rect.height);
      if (handle) {
        // Set cursor based on resize handle
        const cursorMap = {
          'nw': 'nw-resize',
          'ne': 'ne-resize',
          'sw': 'sw-resize',
          'se': 'se-resize'
        };
        e.currentTarget.style.cursor = cursorMap[handle];
      } else {
        e.currentTarget.style.cursor = 'text';
      }
    } else {
      e.currentTarget.style.cursor = 'default';
    }

    if (!activeField) return;

    if (isResizing && resizeHandle) {
      // Handle resizing
      setTextFields(prev => 
        prev.map(field => {
          if (field.id !== activeField) return field;
          
          const currentField = prev.find(f => f.id === activeField);
          if (!currentField) return field;
          
          // Convert current field dimensions to pixels
          const currentPixelWidth = (currentField.width / 100) * rect.width;
          const currentPixelHeight = (currentField.height / 100) * rect.height;
          const currentPixelX = (currentField.x / 100) * rect.width;
          const currentPixelY = (currentField.y / 100) * rect.height;
          
          // Calculate new dimensions and position based on resize handle
          let newPixelWidth = currentPixelWidth;
          let newPixelHeight = currentPixelHeight;
          let newPixelX = currentPixelX;
          let newPixelY = currentPixelY;
          
          switch (resizeHandle) {
            case 'nw': // Northwest - resize from top-left, anchor at bottom-right
              newPixelWidth = Math.max(20, currentPixelX + currentPixelWidth/2 - x);
              newPixelHeight = Math.max(20, currentPixelY + currentPixelHeight/2 - y);
              newPixelX = x + newPixelWidth/2;
              newPixelY = y + newPixelHeight/2;
              break;
              
            case 'ne': // Northeast - resize from top-right, anchor at bottom-left
              newPixelWidth = Math.max(20, x - (currentPixelX - currentPixelWidth/2));
              newPixelHeight = Math.max(20, currentPixelY + currentPixelHeight/2 - y);
              newPixelX = x - newPixelWidth/2;
              newPixelY = y + newPixelHeight/2;
              break;
              
            case 'sw': // Southwest - resize from bottom-left, anchor at top-right
              newPixelWidth = Math.max(20, currentPixelX + currentPixelWidth/2 - x);
              newPixelHeight = Math.max(20, y - (currentPixelY - currentPixelHeight/2));
              newPixelX = x + newPixelWidth/2;
              newPixelY = y - newPixelHeight/2;
              break;
              
            case 'se': // Southeast - resize from bottom-right, anchor at top-left
              newPixelWidth = Math.max(20, x - (currentPixelX - currentPixelWidth/2));
              newPixelHeight = Math.max(20, y - (currentPixelY - currentPixelHeight/2));
              newPixelX = x - newPixelWidth/2;
              newPixelY = y - newPixelHeight/2;
              break;
          }
          
          // Convert back to percentages
          const newWidth = Math.min(90, (newPixelWidth / rect.width) * 100);
          const newHeight = Math.min(40, (newPixelHeight / rect.height) * 100);
          const newX = Math.max(newWidth/2, Math.min(100 - newWidth/2, (newPixelX / rect.width) * 100));
          const newY = Math.max(newHeight/2, Math.min(100 - newHeight/2, (newPixelY / rect.height) * 100));
          
          return {
            ...field,
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY
          };
        })
      );
    } else if (isDragging) {
      // Handle dragging
      const newX = Math.max(0, Math.min(100, ((x - dragOffset.x) / rect.width) * 100));
      const newY = Math.max(0, Math.min(100, ((y - dragOffset.y) / rect.height) * 100));
      
      setTextFields(prev => 
        prev.map(field => 
          field.id === activeField 
            ? { 
                ...field, 
                x: newX,
                y: newY
              }
            : field
        )
      );
    }
  }, [isDragging, isResizing, activeField, resizeHandle, dragOffset, textFields]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setActiveField(null);
    setResizeHandle(null);
    // Reset cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isDragging || isResizing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find if clicking on a text field
    const clickedField = textFields.find(field => {
      return isPointInTextField(x, y, field, rect.width, rect.height);
    });

    if (clickedField) {
      setActiveField(clickedField.id);
      // Focus the corresponding input field
      const inputElement = document.querySelector(`input[data-field-id="${clickedField.id}"]`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [textFields, isDragging, isResizing]);

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

  const downloadMeme = useCallback(() => {
    if (!canvasRef.current || !selectedTemplate) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `meme-${selectedTemplate.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [selectedTemplate]);

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !selectedTemplate) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      // Get the container dimensions
      const container = canvas.parentElement;
      if (!container) return;
      
      const containerWidth = container.clientWidth - 40; // Account for padding
      let containerHeight = container.clientHeight - 40; // Account for padding
      
      // Calculate the ideal height based on image proportions, but keep it reasonable
      const imageAspectRatio = img.height / img.width;
      const idealHeight = containerWidth * imageAspectRatio;
      
      // Limit the height to reasonable bounds (300px to 500px)
      const limitedHeight = Math.max(300, Math.min(500, idealHeight));
      
      // Update container height if it's significantly different
      if (Math.abs(containerHeight - limitedHeight) > 20) {
        container.style.height = `${limitedHeight}px`;
        containerHeight = limitedHeight;
      }
      
      // Calculate scaling to fit the image within the container while maintaining aspect ratio
      const scaleX = containerWidth / img.width;
      const scaleY = containerHeight / img.height;
      const scale = Math.min(scaleX, scaleY);
      
      // Set canvas size to match the container dimensions
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate centered position for the scaled image
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (containerWidth - scaledWidth) / 2;
      const y = (containerHeight - scaledHeight) / 2;

      // Draw background image scaled and centered
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Draw text fields
      textFields.forEach(field => {
        if (!field.text.trim()) return;

        const fontFamily = field.fontFamily || 'Impact';
        const fontWeight = field.fontWeight || 'bold';
        const letterSpacing = field.letterSpacing || '0.05em';
        ctx.font = `${fontWeight} ${field.fontSize * scale}px ${fontFamily}, Arial, sans-serif`;
        // Apply letter spacing if specified
        if (letterSpacing) {
          ctx.letterSpacing = letterSpacing;
        }
        ctx.fillStyle = field.color;
        ctx.strokeStyle = field.strokeColor || '#000000';
        ctx.lineWidth = (field.strokeWidth || 6) * scale;
        // Set text alignment based on field property
        if (field.textAlign === 'left') {
          ctx.textAlign = 'left';
        } else if (field.textAlign === 'right') {
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'center';
        }
        ctx.textBaseline = 'middle';

        // Convert percentage positions to actual canvas coordinates
        const textX = (field.x / 100) * containerWidth;
        const textY = (field.y / 100) * containerHeight;
        
        // Calculate the actual width of the text box in pixels
        const textBoxWidth = (field.width / 100) * containerWidth;
        
        // Wrap text to fit within the text box width
        const wrappedLines = wrapText(ctx, field.text, textBoxWidth);
        
        // Calculate line height (font size + some padding)
        const lineHeight = (field.fontSize * scale) * 1.2;
        
        // Calculate starting Y position to center all lines vertically with top padding
        const totalHeight = wrappedLines.length * lineHeight;
        const topPadding = 16 * scale; // 16px top padding scaled to canvas for more breathing room
        const startY = textY - (totalHeight / 2) + topPadding;
        
        // Calculate X position based on text alignment with padding
        let lineX = textX;
        const padding = 16 * scale; // 16px padding scaled to canvas for more breathing room
        
        if (field.textAlign === 'left') {
          // For left alignment, start from the left edge of the text box with padding
          lineX = textX - (textBoxWidth / 2) + padding;
        } else if (field.textAlign === 'right') {
          // For right alignment, end at the right edge of the text box with padding
          lineX = textX + (textBoxWidth / 2) - padding;
        } else {
          // For center alignment, center within the text box
          lineX = textX;
        }
        
        // Draw each line of wrapped text
        wrappedLines.forEach((line, index) => {
          const lineY = startY + (index * lineHeight);
          
          // Draw stroke
          ctx.strokeText(line, lineX, lineY);
          // Draw fill
          ctx.fillText(line, lineX, lineY);
        });
      });

      // Overlays (borders, handles) are now rendered separately by renderOverlays
    };
    img.src = selectedTemplate.src;
  }, [selectedTemplate, textFields, wrapText]);

  // Separate function for rendering overlays (borders, handles) that doesn't depend on text field properties
  const renderOverlays = useCallback(() => {
    if (!canvasRef.current || !selectedTemplate) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the container dimensions
    const container = canvas.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth - 40;
    const containerHeight = container.clientHeight - 40;

    // Draw text containers and resize handles for selected field or hovered field
    const fieldToShow = activeField || hoveredField;
    if (fieldToShow) {
      const selectedField = textFields.find(f => f.id === fieldToShow);
      if (selectedField) {
        const containerX = (selectedField.x / 100) * containerWidth;
        const containerY = (selectedField.y / 100) * containerHeight;
        const containerWidth_px = (selectedField.width / 100) * containerWidth;
        const containerHeight_px = (selectedField.height / 100) * containerHeight;

        // Define border color for handles
        const borderColor = activeField === fieldToShow ? '#007bff' : '#6b7280';

        // Draw container border
        const borderWidth = activeField === fieldToShow ? 3 : 1;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        
        if (activeField === fieldToShow) {
          // Solid border for active field
          ctx.setLineDash([]);
          ctx.strokeRect(
            containerX - containerWidth_px / 2,
            containerY - containerHeight_px / 2,
            containerWidth_px,
            containerHeight_px
          );
        } else {
          // Dashed border for hovered field
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            containerX - containerWidth_px / 2,
            containerY - containerHeight_px / 2,
            containerWidth_px,
            containerHeight_px
          );
          ctx.setLineDash([]);
        }

        // Always show resize handles for selected field, or when hovering
        if (activeField === fieldToShow || hoveredField === fieldToShow) {
          // Draw resize handles
          const handleSize = 16;
          ctx.fillStyle = borderColor;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;

          // Northwest handle
          ctx.fillRect(
            containerX - containerWidth_px / 2 - handleSize / 2,
            containerY - containerHeight_px / 2 - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.strokeRect(
            containerX - containerWidth_px / 2 - handleSize / 2,
            containerY - containerHeight_px / 2 - handleSize / 2,
            handleSize,
            handleSize
          );

          // Northeast handle
          ctx.fillRect(
            containerX + containerWidth_px / 2 - handleSize / 2,
            containerY - containerHeight_px / 2 - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.strokeRect(
            containerX + containerWidth_px / 2 - handleSize / 2,
            containerY - containerHeight_px / 2 - handleSize / 2,
            handleSize,
            handleSize
          );

          // Southwest handle
          ctx.fillRect(
            containerX - containerWidth_px / 2 - handleSize / 2,
            containerY + containerHeight_px / 2 - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.strokeRect(
            containerX - containerWidth_px / 2 - handleSize / 2,
            containerY + containerHeight_px / 2 - handleSize / 2,
            handleSize,
            handleSize
          );

          // Southeast handle
          ctx.fillRect(
            containerX + containerWidth_px / 2 - handleSize / 2,
            containerY + containerHeight_px / 2 - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.strokeRect(
            containerX + containerWidth_px / 2 - handleSize / 2,
            containerY + containerHeight_px / 2 - handleSize / 2,
            handleSize,
            handleSize
          );
        }
      }
    }
  }, [selectedTemplate, textFields, activeField, hoveredField]);

  // Helper function to update text field properties and re-render overlays
  const updateTextFieldProperty = useCallback((fieldId: string, property: string, value: any) => {
    setTextFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    );
    // Re-render overlays after a short delay to ensure state is updated
    setTimeout(() => renderOverlays(), 0);
  }, [renderOverlays]);

  // Re-render canvas when selectedTemplate or text fields change
  React.useEffect(() => {
    renderCanvas();
    renderOverlays();
  }, [renderCanvas, renderOverlays, selectedTemplate]);

  // Handle window resize and container size changes
  React.useEffect(() => {
    const handleResize = () => {
      renderCanvas();
      renderOverlays();
    };

    // Use ResizeObserver for more efficient container size monitoring
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

  // Re-render overlays when activeField or hoveredField change (without affecting main canvas)
  React.useEffect(() => {
    renderOverlays();
  }, [renderOverlays, activeField, hoveredField]);

  // Handle click outside dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && event.target instanceof Element) {
        const dropdown = document.querySelector('[data-dropdown]');
        if (dropdown && !dropdown.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      }
      
      // Close settings dropdown when clicking outside
      if (openSettingsDropdown && event.target instanceof Element) {
        const settingsContainer = document.querySelector(`[data-settings-container="${openSettingsDropdown}"]`);
        if (settingsContainer && !settingsContainer.contains(event.target)) {
          setOpenSettingsDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, openSettingsDropdown]);

  return (
    <div className="max-w-7xl mx-auto p-6 pb-16">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Meme Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a template, add your text, and create hilarious memes!
        </p>
      </div>



      {showTemplateManager && (
        <TemplateManager
          onSave={handleSaveTemplate}
          onCancel={handleCancelTemplate}
          existingTemplate={editingTemplate || undefined}
        />
      )}



      {!showTemplateManager && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Side - Meme Preview */}
          <div className="lg:col-span-2">
           <Card className="p-6 flex flex-col">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-semibold">Preview & Edit</h2>
               {selectedTemplate && (
                 <Button onClick={downloadMeme} size="lg">
                   Download Meme
                 </Button>
               )}
             </div>
             
                           {selectedTemplate ? (
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center flex-1 p-4" style={{ minHeight: '300px', maxHeight: '500px' }}>
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onClick={handleCanvasClick}
                    onMouseLeave={() => {
                      setHoveredField(null);
                      if (canvasRef.current) {
                        canvasRef.current.style.cursor = 'default';
                      }
                      handleMouseUp();
                    }}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-1 bg-gray-50" style={{ minHeight: '300px' }}>
                  <div className="text-center text-gray-500">
                    <p className="text-lg">Select a template to get started</p>
                  </div>
                </div>
              )}
             
             {selectedTemplate && (
               <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                 Click on text boxes to edit • Hover to see handles • Drag text to move • Drag corner handles to resize
               </p>
             )}
           </Card>
         </div>

          {/* Right Side - Controls */}
        <div className="space-y-6">
          {/* Template Selection */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Choose Template</h2>
            <div className="space-y-4">
              {/* Custom Template Dropdown */}
              <div className="relative" data-dropdown>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {selectedTemplate ? (
                      <>
                        <Image
                          src={selectedTemplate.src}
                          alt={selectedTemplate.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span>{selectedTemplate.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Select a template...</span>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Options */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {MEME_TEMPLATES.map((template) => (
                      <div
                        key={template.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center space-x-3 ${
                          selectedTemplate?.id === template.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          handleTemplateSelect(template);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Image
                          src={template.src}
                          alt={template.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-gray-900">{template.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Text Input Fields */}
          {selectedTemplate && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add Your Text</h2>
              <div className="space-y-4">
                {textFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.id.charAt(0).toUpperCase() + field.id.slice(1)} Text
                    </label>
                    <div 
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 cursor-text hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        activeField === field.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={(e) => {
                        // Don't trigger if clicking directly on the input
                        if (e.target === e.currentTarget || (e.target as Element).closest('button')) {
                          return;
                        }
                        setActiveField(field.id);
                        // Focus the input field immediately
                        const inputElement = document.querySelector(`input[data-field-id="${field.id}"]`) as HTMLInputElement;
                        if (inputElement) {
                          inputElement.focus();
                        }
                      }}
                    >
                      <input
                        type="text"
                        value={field.text}
                        onChange={(e) => handleTextChange(field.id, e.target.value)}
                        placeholder={`Enter ${field.id} text...`}
                        data-field-id={field.id}
                        className="flex-1 h-10 px-3 py-2 text-sm border-0 bg-transparent focus:outline-none focus:ring-0 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={() => setActiveField(field.id)}
                          className={`px-3 py-2 text-xs rounded transition-colors ${
                            activeField === field.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {activeField === field.id ? 'Active' : 'Select'}
                        </button>
                        <div className="relative" data-settings-container={field.id}>
                          <button
                            onClick={() => toggleSettingsDropdown(field.id)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                            title="Settings"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          
                          {/* Settings Dropdown */}
                          {openSettingsDropdown === field.id && (
                            <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 min-w-64">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  Text Settings
                                </h4>
                                <button
                                  onClick={() => setOpenSettingsDropdown(null)}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>

                              <div className="space-y-3">
                                {/* Font Family */}
                                <div>
                                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Font</label>
                                  <select
                                    value={field.fontFamily || 'Impact'}
                                    onChange={(e) => 
                                      updateTextFieldProperty(field.id, 'fontFamily', e.target.value)
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  >
                                    <option value="Impact">Impact</option>
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                  </select>
                                </div>

                                {/* Font Size */}
                                <div>
                                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                    Size: {field.fontSize}px
                                  </label>
                                  <input
                                    type="range"
                                    min="20"
                                    max="80"
                                    value={field.fontSize}
                                    onChange={(e) => 
                                      updateTextFieldProperty(field.id, 'fontSize', parseInt(e.target.value))
                                    }
                                    className="w-full"
                                  />
                                </div>

                                {/* Text Color */}
                                <div>
                                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Color</label>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="color"
                                      value={field.color}
                                      onChange={(e) => 
                                        updateTextFieldProperty(field.id, 'color', e.target.value)
                                      }
                                      className="w-10 h-10 rounded border cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {field.color}
                                    </span>
                                  </div>
                                </div>

                                {/* Stroke Width */}
                                <div>
                                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                    Border Width: {field.strokeWidth || 6}px
                                  </label>
                                  <input
                                    type="range"
                                    min="2"
                                    max="20"
                                    value={field.strokeWidth || 6}
                                    onChange={(e) => 
                                      updateTextFieldProperty(field.id, 'strokeWidth', parseInt(e.target.value))
                                    }
                                    className="w-full"
                                  />
                                </div>

                                {/* Stroke Color */}
                                <div>
                                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Border Color</label>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="color"
                                      value={field.strokeColor || '#000000'}
                                      onChange={(e) => 
                                        updateTextFieldProperty(field.id, 'strokeColor', e.target.value)
                                      }
                                      className="w-10 h-10 rounded border cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {field.strokeColor || '#000000'}
                                    </span>
                                  </div>
                                </div>

                                {/* Text Alignment */}
                                <div>
                                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Text Alignment</label>
                                  <select
                                    value={field.textAlign || 'center'}
                                    onChange={(e) => 
                                      updateTextFieldProperty(field.id, 'textAlign', e.target.value as 'left' | 'center' | 'right')
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                  </select>
                                </div>

                                {/* Letter Spacing */}
                                <div>
                                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                    Letter Spacing: {field.letterSpacing || '0.05em'}
                                  </label>
                                  <input
                                    type="range"
                                    min="0"
                                    max="0.2"
                                    step="0.01"
                                    value={parseFloat(field.letterSpacing || '0.05')}
                                    onChange={(e) => 
                                      updateTextFieldProperty(field.id, 'letterSpacing', `${parseFloat(e.target.value)}em`)
                                    }
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          {selectedTemplate && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button 
                  onClick={() => setTextFields(prev => prev.map(f => ({ ...f, text: '' })))}
                  variant="outline"
                  className="w-full"
                >
                  Clear All Text
                </Button>
                <Button 
                  onClick={resetToMemeDefaults}
                  variant="outline"
                  className="w-full"
                >
                  Reset to Meme Defaults
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      )}


    </div>
  );
};
