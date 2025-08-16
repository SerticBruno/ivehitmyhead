'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { TemplateBrowser } from './TemplateBrowser';
import { TemplateManager } from './TemplateManager';
import { MemeTemplate, TextField } from '../../lib/types/meme';
import { MEME_TEMPLATES } from '../../lib/data/templates';
import { 
  initializeTextFields, 
  calculateFontSize, 
  percentageToPixels, 
  getTemplateDefaults,
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
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MemeTemplate | null>(null);



  const handleTextChange = useCallback((fieldId: string, text: string) => {
    setTextFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, text } : field
      )
    );
  }, []);

  const handleTemplateSelect = useCallback((template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTextFields(initializeTextFields(template));
    setShowTemplateBrowser(false);
  }, []);

  const handleCreateTemplate = useCallback(() => {
    setEditingTemplate(null);
    setShowTemplateManager(true);
    setShowTemplateBrowser(false);
  }, []);

  const handleEditTemplate = useCallback((template: MemeTemplate) => {
    setEditingTemplate(template);
    setShowTemplateManager(true);
    setShowTemplateBrowser(false);
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
      return isPointInTextField(x, y, field, rect.width, rect.height);
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
        e.currentTarget.style.cursor = 'move';
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

    const img = new Image();
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

        ctx.font = `${field.fontSize * scale}px Impact, Arial, sans-serif`;
        ctx.fillStyle = field.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Convert percentage positions to actual canvas coordinates
        const textX = (field.x / 100) * containerWidth;
        const textY = (field.y / 100) * containerHeight;

        // Draw stroke
        ctx.strokeText(field.text, textX, textY);
        // Draw fill
        ctx.fillText(field.text, textX, textY);
      });

      // Draw text containers and resize handles for selected field or hovered field
      const fieldToShow = activeField || hoveredField;
      if (fieldToShow) {
        const selectedField = textFields.find(f => f.id === fieldToShow);
        if (selectedField) {
          const containerX = (selectedField.x / 100) * containerWidth;
          const containerY = (selectedField.y / 100) * containerHeight;
          const containerWidth_px = (selectedField.width / 100) * containerWidth;
          const containerHeight_px = (selectedField.height / 100) * containerHeight;

          // Draw container border
          const borderColor = activeField === fieldToShow ? '#007bff' : '#6b7280';
          const borderWidth = activeField === fieldToShow ? 2 : 1;
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderWidth;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            containerX - containerWidth_px / 2,
            containerY - containerHeight_px / 2,
            containerWidth_px,
            containerHeight_px
          );
          ctx.setLineDash([]);

          // Draw resize handles
          const handleSize = 12; // Increased size for easier grabbing
          ctx.fillStyle = borderColor;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;

          // Add visual indicator for resize mode
          if (isResizing) {
            ctx.fillStyle = '#ff6b6b';
            ctx.font = `${12 * scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('Resizing...', containerX, containerY - containerHeight_px / 2 - 20);
            ctx.fillStyle = borderColor; // Reset fill color
          } else if (isDragging) {
            ctx.fillStyle = '#4ecdc4';
            ctx.font = `${12 * scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('Dragging...', containerX, containerY - containerHeight_px / 2 - 20);
            ctx.fillStyle = borderColor; // Reset fill color
          }

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
    };
    img.src = selectedTemplate.src;
  }, [selectedTemplate, textFields, activeField, hoveredField, isResizing, isDragging]);



  // Re-render canvas when selectedTemplate or text fields change
  React.useEffect(() => {
    renderCanvas();
  }, [renderCanvas, selectedTemplate]);

  // Handle window resize and container size changes
  React.useEffect(() => {
    const handleResize = () => {
      renderCanvas();
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

  // Handle click outside dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && event.target instanceof Element) {
        const dropdown = document.querySelector('[data-dropdown]');
        if (dropdown && !dropdown.contains(event.target)) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Meme Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a template, add your text, and create hilarious memes!
        </p>
      </div>

      {/* Template Management UI */}
      {showTemplateBrowser && (
        <TemplateBrowser
          onSelectTemplate={handleTemplateSelect}
          onCreateTemplate={handleCreateTemplate}
          onEditTemplate={handleEditTemplate}
        />
      )}

      {showTemplateManager && (
        <TemplateManager
          onSave={handleSaveTemplate}
          onCancel={handleCancelTemplate}
          existingTemplate={editingTemplate || undefined}
        />
      )}

      {!showTemplateBrowser && !showTemplateManager && (
        <div className="mb-6 flex justify-center">
          <Button onClick={() => setShowTemplateBrowser(true)} size="lg">
            Browse Templates
          </Button>
        </div>
      )}

      {!showTemplateBrowser && !showTemplateManager && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[80vh]">
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-1 bg-gray-50">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">🎭</div>
                    <p className="text-lg">Select a template to get started</p>
                  </div>
                </div>
              )}
             
             {selectedTemplate && (
               <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
                 Hover over text to see handles • Drag text to move • Drag corner handles to resize • Use Select button to activate fields
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
                        <img
                          src={selectedTemplate.src}
                          alt={selectedTemplate.name}
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
                        <img
                          src={template.src}
                          alt={template.name}
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
                  <div key={field.id} className={`space-y-3 p-3 rounded-lg border-2 transition-colors ${
                    activeField === field.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <Input
                        label={`${field.id.charAt(0).toUpperCase() + field.id.slice(1)} Text`}
                        value={field.text}
                        onChange={(e) => handleTextChange(field.id, e.target.value)}
                        placeholder={`Enter ${field.id} text...`}
                        className="flex-1"
                      />
                      <button
                        onClick={() => setActiveField(field.id)}
                        className={`ml-2 px-3 py-2 text-xs rounded transition-colors ${
                          activeField === field.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {activeField === field.id ? 'Active' : 'Select'}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Font Size: {field.fontSize}px
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="80"
                          value={field.fontSize}
                          onChange={(e) => 
                            setTextFields(prev => 
                              prev.map(f => 
                                f.id === field.id 
                                  ? { ...f, fontSize: parseInt(e.target.value) }
                                  : f
                              )
                            )
                          }
                          className="w-24"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Container Width: {field.width.toFixed(1)}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          step="0.5"
                          value={field.width}
                          onChange={(e) => 
                            setTextFields(prev => 
                              prev.map(f => 
                                f.id === field.id 
                                  ? { ...f, width: parseFloat(e.target.value) }
                                  : f
                              )
                            )
                          }
                          className="w-24"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Container Height: {field.height.toFixed(1)}%
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="40"
                          step="0.5"
                          value={field.height}
                          onChange={(e) => 
                            setTextFields(prev => 
                              prev.map(f => 
                                f.id === field.id 
                                  ? { ...f, height: parseFloat(e.target.value) }
                                  : f
                              )
                            )
                          }
                          className="w-24"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          Color:
                        </label>
                        <input
                          type="color"
                          value={field.color}
                          onChange={(e) => 
                            setTextFields(prev => 
                              prev.map(f => 
                                f.id === field.id 
                                  ? { ...f, color: e.target.value }
                                  : f
                              )
                            )
                          }
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
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
                  onClick={() => {
                    if (selectedTemplate) {
                      setTextFields(initializeTextFields(selectedTemplate));
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Reset to Default
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
