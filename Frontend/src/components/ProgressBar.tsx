import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ 
  label, 
  value, 
  max, 
  color, 
  showPercentage = true 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {showPercentage && (
          <span className="text-sm text-slate-500">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}