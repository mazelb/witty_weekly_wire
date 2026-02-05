import React from 'react';
import { NewsSource } from '../types';

interface SourceChipProps {
  source: NewsSource;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const SourceChip: React.FC<SourceChipProps> = ({ source, isSelected, onToggle, onDelete }) => {
  return (
    <div
      onClick={() => onToggle(source.id)}
      className={`
        group relative flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 cursor-pointer select-none
        ${isSelected 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
        }
      `}
    >
      <span className="text-lg">{source.icon}</span>
      <span className="font-semibold text-sm">{source.name}</span>
      
      {isSelected && !onDelete && (
        <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(source.id);
          }}
          className={`
            ml-1 p-0.5 rounded-full transition-colors
            ${isSelected 
              ? 'text-indigo-200 hover:text-white hover:bg-indigo-500' 
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }
          `}
          title="Remove source"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
