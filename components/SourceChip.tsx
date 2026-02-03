import React from 'react';
import { NewsSource } from '../types';

interface SourceChipProps {
  source: NewsSource;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const SourceChip: React.FC<SourceChipProps> = ({ source, isSelected, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(source.id)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200
        ${isSelected 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
        }
      `}
    >
      <span className="text-lg">{source.icon}</span>
      <span className="font-semibold text-sm">{source.name}</span>
      {isSelected && (
        <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
};
