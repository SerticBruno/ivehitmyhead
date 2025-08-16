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
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="space-y-3">
        <Button 
          onClick={onClearAllText}
          variant="outline"
          className="w-full"
        >
          Clear All Text
        </Button>
        <Button 
          onClick={onResetToDefaults}
          variant="outline"
          className="w-full"
        >
          Reset to Meme Defaults
        </Button>
      </div>
    </Card>
  );
};
