'use client';

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { MemeCanvas } from './MemeCanvas';
import { MemeTemplate, TextField } from '../../lib/types/meme';

interface MemePreviewProps {
  selectedTemplate: MemeTemplate | null;
  textFields: TextField[];
  activeField: string | null;
  hoveredField: string | null;
  onFieldSelect: (fieldId: string | null) => void;
  onFieldHover: (fieldId: string | null) => void;
  onFieldMove: (fieldId: string, x: number, y: number) => void;
  onFieldResize: (fieldId: string, width: number, height: number) => void;
  onFieldRotate?: (fieldId: string, rotation: number) => void;
  onDownload: () => void;
}

export const MemePreview: React.FC<MemePreviewProps> = ({
  selectedTemplate,
  textFields,
  activeField,
  hoveredField,
  onFieldSelect,
  onFieldHover,
  onFieldMove,
  onFieldResize,
  onFieldRotate,
  onDownload
}) => {
  return (
    <Card className="p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Preview & Edit</h2>
        {selectedTemplate && (
          <Button onClick={onDownload} size="lg">
            Download Meme
          </Button>
        )}
      </div>
      
      <MemeCanvas
        selectedTemplate={selectedTemplate}
        textFields={textFields}
        activeField={activeField}
        hoveredField={hoveredField}
        onFieldSelect={onFieldSelect}
        onFieldHover={onFieldHover}
        onFieldMove={onFieldMove}
        onFieldResize={onFieldResize}
        onFieldRotate={onFieldRotate}
      />
      
      {selectedTemplate && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
          <strong>Click</strong> to select • <strong>Drag</strong> to move • <strong>Drag corners</strong> to resize • <strong>Drag circle</strong> to rotate • <strong>Escape</strong> to deselect
        </p>
      )}
    </Card>
  );
};
