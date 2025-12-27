'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import MemeCanvasController from '@/lib/meme-canvas/MemeCanvasController';
import TextElement from '@/lib/meme-canvas/TextElement';
import type MemeElement from '@/lib/meme-canvas/MemeElement';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, Plus, Trash2, Type } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  src: string;
}

interface AdvancedMemeGeneratorProps {
  templates?: Template[];
}

const defaultTemplates: Template[] = [
  {
    id: 'ab',
    name: 'AB',
    src: '/images/templates/ab.png',
  },
  {
    id: 'imonceagain',
    name: 'I\'m Once Again',
    src: '/images/templates/imonceagain.png',
  },
  {
    id: 'transcendence',
    name: 'Transcendence',
    src: '/images/templates/transcendenace.png',
  },
];

export const AdvancedMemeGenerator: React.FC<AdvancedMemeGeneratorProps> = ({
  templates = defaultTemplates,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<MemeCanvasController | null>(null);
  const unregisterRef = useRef<(() => void) | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [textInput, setTextInput] = useState('');
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [showTextInput, setShowTextInput] = useState(false);

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
    });

    return () => {
      unregister();
    };
  }, []);

  // Load template image
  const loadTemplate = useCallback(
    (template: Template) => {
      if (!controllerRef.current) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        controllerRef.current?.changeImage(img);
        setSelectedTemplate(template);
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Advanced Meme Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a template, add text, and create your meme
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[400px]">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto border border-gray-300 dark:border-gray-700 rounded"
                style={{ cursor: 'crosshair' }}
              />
            </div>

            {/* Canvas controls */}
            <div className="mt-4 flex gap-2 flex-wrap">
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
                variant="default"
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
        <div className="space-y-6">
          {/* Template selection */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold mb-4">Templates</h2>
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={template.src}
                      alt={template.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <span className="font-medium text-left">{template.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

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

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2">How to use:</h3>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Select a template to start</li>
              <li>• Click "Add Text" to add text elements</li>
              <li>• Double-click text to edit</li>
              <li>• Drag to move, resize handles to resize</li>
              <li>• Use rotation handle to rotate</li>
              <li>• Click "Download" to save your meme</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

