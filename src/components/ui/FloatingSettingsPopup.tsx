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

// Custom styled range input component
const StyledRangeInput: React.FC<{
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  unit?: string;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ value, min, max, step = 1, onChange, label, unit, onClick }) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-xs text-gray-500 dark:text-gray-400">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onClick={onClick}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
        }}
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export const FloatingSettingsPopup: React.FC<FloatingSettingsPopupProps> = ({
  field,
  isOpen,
  x,
  y,
  onClose,
  onUpdateProperty
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  // Create portal to render outside canvas container
  return createPortal(
    <div 
      data-settings-popup
      className="absolute z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-80 pointer-events-auto"
      style={{
        left: x,
        top: y,
        transform: 'translateX(-50%)' // Center horizontally on the cog position
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Text Settings</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Typography & Border */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Font</label>
            <select
              value={field.fontFamily || 'Impact'}
              onChange={(e) => 
                onUpdateProperty(field.id, 'fontFamily', e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="Impact">Impact</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
          
          <div>
            <StyledRangeInput
              value={field.fontSize}
              min={20}
              max={80}
              onChange={(value) => onUpdateProperty(field.id, 'fontSize', value)}
              label="Size"
              unit="px"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div>
            <StyledRangeInput
              value={field.strokeWidth || 6}
              min={2}
              max={20}
              onChange={(value) => onUpdateProperty(field.id, 'strokeWidth', value)}
              label="Border"
              unit="px"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Colors & Alignment */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Alignment</label>
            <select
              value={field.textAlign || 'left'}
              onChange={(e) => 
                onUpdateProperty(field.id, 'textAlign', e.target.value)
              }
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Text</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={field.color}
                onChange={(e) => 
                  onUpdateProperty(field.id, 'color', e.target.value)
                }
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{field.color}</span>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Border</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={field.strokeColor || '#000000'}
                onChange={(e) => 
                  onUpdateProperty(field.id, 'strokeColor', e.target.value)
                }
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{field.strokeColor || '#000000'}</span>
            </div>
          </div>
        </div>

        {/* Effects */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StyledRangeInput
              value={parseFloat(field.letterSpacing || '0.05')}
              min={0}
              max={0.2}
              step={0.01}
              onChange={(value) => onUpdateProperty(field.id, 'letterSpacing', `${value}em`)}
              label="Spacing"
              unit="em"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div>
              <StyledRangeInput
                value={field.rotation || 0}
                min={-180}
                max={180}
                step={1}
                onChange={(value) => onUpdateProperty(field.id, 'rotation', value)}
                label="Rotation"
                unit="°"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
