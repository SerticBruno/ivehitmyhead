'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card } from './Card';
import { MemeTemplate } from '../../lib/types/meme';
import { MEME_TEMPLATES } from '../../lib/data/templates';

interface TemplateSelectorProps {
  selectedTemplate: MemeTemplate | null;
  onTemplateSelect: (template: MemeTemplate) => void;
  isDirty?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Choose Template</h2>
      
      <div className="space-y-4">
        <div className="relative" data-dropdown>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              {selectedTemplate ? (
                <>
                  <Image
                    src={selectedTemplate.src}
                    alt={selectedTemplate.name}
                    width={32}
                    height={32}
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
          
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {MEME_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center space-x-3 ${
                    selectedTemplate?.id === template.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    onTemplateSelect(template);
                    setIsDropdownOpen(false);
                  }}
                >
                                     <Image
                     src={template.src}
                     alt={template.name}
                     width={32}
                     height={32}
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
  );
};
