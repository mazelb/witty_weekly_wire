import React from 'react';
import { ThemeOption } from '../types';

interface ThemeCardProps {
  theme: ThemeOption;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onToggle }) => {
  return (
    <div 
      onClick={() => onToggle(theme.id)}
      className={`
        cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 relative overflow-hidden group
        ${isSelected 
          ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-[1.02]' 
          : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{theme.icon}</span>
        <div className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
          ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}
        `}>
          {isSelected && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
        {theme.label}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {theme.description}
      </p>
    </div>
  );
};
