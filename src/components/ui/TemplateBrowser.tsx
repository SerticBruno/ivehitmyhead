'use client';

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { MemeTemplate } from '../../lib/types/meme';
import { getAllCategories } from '../../lib/data/templates';

interface TemplateBrowserProps {
  onSelectTemplate: (template: MemeTemplate) => void;
  onCreateTemplate: () => void;
  onEditTemplate?: (template: MemeTemplate) => void;
}

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  onSelectTemplate,
  onCreateTemplate,
  onEditTemplate
}) => {
  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Choose a Template</h2>
        <Button onClick={onCreateTemplate}>
          Create New Template
        </Button>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{category.name}</h3>
            {category.description && (
              <p className="text-gray-600">{category.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.templates.map((template) => (
              <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="space-y-3">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={template.src}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/templates/placeholder.png'; // You can add a placeholder image
                      }}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">{template.name}</h4>
                    {template.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {template.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.textFields.length} text areas
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => onSelectTemplate(template)}
                          size="sm"
                        >
                          Use Template
                        </Button>
                        {onEditTemplate && (
                          <Button
                            onClick={() => onEditTemplate(template)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No templates available yet.</p>
          <Button onClick={onCreateTemplate}>
            Create Your First Template
          </Button>
        </div>
      )}
    </div>
  );
};
