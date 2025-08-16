'use client';

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface QuickActionsProps {
  onClearAllText: () => void;
  onResetToDefaults: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onClearAllText,
  onResetToDefaults
}) => {
  return (
    <Card className="p-6">
      <div className="flex gap-3">
        <Button 
          onClick={onClearAllText}
          variant="outline"
          className="flex-1 h-12 px-6 py-3"
        >
          Clear All Text
        </Button>
        <Button 
          onClick={onResetToDefaults}
          variant="outline"
          className="flex-1 h-12 px-6 py-3"
        >
          Reset to Defaults
        </Button>
      </div>
    </Card>
  );
};
