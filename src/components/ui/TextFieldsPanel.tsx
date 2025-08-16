'use client';

import React, { useState } from 'react';
import { Card } from './Card';
import { TextField } from '../../lib/types/meme';
import { TextSettingsDropdown } from './TextSettingsDropdown';

interface TextFieldsPanelProps {
  textFields: TextField[];
  activeField: string | null;
  onTextChange: (fieldId: string, text: string) => void;
  onFieldSelect: (fieldId: string) => void;
  onUpdateProperty: (fieldId: string, property: string, value: string | number | boolean) => void;
}

export const TextFieldsPanel: React.FC<TextFieldsPanelProps> = ({
  textFields,
  activeField,
  onTextChange,
  onFieldSelect,
  onUpdateProperty
}) => {
  const [openSettingsDropdown, setOpenSettingsDropdown] = useState<string | null>(null);

  const toggleSettingsDropdown = (fieldId: string) => {
    setOpenSettingsDropdown(openSettingsDropdown === fieldId ? null : fieldId);
  };

  const handleFieldClick = (fieldId: string) => {
    onFieldSelect(fieldId);
    // Focus the input field immediately
    const inputElement = document.querySelector(`input[data-field-id="${fieldId}"]`) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  return (
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
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-200 dark:ring-blue-800' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={(e) => {
                // Don't trigger if clicking directly on the input or buttons
                if (e.target === e.currentTarget || 
                    (e.target as Element).closest('button') ||
                    (e.target as Element).closest('input')) {
                  return;
                }
                handleFieldClick(field.id);
              }}
            >
              <input
                type="text"
                value={field.text}
                onChange={(e) => onTextChange(field.id, e.target.value)}
                placeholder={`Enter ${field.id} text...`}
                data-field-id={field.id}
                className="flex-1 h-10 px-3 py-2 text-sm border-0 bg-transparent focus:outline-none focus:ring-0 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                onFocus={() => onFieldSelect(field.id)}
              />
              <div className="flex items-center space-x-2 ml-2">
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
                  
                  <TextSettingsDropdown
                    field={field}
                    isOpen={openSettingsDropdown === field.id}
                    onClose={() => setOpenSettingsDropdown(null)}
                    onUpdateProperty={onUpdateProperty}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
