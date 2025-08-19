'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TemplateManager } from './TemplateManager';
import { MemePreview } from './MemePreview';
import { TemplateSelector } from './TemplateSelector';
import { TextFieldsPanel } from './TextFieldsPanel';
import { QuickActions } from './QuickActions';
import { MemeTemplate, TextField } from '../../lib/types/meme';
import { initializeTextFields, renderTextForDownload } from '../../lib/utils/templateUtils';
import { useNavigationWarning } from '../../lib/contexts/NavigationWarningContext';

export const MemeGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(null);
  const [textFields, setTextFields] = useState<TextField[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MemeTemplate | null>(null);
  
  // Track initial state for dirty checking
  const initialTextFieldsRef = useRef<TextField[]>([]);
  const initialTemplateRef = useRef<MemeTemplate | null>(null);
  
  // Check if meme has been modified from initial state
  const isDirty = useCallback(() => {
    if (!selectedTemplate || !initialTemplateRef.current) {
      return false;
    }
    
    // Check if template changed
    if (selectedTemplate.id !== initialTemplateRef.current.id) {
      return true;
    }
    
    // Check if any text fields have been modified
    const hasTextChanges = textFields.some((field, index) => {
      const initialField = initialTextFieldsRef.current[index];
      if (!initialField) return true;
      
      return (
        field.text !== initialField.text ||
        field.x !== initialField.x ||
        field.y !== initialField.y ||
        field.width !== initialField.width ||
        field.height !== initialField.height ||
        field.rotation !== initialField.rotation ||
        field.fontSize !== initialField.fontSize ||
        field.fontFamily !== initialField.fontFamily ||
        field.fontWeight !== initialField.fontWeight ||
        field.color !== initialField.color ||
        field.strokeColor !== initialField.strokeColor ||
        field.strokeWidth !== initialField.strokeWidth ||
        field.textAlign !== initialField.textAlign ||
        field.letterSpacing !== initialField.letterSpacing
      );
    });
    
    return hasTextChanges;
  }, [selectedTemplate, textFields]);
  
  // Use navigation warning context
  const { setDirty, setMessage } = useNavigationWarning();
  
  // Update the context when dirty state changes
  React.useEffect(() => {
    setDirty(isDirty());
    setMessage('You have unsaved changes to your meme. Are you sure you want to leave?');
  }, [isDirty, setDirty, setMessage]);



  const handleTextChange = useCallback((fieldId: string, text: string) => {
    setTextFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, text } : field
      )
    );
  }, []);

  const resetToMemeDefaults = useCallback(() => {
    if (!selectedTemplate) return;
    
    const defaultFields = textFields.map(field => ({
      ...field,
      fontFamily: 'Impact',
      fontWeight: 'bold',
      fontSize: 46,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 6,
        textAlign: field.textAlign || 'center',
        letterSpacing: '0.05em',
        rotation: 0
      }));
    
    setTextFields(defaultFields);
    
    // Update initial state to reflect reset
    initialTextFieldsRef.current = JSON.parse(JSON.stringify(defaultFields));
  }, [selectedTemplate, textFields]);

  const handleTemplateSelect = useCallback((template: MemeTemplate) => {
    // Check if current template has unsaved changes
    if (selectedTemplate && isDirty()) {
      const confirmed = window.confirm('You have unsaved changes to your current meme. Are you sure you want to change templates? This will discard your current work.');
      if (!confirmed) {
        return; // Don't change template if user cancels
      }
    }
    
    setSelectedTemplate(template);
    const initialFields = initializeTextFields(template);
    setTextFields(initialFields);
    
    // Store initial state for dirty checking
    initialTemplateRef.current = template;
    initialTextFieldsRef.current = JSON.parse(JSON.stringify(initialFields));
  }, [selectedTemplate, isDirty]);



  const handleSaveTemplate = useCallback((template: MemeTemplate) => {
    console.log('Saving template:', template);
    setShowTemplateManager(false);
    setEditingTemplate(null);
  }, []);

  const handleCancelTemplate = useCallback(() => {
    setShowTemplateManager(false);
    setEditingTemplate(null);
  }, []);

  const handleFieldSelect = useCallback((fieldId: string | null) => {
    setActiveField(fieldId);
  }, []);

  const handleFieldHover = useCallback((fieldId: string | null) => {
    setHoveredField(fieldId);
  }, []);

  const handleFieldMove = useCallback((fieldId: string, x: number, y: number) => {
    setTextFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, x, y } : field
      )
    );
  }, []);

  const handleFieldResize = useCallback((fieldId: string, width: number, height: number) => {
    setTextFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, width, height } : field
      )
    );
  }, []);

  const handleFieldRotate = useCallback((fieldId: string, rotation: number) => {
    setTextFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, rotation } : field
      )
    );
  }, []);

  const updateTextFieldProperty = useCallback((fieldId: string, property: string, value: string | number | boolean) => {
    setTextFields(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    );
  }, []);





  const downloadMeme = useCallback(() => {
    if (!selectedTemplate) return;

    // Create a temporary canvas to get the final image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      // Set canvas size to match the ORIGINAL template dimensions
      canvas.width = selectedTemplate.width;
      canvas.height = selectedTemplate.height;
      
      // Draw the template image at full size
      ctx.drawImage(img, 0, 0, selectedTemplate.width, selectedTemplate.height);
      
      // Draw text fields using the download-specific rendering function
      // This ensures 1:1 fidelity with the preview by using the same
      // percentage-based calculations but at full resolution
      textFields.forEach(field => {
        renderTextForDownload(ctx, field, selectedTemplate.width, selectedTemplate.height);
      });
      
      // Download the final image with text
      const link = document.createElement('a');
      link.download = `meme-${selectedTemplate.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = selectedTemplate.src;
  }, [selectedTemplate, textFields]);

  const clearAllText = useCallback(() => {
    setTextFields(prev => prev.map(f => ({ ...f, text: '' })));
    
    // Update initial state to reflect cleared text
    if (initialTextFieldsRef.current.length > 0) {
      initialTextFieldsRef.current = initialTextFieldsRef.current.map(f => ({ ...f, text: '' }));
    }
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Element) {
        const dropdown = document.querySelector('[data-dropdown]');
        if (dropdown && !dropdown.contains(event.target)) {
          // Handle dropdown close if needed
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveField(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 pb-16">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Meme Generator
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a template, add your text, and create dullest memes
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
            <MemePreview
              selectedTemplate={selectedTemplate}
              textFields={textFields}
              activeField={activeField}
              hoveredField={hoveredField}
              onFieldSelect={handleFieldSelect}
              onFieldHover={handleFieldHover}
              onFieldMove={handleFieldMove}
              onFieldResize={handleFieldResize}
              onFieldRotate={handleFieldRotate}
              onUpdateProperty={updateTextFieldProperty}
              onDownload={downloadMeme}
            />
          </div>

          {/* Right Side - Controls */}
          <div className="space-y-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              isDirty={isDirty()}
            />

            {selectedTemplate && (
              <>
                <TextFieldsPanel
                  textFields={textFields}
                  activeField={activeField}
                  onTextChange={handleTextChange}
                  onFieldSelect={handleFieldSelect}
                  onUpdateProperty={updateTextFieldProperty}
                />

                <QuickActions
                  onClearAllText={clearAllText}
                  onResetToDefaults={resetToMemeDefaults}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
