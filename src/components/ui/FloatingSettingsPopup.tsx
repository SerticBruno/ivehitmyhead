'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TextField } from '../../lib/types/meme';

interface FloatingSettingsPopupProps {
  field: TextField;
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onUpdateProperty: (fieldId: string, property: string, value: string | number | boolean) => void;
}

export const FloatingSettingsPopup: React.FC<FloatingSettingsPopupProps> = ({
  field,
  isOpen,
  x,
  y,
  onClose,
  onUpdateProperty
}) => {
  if (!isOpen) return null;

  return (
    <div 
      data-settings-popup
      className="absolute z-[9999] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 min-w-80 pointer-events-auto"
      style={{
        left: x,
        top: y + 20,
        transform: 'translate(-50%, 0)'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Text Settings
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {/* Font Family and Size in a row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Font</label>
            <select
              value={field.fontFamily || 'Impact'}
              onChange={(e) => 
                onUpdateProperty(field.id, 'fontFamily', e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Impact">Impact</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
          
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
              onClick={(e) => e.stopPropagation()}
              className="w-full"
            />
          </div>
        </div>

        {/* Text Color and Border Width in a row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={field.color}
                onChange={(e) => 
                  onUpdateProperty(field.id, 'color', e.target.value)
                }
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {field.color}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Border Color</label>
            <div className="flex items-center space-x-2">
                                             <input
                 type="color"
                 value={field.strokeColor || '#000000'}
                 onChange={(e) => 
                   onUpdateProperty(field.id, 'strokeColor', e.target.value)
                 }
                 onClick={(e) => e.stopPropagation()}
                 className="w-10 h-10 rounded border cursor-pointer"
               />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {field.strokeColor || '#000000'}
              </span>
            </div>
          </div>
        </div>

        {/* Border Width */}
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
           onClick={(e) => e.stopPropagation()}
           className="w-full"
         />
        </div>

        {/* Text Alignment */}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Alignment</label>
          <div className="flex space-x-1">
                         {(['left', 'center', 'right'] as const).map((align) => (
               <button
                 key={align}
                 onClick={(e) => {
                   e.stopPropagation();
                   onUpdateProperty(field.id, 'textAlign', align);
                 }}
                 className={`px-3 py-1 text-xs rounded ${
                   field.textAlign === align
                     ? 'bg-blue-500 text-white'
                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500'
                 }`}
               >
                 {align.charAt(0).toUpperCase() + align.slice(1)}
               </button>
             ))}
          </div>
        </div>

        {/* Letter Spacing and Rotation in a row */}
        <div className="grid grid-cols-2 gap-4">
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
               onClick={(e) => e.stopPropagation()}
               className="w-full"
             />
          </div>
          
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
                 onClick={(e) => e.stopPropagation()}
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
                 onClick={(e) => e.stopPropagation()}
                 className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
