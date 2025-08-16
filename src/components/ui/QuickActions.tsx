'use client';

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface QuickActionsProps {
  onClearAllText: () => void;
  onResetToDefaults: () => void;
  onTimePeriodChange?: (period: string) => void;
  selectedTimePeriod?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onClearAllText,
  onResetToDefaults,
  onTimePeriodChange,
  selectedTimePeriod = 'all'
}) => {
  return (
    <Card className="p-6">
      {/* Time Period Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Period</h4>
        <div className="flex justify-between gap-2">
          <button
            onClick={() => onTimePeriodChange?.('today')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg min-w-[60px] border-2 ${
              selectedTimePeriod === 'today'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm border-transparent"
            }`}
          >
            <span>Today</span>
          </button>
          <button
            onClick={() => onTimePeriodChange?.('week')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg min-w-[60px] border-2 ${
              selectedTimePeriod === 'week'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm border-transparent"
            }`}
          >
            <span>This Week</span>
          </button>
          <button
            onClick={() => onTimePeriodChange?.('all')}
            className={`flex flex-col items-center px-3 py-3 text-xs font-medium rounded-lg min-w-[60px] border-2 ${
              selectedTimePeriod === 'all'
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-500 shadow-sm"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-sm border-transparent"
            }`}
          >
            <span>All Time</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
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
