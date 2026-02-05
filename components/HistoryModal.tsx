import React from 'react';
import { NewsletterData } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: NewsletterData[];
  onSelect: (data: NewsletterData) => void;
  onClear: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gray-900 p-6 text-white relative rounded-t-3xl flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-3">
             <span className="text-2xl">📜</span>
             <div>
                <h3 className="text-xl font-serif font-bold">Edition Archive</h3>
                <p className="text-gray-400 text-xs mt-1">{history.length} saved newsletters</p>
             </div>
          </div>
        </div>
        
        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-4 opacity-30">📭</span>
              <p>No past editions found.</p>
              <p className="text-sm mt-2">Generate your first newsletter to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {new Date(item.generatedAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    {item.gmailUsed && (
                       <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                         📧 Gmail
                       </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.themes.map((theme, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-semibold">
                        {theme}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                    Read Edition 
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-3xl flex justify-end">
             <button 
               onClick={onClear}
               className="text-red-500 hover:text-red-700 text-sm font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
             >
               Clear History
             </button>
          </div>
        )}

      </div>
    </div>
  );
};
