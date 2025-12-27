'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import MemeCanvasController from '@/lib/meme-canvas/MemeCanvasController';
import TextElement from '@/lib/meme-canvas/TextElement';
import type MemeElement from '@/lib/meme-canvas/MemeElement';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, Plus, Trash2, Type } from 'lucide-react';
import { MEME_TEMPLATES } from '@/lib/data/templates';
import type { MemeTemplate } from '@/lib/types/meme';
import type { TextField } from '@/lib/types/meme';

interface AdvancedMemeGeneratorProps {
  templates?: MemeTemplate[];
}

export const AdvancedMemeGenerator: React.FC<AdvancedMemeGeneratorProps> = ({
  templates = MEME_TEMPLATES,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<MemeCanvasController | null>(null);
  const unregisterRef = useRef<(() => void) | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(
    null
  );
  const [textInput, setTextInput] = useState('');
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [allTextElements, setAllTextElements] = useState<TextElement[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0); // Force re-render when element updates

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const controller = new MemeCanvasController();
    const unregister = controller.init(canvasRef.current);
    controllerRef.current = controller;
    unregisterRef.current = unregister;

    // Listen for input focus requests
    controller.listen('inputFocusRequest', (data) => {
      if (data.inputName === 'text') {
        const selected = controller.selectedElements[0];
        if (selected && selected instanceof TextElement) {
          setSelectedElement(selected);
          setTextInput(selected.settings.text.value);
          setShowTextInput(true);
        }
      }
    });

    // Listen for selection changes
    controller.listen('selectedElementsChange', () => {
      const selected = controller.selectedElements[0];
      if (selected && selected instanceof TextElement) {
        setSelectedElement(selected);
        setTextInput(selected.settings.text.value);
        setShowTextInput(true);
      } else {
        setSelectedElement(null);
        setShowTextInput(false);
      }
      // Update text elements list
      const elements = controller.elements.filter(
        (e) => e instanceof TextElement
      ) as TextElement[];
      setAllTextElements(elements);
    });

    // Listen for elements list changes to update sidebar
    controller.listen('elementsListChanged', () => {
      const elements = controller.elements.filter(
        (e) => e instanceof TextElement
      ) as TextElement[];
      setAllTextElements(elements);
    });

    // Listen for element updates to keep UI in sync
    controller.listen('elementsUpdated', () => {
      // Force re-render to update UI when element settings change
      setUpdateCounter(prev => prev + 1);
      // Update selected element reference if it's still selected
      const selected = controller.selectedElements[0];
      if (selected && selected instanceof TextElement) {
        setSelectedElement(selected);
        setTextInput(selected.settings.text.value);
      }
    });

    // Handle window resize to recalculate canvas size
    const handleResize = () => {
      if (controller.image) {
        controller.resize(controller.image.width, controller.image.height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      unregister();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load template image and create text elements from template
  const loadTemplate = useCallback(
    (template: MemeTemplate) => {
      if (!controllerRef.current) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!controllerRef.current) return;
        controllerRef.current.changeImage(img);
        setSelectedTemplate(template);

        // Clear existing elements
        controllerRef.current.clear();

        // Create text elements from template textFields
        if (template.textFields && template.textFields.length > 0) {
          // Wait for canvas to be ready
          setTimeout(() => {
            if (!controllerRef.current) return;

            const canvas = controllerRef.current.canvas;
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            template.textFields.forEach((field: any) => {
              // Convert percentage positions to pixel positions
              const x = (field.x / 100) * canvasWidth;
              const y = (field.y / 100) * canvasHeight;
              const width = (field.width / 100) * canvasWidth;
              const height = (field.height / 100) * canvasHeight;
              
              // Convert fontSize from pixels (for base 600px height) to actual canvas pixels
              // fontSize in template is in pixels for a 600px high image
              const fontSize = field.fontSize * (canvasHeight / 600);

              // Create text element
              if (!controllerRef.current) return;
              const textElement = new TextElement(controllerRef.current);
              
              // Set size FIRST before any other operations to prevent shifting
              // Force the width/height to match template
              textElement.width = Math.max(Math.round(width), 50);
              textElement.height = Math.max(Math.round(height), 30);
              // Mark that size has been set by template (prevents auto-resize)
              textElement.markSizeAsUserSet();
              
              // Set position AFTER size is set
              textElement.x = Math.round(x);
              textElement.y = Math.round(y);
              
              // Set text properties (text will wrap within the set size)
              // Add placeholder text based on field index (Text 1, Text 2, etc.)
              const fieldIndex = template.textFields.indexOf(field);
              const placeholderText = `Text ${fieldIndex + 1}`;
              
              controllerRef.current!.updateElement(textElement, 'text', {
                value: placeholderText,
                multiline: true,
              });
              
              controllerRef.current!.updateElement(textElement, 'font_family', field.fontFamily || template.defaultFont || 'Impact');
              controllerRef.current!.updateElement(textElement, 'font_size', fontSize);
              controllerRef.current!.updateElement(textElement, 'color', field.color || template.defaultColor || '#ffffff');
              controllerRef.current!.updateElement(textElement, 'stroke', field.strokeColor || '#000000');
              controllerRef.current!.updateElement(textElement, 'stroke_width', (field.strokeWidth || 6) * (canvasHeight / 600)); // Scale stroke width
              
              // Set alignment
              if (field.textAlign) {
                const alignMap: Record<string, 'left' | 'center' | 'right'> = {
                  left: 'left',
                  center: 'center',
                  right: 'right',
                };
                controllerRef.current!.updateElement(textElement, 'horizontal_align', {
                  valid: ['left', 'center', 'right'] as const,
                  current: alignMap[field.textAlign] || 'center',
                });
              }
              
              // Set rotation if specified
              if (field.rotation) {
                textElement.rotation = field.rotation;
              }

              // Add to controller
              controllerRef.current!.addElement(textElement);
            });

            controllerRef.current!.emit('elementsListChanged');
            controllerRef.current!.requestFrame();
          }, 100);
        }
      };
      img.onerror = () => {
        console.error('Failed to load template image:', template.src);
      };
      img.src = template.src;
    },
    []
  );

  // Add text element
  const addText = useCallback(() => {
    if (!controllerRef.current) return;

    controllerRef.current.createElement(TextElement);
  }, []);

  // Update text
  const updateText = useCallback(() => {
    if (!controllerRef.current || !selectedElement) return;

    if (selectedElement instanceof TextElement) {
      controllerRef.current.updateElement(selectedElement, 'text', {
        value: textInput,
        multiline: true,
      });
    }
  }, [selectedElement, textInput]);

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (!controllerRef.current) return;

    const selected = controllerRef.current.selectedElements;
    if (selected.length > 0) {
      controllerRef.current.removeElements(selected);
      setSelectedElement(null);
      setShowTextInput(false);
    }
  }, []);

  // Download meme
  const downloadMeme = useCallback(() => {
    if (!controllerRef.current) return;

    const name = selectedTemplate?.name || 'meme';
    controllerRef.current.export(name, 'png', false);
  }, [selectedTemplate]);

  // Handle text input change
  useEffect(() => {
    if (selectedElement && showTextInput) {
      updateText();
    }
  }, [textInput, selectedElement, showTextInput, updateText]);

  return (
    <div className="max-w-7xl mx-auto p-4" style={{ maxHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="text-center mb-4 flex-shrink-0">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Advanced Meme Generator
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Choose a template, add text, and create your meme
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0" style={{ height: '100%', overflow: 'hidden' }}>
        {/* Left side - Canvas */}
        <div className="flex flex-col min-h-0 flex-[2]" style={{ height: '100%', overflow: 'hidden', minWidth: 0 }}>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-800 flex-1 flex flex-col min-h-0" style={{ height: '100%', overflow: 'hidden' }}>
            <div 
              className="flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-auto flex-1 min-h-0" 
              style={{ 
                height: '100%', 
                width: '100%',
                position: 'relative',
                flexShrink: 0
              }}
            >
              <canvas
                ref={canvasRef}
                className="border border-gray-300 dark:border-gray-700 rounded"
                style={{ 
                  display: 'block', 
                  maxWidth: 'calc(100% - 0px)', 
                  maxHeight: 'calc(100% - 0px)', 
                  height: 'auto',
                  width: 'auto',
                  margin: '0 auto',
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
            </div>

            {/* Canvas controls */}
            <div className="mt-4 flex gap-2 flex-wrap flex-shrink-0">
              <Button onClick={addText} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Text
              </Button>
              <Button
                onClick={deleteSelected}
                variant="outline"
                size="sm"
                disabled={!selectedElement}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button
                onClick={downloadMeme}
                variant="primary"
                size="sm"
                disabled={!selectedTemplate}
                className="ml-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex flex-col min-h-0 flex-1" style={{ height: '100%', overflow: 'hidden', minWidth: 0, maxWidth: '100%' }}>
          <div className="space-y-4 overflow-y-auto flex-1 min-h-0" style={{ height: '100%', overflowY: 'auto' }}>
          {/* Template selection */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Templates</h2>
            <div className="relative">
              <button
                onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {selectedTemplate ? (
                    <>
                      <img
                        src={selectedTemplate.src}
                        alt={selectedTemplate.name}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                      <span className="font-medium text-left truncate">{selectedTemplate.name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Select a template...</span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                    isTemplateDropdownOpen ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isTemplateDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsTemplateDropdownOpen(false)}
                  />
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          loadTemplate(template);
                          setIsTemplateDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                      >
                        <img
                          src={template.src}
                          alt={template.name}
                          className="w-16 h-16 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium truncate">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Text Fields List */}
          {selectedTemplate && allTextElements.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type className="w-5 h-5" />
                Text Fields ({allTextElements.length})
              </h2>
              <div className="space-y-2">
                {allTextElements.map((element, index) => {
                  const isSelected = selectedElement === element;
                  const textValue = element.settings.text.value || `Text ${index + 1}`;
                  const displayText = textValue.length > 30 
                    ? textValue.substring(0, 30) + '...' 
                    : textValue || `Text ${index + 1}`;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (controllerRef.current) {
                          controllerRef.current.selectedElements = [element];
                          controllerRef.current.emit('selectedElementsChange');
                          setSelectedElement(element);
                          setTextInput(element.settings.text.value);
                          setShowTextInput(true);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {displayText || `Text Field ${index + 1}`}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {element.settings.font_family} • {Math.round(element.settings.font_size)}px
                          </div>
                        </div>
                        {isSelected && (
                          <div className="ml-2 flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Text input */}
          {showTextInput && selectedElement && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Type className="w-5 h-5" />
                Edit Text
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Text (use Enter for new lines)
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={4}
                    placeholder="Enter your text..."
                  />
                </div>
                {selectedElement instanceof TextElement && (() => {
                  // Get current element from controller to ensure we have latest values
                  const currentElement = controllerRef.current?.selectedElements[0];
                  const element = (currentElement instanceof TextElement ? currentElement : selectedElement) as TextElement;
                  const fontSize = element.settings.font_size;
                  const strokeWidth = element.settings.stroke_width;
                  
                  return (
                    <div className="space-y-4">
                      {/* Font Size with Slider and Input */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">
                            Font Size
                          </label>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.round(fontSize)}px
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (controllerRef.current) {
                                const newSize = Math.max(12, fontSize - 2);
                                controllerRef.current.updateElement(
                                  element,
                                  'font_size',
                                  newSize
                                );
                              }
                            }}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          step="1"
                          value={fontSize}
                          onChange={(e) => {
                            if (controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'font_size',
                                Number(e.target.value)
                              );
                            }
                          }}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (controllerRef.current) {
                              const newSize = Math.min(120, fontSize + 2);
                              controllerRef.current.updateElement(
                                element,
                                'font_size',
                                newSize
                              );
                            }
                          }}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          +
                        </button>
                        <Input
                          type="number"
                          min="12"
                          max="120"
                          value={Math.round(fontSize)}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (!isNaN(value) && value >= 12 && value <= 120 && controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'font_size',
                                value
                              );
                            }
                          }}
                          onBlur={(e) => {
                            // Ensure value is valid on blur
                            const value = Number(e.target.value);
                            if (isNaN(value) || value < 12 || value > 120) {
                              if (controllerRef.current) {
                                const clampedValue = Math.max(12, Math.min(120, value || fontSize));
                                controllerRef.current.updateElement(
                                  element,
                                  'font_size',
                                  clampedValue
                                );
                              }
                            }
                          }}
                          className="w-20"
                        />
                      </div>
                    </div>
                    {/* Font Family */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Font Family
                      </label>
                      <select
                        value={element.settings.font_family}
                        onChange={(e) => {
                          if (controllerRef.current) {
                            controllerRef.current.updateElement(
                              element,
                              'font_family',
                              e.target.value
                            );
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Impact">Impact</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="sans-serif">Sans Serif</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>

                    {/* Text Color */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Text Color
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={element.settings.color}
                          onChange={(e) => {
                            if (controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'color',
                                e.target.value
                              );
                            }
                          }}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={element.settings.color}
                          onChange={(e) => {
                            if (controllerRef.current && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                              controllerRef.current.updateElement(
                                element,
                                'color',
                                e.target.value
                              );
                            }
                          }}
                          placeholder="#FFFFFF"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>

                    {/* Stroke Color */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Stroke Color
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          value={element.settings.stroke}
                          onChange={(e) => {
                            if (controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'stroke',
                                e.target.value
                              );
                            }
                          }}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={element.settings.stroke}
                          onChange={(e) => {
                            if (controllerRef.current && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
                              controllerRef.current.updateElement(
                                element,
                                'stroke',
                                e.target.value
                              );
                            }
                          }}
                          placeholder="#000000"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>

                    {/* Stroke Width */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">
                          Stroke Width
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {Math.round(strokeWidth)}px
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (controllerRef.current) {
                              const newWidth = Math.max(0, strokeWidth - 1);
                              controllerRef.current.updateElement(
                                element,
                                'stroke_width',
                                newWidth
                              );
                            }
                          }}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.5"
                          value={strokeWidth}
                          onChange={(e) => {
                            if (controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'stroke_width',
                                Number(e.target.value)
                              );
                            }
                          }}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (controllerRef.current) {
                              const newWidth = Math.min(20, strokeWidth + 1);
                              controllerRef.current.updateElement(
                                element,
                                'stroke_width',
                                newWidth
                              );
                            }
                          }}
                          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          +
                        </button>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={strokeWidth}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (!isNaN(value) && value >= 0 && value <= 20 && controllerRef.current) {
                              controllerRef.current.updateElement(
                                element,
                                'stroke_width',
                                value
                              );
                            }
                          }}
                          onBlur={(e) => {
                            // Ensure value is valid on blur
                            const value = Number(e.target.value);
                            if (isNaN(value) || value < 0 || value > 20) {
                              if (controllerRef.current) {
                                const clampedValue = Math.max(0, Math.min(20, value || strokeWidth));
                                controllerRef.current.updateElement(
                                  element,
                                  'stroke_width',
                                  clampedValue
                                );
                              }
                            }
                          }}
                          className="w-20"
                        />
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Text Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => {
                              if (controllerRef.current) {
                                controllerRef.current.updateElement(
                                  element,
                                  'horizontal_align',
                                  {
                                    valid: ['left', 'center', 'right'] as const,
                                    current: align,
                                  }
                                );
                              }
                            }}
                            className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                              element.settings.horizontal_align.current === align
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          >
                            {align.charAt(0).toUpperCase() + align.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  );
                })()}
              </div>
            </div>
          )}

          </div>
        </div>
      </div>
    </div>
  );
};

