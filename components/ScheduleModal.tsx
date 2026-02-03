import React, { useState } from 'react';
import { ScheduleConfig } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: ScheduleConfig) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [config, setConfig] = useState<ScheduleConfig>({
    frequency: 'weekly',
    deliveryType: 'personal',
    recipients: '',
    sendTime: '08:00'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h3 className="text-2xl font-serif font-bold">Schedule Recurring Edition</h3>
          <p className="text-indigo-100 text-sm mt-1">Wake up to news that actually matters.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Frequency</label>
              <select 
                value={config.frequency}
                onChange={(e) => setConfig({...config, frequency: e.target.value as any})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preferred Time</label>
              <input 
                type="time" 
                value={config.sendTime}
                onChange={(e) => setConfig({...config, sendTime: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Delivery Method</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfig({...config, deliveryType: 'personal'})}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-semibold text-sm ${config.deliveryType === 'personal' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
              >
                Personal Inbox
              </button>
              <button 
                onClick={() => setConfig({...config, deliveryType: 'mailing-list'})}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-semibold text-sm ${config.deliveryType === 'mailing-list' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
              >
                Mailing List
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Recipients</label>
            <textarea 
              rows={3}
              placeholder={config.deliveryType === 'personal' ? 'Enter your email address' : 'Enter emails separated by commas'}
              value={config.recipients}
              onChange={(e) => setConfig({...config, recipients: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <button 
            onClick={() => onConfirm(config)}
            disabled={!config.recipients}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${config.recipients ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            Activate Schedule
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
