'use client';

import React from 'react';
import { TextField } from '../../lib/types/meme';

interface TextSettingsDropdownProps {
  field: TextField;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProperty: (fieldId: string, property: string, value: string | number | boolean) => void;
}

export const TextSettingsDropdown: React.FC<TextSettingsDropdownProps> = ({
  field,
  isOpen,
  onClose,
  onUpdateProperty
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 min-w-64">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Text Settings
        </h4>
        <button
          onClick={onClose}
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
              onUpdateProperty(field.id, 'fontFamily', e.target.value)
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
              onUpdateProperty(field.id, 'fontSize', parseInt(e.target.value))
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
                onUpdateProperty(field.id, 'color', e.target.value)
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
              onUpdateProperty(field.id, 'strokeWidth', parseInt(e.target.value))
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
                onUpdateProperty(field.id, 'strokeColor', e.target.value)
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
              onUpdateProperty(field.id, 'textAlign', e.target.value as 'left' | 'center' | 'right')
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
              onUpdateProperty(field.id, 'letterSpacing', `${parseFloat(e.target.value)}em`)
            }
            className="w-full"
          />
        </div>

        {/* Rotation */}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Rotation: {field.rotation || 0}°
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={field.rotation || 0}
              onChange={(e) => 
                onUpdateProperty(field.id, 'rotation', parseInt(e.target.value))
              }
              className="flex-1"
            />
            <input
              type="number"
              min="-180"
              max="180"
              value={field.rotation || 0}
              onChange={(e) => 
                onUpdateProperty(field.id, 'rotation', parseInt(e.target.value) || 0)
              }
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
