'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';

interface TextField {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  isDragging: boolean;
}

interface MemeTemplate {
  id: string;
  name: string;
  src: string;
  textFields: Omit<TextField, 'text' | 'isDragging'>[];
}

const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'ab',
    name: 'AB Template',
    src: '/images/templates/ab.png',
    textFields: [
      { id: 'top', x: 50, y: 20, fontSize: 48, color: '#ffffff' },
      { id: 'bottom', x: 50, y: 80, fontSize: 48, color: '#ffffff' }
    ]
  },
  {
    id: 'imonceagain',
    name: 'I\'m Once Again Template',
    src: '/images/templates/imonceagain.png',
    textFields: [
      { id: 'top', x: 50, y: 15, fontSize: 36, color: '#ffffff' },
      { id: 'bottom', x: 50, y: 85, fontSize: 36, color: '#ffffff' }
    ]
  }
];

export const MemeGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [textFields, setTextFields] = useState<TextField[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);



  const handleTextChange = useCallback((fieldId: string, text: string) => {
    setTextFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, text } : field
      )
    );
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Find if clicking on a text field
    const clickedField = textFields.find(field => {
      const fieldX = field.x;
      const fieldY = field.y;
      const fieldWidth = 20; // Approximate text width
      const fieldHeight = field.fontSize / 100 * 100; // Convert font size to percentage

      return (
        x >= fieldX - fieldWidth/2 &&
        x <= fieldX + fieldWidth/2 &&
        y >= fieldY - fieldHeight/2 &&
        y <= fieldY + fieldHeight/2
      );
    });

    if (clickedField) {
      setActiveField(clickedField.id);
      setIsDragging(true);
      setDragOffset({
        x: x - clickedField.x,
        y: y - clickedField.y
      });
    }
  }, [textFields]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !activeField || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTextFields(prev => 
      prev.map(field => 
        field.id === activeField 
          ? { 
              ...field, 
              x: Math.max(0, Math.min(100, x - dragOffset.x)),
              y: Math.max(0, Math.min(100, y - dragOffset.y))
            }
          : field
      )
    );
  }, [isDragging, activeField, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveField(null);
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
    };
    img.src = selectedTemplate.src;
  }, [selectedTemplate, textFields]);

  const handleTemplateSelect = useCallback((template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTextFields(
      template.textFields.map(field => ({
        ...field,
        text: '',
        isDragging: false
      }))
    );
  }, []);

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
                    onMouseLeave={handleMouseUp}
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
                 Click and drag text to reposition it on the meme
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
                  <div key={field.id} className="space-y-3">
                    <Input
                      label={`${field.id.charAt(0).toUpperCase() + field.id.slice(1)} Text`}
                      value={field.text}
                      onChange={(e) => handleTextChange(field.id, e.target.value)}
                      placeholder={`Enter ${field.id} text...`}
                    />
                    
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
                  onClick={() => setTextFields(prev => prev.map(f => ({ ...f, fontSize: 48, color: '#ffffff' })))}
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
    </div>
  );
};
