import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Checkbox({ checked, onCheckedChange, className, ...props }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'h-4 w-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        checked && 'bg-blue-600 border-blue-600',
        className
      )}
      {...props}
    >
      {checked && (
        <Check className="h-3 w-3 text-white" />
      )}
    </button>
  );
} 