'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { MemeTemplate, TextField } from '../../lib/types/meme';
import { validateTemplate } from '../../lib/utils/templateUtils';

interface TemplateManagerProps {
  onSave: (template: MemeTemplate) => void;
  onCancel: () => void;
  existingTemplate?: MemeTemplate;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onSave,
  onCancel,
  existingTemplate
}) => {
  const [template, setTemplate] = useState<Partial<MemeTemplate>>(
    existingTemplate || {
      id: '',
      name: '',
      description: '',
      src: '',
      width: 800,
      height: 600,
      defaultFont: 'Impact',
      defaultFontSize: 6,
      defaultColor: '#ffffff',
      category: 'classic',
      difficulty: 'easy',
      textFields: []
    }
  );

  const [textFields, setTextFields] = useState<Partial<TextField>[]>(
    existingTemplate?.textFields || []
  );

  const [newField, setNewField] = useState<Partial<TextField>>({
    id: '',
    x: 50,
    y: 50,
    fontSize: 6,
    color: '#ffffff',
    fontFamily: 'Impact',
    fontWeight: 'bold',
    textAlign: 'center'
  });

  const addTextField = () => {
    if (newField.id && typeof newField.x === 'number' && typeof newField.y === 'number') {
      setTextFields([...textFields, { ...newField }]);
      setNewField({
        id: '',
        x: 50,
        y: 50,
        fontSize: 6,
        color: '#ffffff',
        fontFamily: 'Impact',
        fontWeight: 'bold',
        textAlign: 'center'
      });
    }
  };

  const removeTextField = (index: number) => {
    setTextFields(textFields.filter((_, i) => i !== index));
  };

  const updateTextField = (index: number, field: Partial<TextField>) => {
    const updated = [...textFields];
    updated[index] = { ...updated[index], ...field };
    setTextFields(updated);
  };

  const handleSave = () => {
    if (!template.id || !template.name || !template.src) {
      alert('Please fill in all required fields');
      return;
    }

    if (textFields.length === 0) {
      alert('Please add at least one text field');
      return;
    }

    const completeTemplate: MemeTemplate = {
      ...template as MemeTemplate,
      textFields: textFields as Omit<TextField, 'text' | 'isDragging'>[]
    };

    if (validateTemplate(completeTemplate)) {
      onSave(completeTemplate);
    } else {
      alert('Template validation failed. Please check your input.');
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {existingTemplate ? 'Edit Template' : 'Create New Template'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Template Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Template Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Template ID *</label>
            <Input
              value={template.id}
              onChange={(e) => setTemplate({ ...template, id: e.target.value })}
              placeholder="unique-template-id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder="Template Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={template.description}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              placeholder="Template description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image Path *</label>
            <Input
              value={template.src}
              onChange={(e) => setTemplate({ ...template, src: e.target.value })}
              placeholder="/images/templates/template.png"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Width</label>
              <Input
                type="number"
                value={template.width}
                onChange={(e) => setTemplate({ ...template, width: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <Input
                type="number"
                value={template.height}
                onChange={(e) => setTemplate({ ...template, height: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={template.category}
              onChange={(e) => setTemplate({ ...template, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="classic">Classic</option>
              <option value="politics">Politics</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Default Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Default Settings</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Default Font</label>
            <Input
              value={template.defaultFont}
              onChange={(e) => setTemplate({ ...template, defaultFont: e.target.value })}
              placeholder="Impact"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Font Size (%)</label>
            <Input
              type="number"
              value={template.defaultFontSize}
              onChange={(e) => setTemplate({ ...template, defaultFontSize: parseFloat(e.target.value) })}
              placeholder="6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Color</label>
            <Input
              type="color"
              value={template.defaultColor}
              onChange={(e) => setTemplate({ ...template, defaultColor: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <select
              value={template.difficulty}
              onChange={(e) => setTemplate({ ...template, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Text Fields Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Text Fields</h3>
        
        {/* Add New Text Field */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-3">Add New Text Field</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              placeholder="Field ID"
              value={newField.id}
              onChange={(e) => setNewField({ ...newField, id: e.target.value })}
            />
            <Input
              type="number"
              placeholder="X (%)"
              value={newField.x}
              onChange={(e) => setNewField({ ...newField, x: parseFloat(e.target.value) })}
            />
            <Input
              type="number"
              placeholder="Y (%)"
              value={newField.y}
              onChange={(e) => setNewField({ ...newField, y: parseFloat(e.target.value) })}
            />
            <Input
              type="number"
              placeholder="Font Size (%)"
              value={newField.fontSize}
              onChange={(e) => setNewField({ ...newField, fontSize: parseFloat(e.target.value) })}
            />
          </div>
          <Button onClick={addTextField} className="mt-3">
            Add Text Field
          </Button>
        </div>

        {/* Existing Text Fields */}
        <div className="space-y-3">
          {textFields.map((field, index) => (
            <div key={index} className="border border-gray-200 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Field {index + 1}: {field.id}</span>
                <Button
                  onClick={() => removeTextField(index)}
                  variant="outline"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input
                  placeholder="Field ID"
                  value={field.id}
                  onChange={(e) => updateTextField(index, { id: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="X (%)"
                  value={field.x}
                  onChange={(e) => updateTextField(index, { x: parseFloat(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Y (%)"
                  value={field.y}
                  onChange={(e) => updateTextField(index, { y: parseFloat(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Font Size (%)"
                  value={field.fontSize}
                  onChange={(e) => updateTextField(index, { fontSize: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {existingTemplate ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </Card>
  );
};
