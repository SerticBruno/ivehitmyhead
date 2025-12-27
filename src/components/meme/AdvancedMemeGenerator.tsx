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
              
              // Set text properties first (before position/size so size calculation works)
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

              // Set position and size after properties are set
              // The element will auto-size to text, but we want to use template size
              // So we set it after to override the auto-size
              textElement.x = Math.round(x);
              textElement.y = Math.round(y);
              // Force the width/height to match template (text will be empty so it will be small)
              // We'll let the user resize or the text will grow as they type
              textElement.width = Math.max(Math.round(width), 50);
              textElement.height = Math.max(Math.round(height), 30);

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
    <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ maxHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="text-center mb-4 md:mb-6 flex-shrink-0">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Advanced Meme Generator
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Choose a template, add text, and create your meme
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-0">
        {/* Left side - Canvas */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2 md:p-4 border border-gray-200 dark:border-gray-800 flex-1 flex flex-col min-h-0">
            <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 md:p-4 overflow-auto flex-1 min-h-0" style={{ maxHeight: '100%' }}>
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-gray-300 dark:border-gray-700 rounded"
                style={{ display: 'block', maxHeight: '100%' }}
              />
            </div>

            {/* Canvas controls */}
            <div className="mt-2 md:mt-4 flex gap-2 flex-wrap flex-shrink-0">
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
        <div className="space-y-4 md:space-y-6 overflow-y-auto" style={{ maxHeight: '100%' }}>
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
                {selectedElement instanceof TextElement && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Font Size
                      </label>
                      <Input
                        type="number"
                        value={selectedElement.settings.font_size}
                        onChange={(e) => {
                          if (controllerRef.current) {
                            controllerRef.current.updateElement(
                              selectedElement,
                              'font_size',
                              Number(e.target.value)
                            );
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Font Family
                      </label>
                      <select
                        value={selectedElement.settings.font_family}
                        onChange={(e) => {
                          if (controllerRef.current) {
                            controllerRef.current.updateElement(
                              selectedElement,
                              'font_family',
                              e.target.value
                            );
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="sans-serif">Sans Serif</option>
                        <option value="Impact">Impact</option>
                        <option value="Arial">Arial</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Times New Roman">Times New Roman</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Text Color
                      </label>
                      <Input
                        type="color"
                        value={selectedElement.settings.color}
                        onChange={(e) => {
                          if (controllerRef.current) {
                            controllerRef.current.updateElement(
                              selectedElement,
                              'color',
                              e.target.value
                            );
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Stroke Color
                      </label>
                      <Input
                        type="color"
                        value={selectedElement.settings.stroke}
                        onChange={(e) => {
                          if (controllerRef.current) {
                            controllerRef.current.updateElement(
                              selectedElement,
                              'stroke',
                              e.target.value
                            );
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Stroke Width
                      </label>
                      <Input
                        type="number"
                        value={selectedElement.settings.stroke_width}
                        onChange={(e) => {
                          if (controllerRef.current) {
                            controllerRef.current.updateElement(
                              selectedElement,
                              'stroke_width',
                              Number(e.target.value)
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

