import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-slate-500 dark:text-slate-400">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-indigo-600 dark:text-indigo-400`} />
      {text && <p className="text-sm font-medium">{text}</p>}
    </div>
  );
};
