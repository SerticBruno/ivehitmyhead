import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  icon: string;
  color: string;
}

interface StatsProps {
  stats: StatItem[];
  className?: string;
}

const Stats: React.FC<StatsProps> = ({ stats, className }) => {
  const [animatedValues, setAnimatedValues] = useState<number[]>(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
      setAnimatedValues(prev => 
        prev.map((current, index) => {
          const target = stats[index].value;
          const increment = target / steps;
          return Math.min(current + increment, target);
        })
      );
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats]);

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-6", className)}>
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
        >
          <div className={cn("text-3xl mb-3", stat.color)}>
            {stat.icon}
          </div>
          <div className="text-3xl font-bold mb-2">
            {Math.round(animatedValues[index]).toLocaleString()}
            {stat.suffix}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export { Stats };
export type { StatsProps, StatItem }; 