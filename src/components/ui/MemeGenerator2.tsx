'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card } from './Card';
import { Button } from './Button';
import { MemeTemplate } from '../../lib/types/meme';
import { MEME_TEMPLATES } from '../../lib/data/templates';

interface TextElement {
  id: string;
  text: string;
  x: number; // percentage position (0-100)
  y: number; // percentage position (0-100)
  fontSize: number; // pixel size for base height of 600px
  color: string;
  fontFamily: string;
  fontWeight: string;
  strokeColor: string;
  strokeWidth: number; // pixel size for base height of 600px
}

export const MemeGenerator2: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [newText, setNewText] = useState('');
  const [imageBounds, setImageBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Update image bounds when image loads or resizes
  const updateImageBounds = useCallback(() => {
    if (!imageRef.current || !selectedTemplate) return;
    
    const imageRect = imageRef.current.getBoundingClientRect();
    const container = imageRef.current.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    setImageBounds({
      left: imageRect.left - containerRect.left,
      top: imageRect.top - containerRect.top,
      width: imageRect.width,
      height: imageRect.height
    });
  }, [selectedTemplate]);
  
  // Update bounds on mount, resize, and when template changes
  React.useEffect(() => {
    if (selectedTemplate) {
      // Small delay to ensure image is rendered
      const timer = setTimeout(updateImageBounds, 100);
      const handleResize = () => updateImageBounds();
      window.addEventListener('resize', handleResize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [selectedTemplate, updateImageBounds]);

  const handleTemplateSelect = useCallback((template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTextElements([]);
    setSelectedTextId(null);
    setNewText('');
  }, []);

  const handleAddText = useCallback(() => {
    if (!selectedTemplate || !newText.trim()) return;

    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      text: newText,
      x: 50, // Start at center
      y: 50,
      fontSize: 40,
      color: '#ffffff',
      fontFamily: 'Impact',
      fontWeight: 'bold',
      strokeColor: '#000000',
      strokeWidth: 4
    };

    setTextElements(prev => [...prev, newElement]);
    setSelectedTextId(newElement.id);
    setNewText('');
  }, [selectedTemplate, newText]);

  const handleTextClick = useCallback((e: React.MouseEvent, textId: string) => {
    e.stopPropagation();
    setSelectedTextId(textId);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedTextId(null);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, textId: string) => {
    e.stopPropagation();
    const element = textElements.find(t => t.id === textId);
    if (!element || !imageRef.current || !selectedTemplate) return;

    // Get the actual displayed image bounds (object-contain may center the image)
    const imageRect = imageRef.current.getBoundingClientRect();
    const imageWidth = imageRect.width;
    const imageHeight = imageRect.height;
    
    // Calculate offset relative to image bounds
    const offsetX = e.clientX - imageRect.left - (element.x / 100) * imageWidth;
    const offsetY = e.clientY - imageRect.top - (element.y / 100) * imageHeight;

    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
    setSelectedTextId(textId);
  }, [textElements, selectedTemplate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedTextId || !imageRef.current || !selectedTemplate) return;

    // Get the actual displayed image bounds
    const imageRect = imageRef.current.getBoundingClientRect();
    const imageWidth = imageRect.width;
    const imageHeight = imageRect.height;
    
    // Calculate position as percentage of image bounds
    const x = ((e.clientX - imageRect.left - dragOffset.x) / imageWidth) * 100;
    const y = ((e.clientY - imageRect.top - dragOffset.y) / imageHeight) * 100;

    // Clamp to image bounds (0-100%)
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setTextElements(prev =>
      prev.map(el =>
        el.id === selectedTextId ? { ...el, x: clampedX, y: clampedY } : el
      )
    );
  }, [isDragging, selectedTextId, dragOffset, selectedTemplate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTextChange = useCallback((textId: string, text: string) => {
    setTextElements(prev =>
      prev.map(el => (el.id === textId ? { ...el, text } : el))
    );
  }, []);

  const handleDeleteText = useCallback((textId: string) => {
    setTextElements(prev => prev.filter(el => el.id !== textId));
    if (selectedTextId === textId) {
      setSelectedTextId(null);
    }
  }, [selectedTextId]);

  const handleDownload = useCallback(() => {
    if (!selectedTemplate || !imageRef.current) return;

    // Recalculate image bounds right before download to ensure we have latest values
    const imageRect = imageRef.current.getBoundingClientRect();
    const container = imageRef.current.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const currentImageBounds = {
      left: imageRect.left - containerRect.left,
      top: imageRect.top - containerRect.top,
      width: imageRect.width,
      height: imageRect.height
    };
    
    // Verify we have valid bounds
    if (currentImageBounds.width === 0 || currentImageBounds.height === 0) {
      console.error('Invalid image bounds:', currentImageBounds);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Use the actual image dimensions (from the loaded image file)
      const actualWidth = img.naturalWidth;
      const actualHeight = img.naturalHeight;
      
      // Verify dimensions are valid
      if (actualWidth === 0 || actualHeight === 0) {
        console.error('Invalid image dimensions:', { actualWidth, actualHeight });
        return;
      }
      
      canvas.width = actualWidth;
      canvas.height = actualHeight;

      // Draw template image at its natural size
      ctx.drawImage(img, 0, 0, actualWidth, actualHeight);

      // CRITICAL: Use the CURRENT displayed image dimensions (recalculated above)
      // This ensures we use the exact same values as what's currently displayed
      const displayedImageWidth = currentImageBounds.width;
      const displayedImageHeight = currentImageBounds.height;
      
      // Debug: Log dimensions for verification
      console.log('Download calculations:', {
        template: { width: selectedTemplate.width, height: selectedTemplate.height },
        actual: { width: actualWidth, height: actualHeight },
        displayed: { width: displayedImageWidth, height: displayedImageHeight },
        currentImageBounds,
        scaleX: actualWidth / displayedImageWidth,
        scaleY: actualHeight / displayedImageHeight
      });
      
      // IMPORTANT: The percentages (element.x, element.y) are relative to the DISPLAYED image bounds
      // The drag handler calculates: x = ((e.clientX - imageRect.left - dragOffset.x) / imageWidth) * 100
      // So element.x and element.y are percentages (0-100) of the displayed image dimensions
      // 
      // In preview rendering: 
      //   textX = imageBounds.left + (element.x / 100) * imageBounds.width
      //   textY = imageBounds.top + (element.y / 100) * imageBounds.height
      // The imageBounds.left/top account for object-contain centering within the container
      //
      // In download, we draw directly on the image canvas starting at (0,0)
      // So we convert: percentage -> displayed coordinates -> actual coordinates
      
      // Calculate font size scaling (EXACTLY the same as preview)
      // Preview: scaleFactor = imageBounds.height / 600
      // Preview: scaledFontSize = element.fontSize * scaleFactor
      const baseHeight = 600;
      const previewScaleFactor = displayedImageHeight / baseHeight;
      
      // Calculate scale factors from displayed to actual image
      // CRITICAL: If aspect ratios don't match, we need to use the same scale for both X and Y
      // to maintain the relative positioning. However, if the image is stretched, we might need
      // different scales. Let's use uniform scaling based on the smaller dimension to maintain aspect.
      const scaleX = actualWidth / displayedImageWidth;
      const scaleY = actualHeight / displayedImageHeight;
      
      // For font size, scale from displayed height to actual height
      const fontScaleToActual = actualHeight / displayedImageHeight;

      // Draw all text elements
      textElements.forEach(element => {
        // CRITICAL: Match preview positioning exactly
        // Preview calculates: textX = imageBounds.left + (element.x / 100) * imageBounds.width
        //                     textY = imageBounds.top + (element.y / 100) * imageBounds.height
        // Then positions with: left: ${textX}px, top: ${textY}px, transform: translate(-50%, -50%)
        // This means the CENTER of the text is at (textX, textY) relative to the container
        //
        // In download, we draw directly on the image canvas (starting at 0,0)
        // So we need: x = (element.x / 100) * displayedImageWidth * scaleX
        //            y = (element.y / 100) * displayedImageHeight * scaleY
        // And use textAlign='center', textBaseline='middle' to center the text at (x, y)
        
        // Convert percentage to displayed image coordinates
        const displayedX = (element.x / 100) * displayedImageWidth;
        const displayedY = (element.y / 100) * displayedImageHeight;
        
        // Scale to actual image coordinates
        const x = displayedX * scaleX;
        const y = displayedY * scaleY;
        
        // Calculate font size to match preview EXACTLY
        // Preview: scaledFontSize = element.fontSize * (displayedImageHeight / 600)
        // Download: fontSize = element.fontSize * (displayedImageHeight / 600) * (actualHeight / displayedImageHeight)
        //          = element.fontSize * (actualHeight / 600)
        const previewFontSize = element.fontSize * previewScaleFactor;
        const fontSize = previewFontSize * fontScaleToActual;
        const previewStrokeWidth = element.strokeWidth * previewScaleFactor;
        const strokeWidth = previewStrokeWidth * fontScaleToActual;

        ctx.save();
        
        // Set font exactly as preview
        ctx.font = `${element.fontWeight} ${fontSize}px ${element.fontFamily}, Arial, sans-serif`;
        ctx.textAlign = 'center'; // Matches preview textAlign: 'center'
        ctx.textBaseline = 'middle'; // Centers vertically, matching transform: translate(-50%, -50%)
        
        // Set stroke properties to match preview textShadow
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = Math.max(1, strokeWidth);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.miterLimit = 2;
        
        // Set fill color
        ctx.fillStyle = element.color;

        // Draw text: stroke first (outline), then fill (text)
        // This matches preview where textShadow creates outline, then text renders on top
        ctx.strokeText(element.text, x, y);
        ctx.fillText(element.text, x, y);
        
        ctx.restore();
      });

      // Download
      const link = document.createElement('a');
      link.download = `meme-${selectedTemplate.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = selectedTemplate.src;
  }, [selectedTemplate, textElements]);

  const selectedText = textElements.find(t => t.id === selectedTextId);

  return (
    <div className="max-w-7xl mx-auto p-6 pb-16">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Meme Generator 2
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a template, add your text, drag to reposition, and download
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Template Selection */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Choose Template</h2>
            <div className="grid grid-cols-1 gap-3">
              {MEME_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 border-2 rounded-lg transition-all text-left ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={template.src}
                      alt={template.name}
                      width={60}
                      height={45}
                      className="w-15 h-11 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </div>
                      {template.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {template.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Add Text Section */}
          {selectedTemplate && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add Text</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddText();
                    }
                  }}
                  placeholder="Enter your text..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleAddText} className="w-full" disabled={!newText.trim()}>
                  Add Text
                </Button>
              </div>
            </Card>
          )}

          {/* Text Elements List */}
          {selectedTemplate && textElements.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Text Elements</h2>
              <div className="space-y-3">
                {textElements.map((element) => (
                  <div
                    key={element.id}
                    className={`p-3 border rounded-lg transition-all ${
                      selectedTextId === element.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={element.text}
                        onChange={(e) => handleTextChange(element.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Text content"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Size:
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={element.fontSize}
                          onChange={(e) => {
                            setTextElements(prev =>
                              prev.map(el =>
                                el.id === element.id
                                  ? { ...el, fontSize: parseInt(e.target.value) }
                                  : el
                              )
                            );
                          }}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-10">
                          {element.fontSize}px
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          Color:
                        </label>
                        <input
                          type="color"
                          value={element.color}
                          onChange={(e) => {
                            setTextElements(prev =>
                              prev.map(el =>
                                el.id === element.id ? { ...el, color: e.target.value } : el
                              )
                            );
                          }}
                          className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteText(element.id)}
                        className="w-full px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-red-200 dark:border-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Center - Canvas Preview */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Preview</h2>
              {selectedTemplate && (
                <Button onClick={handleDownload} size="lg" disabled={textElements.length === 0}>
                  Download Meme
                </Button>
              )}
            </div>

            {selectedTemplate ? (
              <div
                ref={canvasRef}
                className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div className="relative" style={{ width: '100%', paddingBottom: `${(selectedTemplate.height / selectedTemplate.width) * 100}%` }}>
                  <Image
                    ref={imageRef}
                    src={selectedTemplate.src}
                    alt={selectedTemplate.name}
                    fill
                    className="object-contain"
                    draggable={false}
                    onLoad={updateImageBounds}
                  />
                  {textElements.map((element) => {
                    const isSelected = selectedTextId === element.id;
                    // Calculate responsive font size based on actual displayed image dimensions
                    // Font size is stored as pixels for a base height of 600px
                    const baseHeight = 600;
                    const scaleFactor = imageBounds.height / baseHeight;
                    const scaledFontSize = element.fontSize * scaleFactor;
                    const scaledStrokeWidth = element.strokeWidth * scaleFactor;
                    
                    // Position text relative to the image bounds
                    // element.x and element.y are percentages (0-100) of the displayed image
                    const textX = imageBounds.left + (element.x / 100) * imageBounds.width;
                    const textY = imageBounds.top + (element.y / 100) * imageBounds.height;
                    
                    return (
                      <div
                        key={element.id}
                        style={{
                          position: 'absolute',
                          left: `${textX}px`,
                          top: `${textY}px`,
                          transform: 'translate(-50%, -50%)',
                          cursor: isDragging && isSelected ? 'grabbing' : 'grab',
                          userSelect: 'none',
                          zIndex: isSelected ? 10 : 1,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, element.id)}
                        onClick={(e) => handleTextClick(e, element.id)}
                      >
                        <div
                          style={{
                            position: 'relative',
                            display: 'inline-block',
                          }}
                        >
                          <div
                            style={{
                              color: element.color,
                              fontFamily: element.fontFamily,
                              fontWeight: element.fontWeight,
                              fontSize: `${scaledFontSize}px`,
                              textShadow: `-${scaledStrokeWidth}px -${scaledStrokeWidth}px 0 ${element.strokeColor},
                                           ${scaledStrokeWidth}px -${scaledStrokeWidth}px 0 ${element.strokeColor},
                                           -${scaledStrokeWidth}px ${scaledStrokeWidth}px 0 ${element.strokeColor},
                                           ${scaledStrokeWidth}px ${scaledStrokeWidth}px 0 ${element.strokeColor}`,
                              whiteSpace: 'nowrap',
                              pointerEvents: 'none',
                              textAlign: 'center',
                            }}
                          >
                            {element.text}
                          </div>
                          {isSelected && (
                            <div
                              className="absolute border-2 border-blue-500 border-dashed rounded"
                              style={{
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 'calc(100% + 8px)',
                                height: 'calc(100% + 8px)',
                                pointerEvents: 'none',
                              }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {textElements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-400 dark:text-gray-500 text-center px-4">
                      Add text using the panel on the left, then drag it to position
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-400 dark:text-gray-500">
                  Select a template to get started
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

