import React, { useState, useEffect } from 'react';
import { THEMES, NEWS_SOURCES } from './constants';
import { ThemeCard } from './components/ThemeCard';
import { SourceChip } from './components/SourceChip';
import { NewsletterPreview } from './components/NewsletterPreview';
import { ScheduleModal } from './components/ScheduleModal';
import { HistoryModal } from './components/HistoryModal';
import { generateWeeklyNewsletter } from './services/geminiService';
import { AppStatus, NewsletterData, CustomSource, ScheduleConfig } from './types';

function App() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [customSources, setCustomSources] = useState<CustomSource[]>([]);
  const [customInputValue, setCustomInputValue] = useState('');
  const [customInputType, setCustomInputType] = useState<CustomSource['type']>('url');
  
  const [gmailConnected, setGmailConnected] = useState(false);
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);

  const [status, setStatus] = useState<AppStatus>('selection');
  const [newsletterData, setNewsletterData] = useState<NewsletterData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<ScheduleConfig | null>(null);

  // History State
  const [history, setHistory] = useState<NewsletterData[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('newsletter_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Rehydrate Date objects
        const hydrated = parsed.map((item: any) => ({
          ...item,
          generatedAt: new Date(item.generatedAt)
        }));
        setHistory(hydrated);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('newsletter_history', JSON.stringify(history));
  }, [history]);

  const toggleTheme = (id: string) => {
    setSelectedThemes(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const toggleSource = (id: string) => {
    setSelectedSources(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleConnectGmail = () => {
    setIsConnectingGmail(true);
    // Simulate OAuth Delay
    setTimeout(() => {
      setGmailConnected(true);
      setIsConnectingGmail(false);
    }, 2000);
  };

  const addCustomSource = () => {
    if (!customInputValue.trim()) return;
    const newSource: CustomSource = {
      id: Math.random().toString(36).substr(2, 9),
      value: customInputValue.trim(),
      type: customInputType
    };
    setCustomSources([...customSources, newSource]);
    setCustomInputValue('');
  };

  const removeCustomSource = (id: string) => {
    setCustomSources(customSources.filter(s => s.id !== id));
  };

  const handleGenerate = async () => {
    if (selectedThemes.length === 0) return;
    
    setStatus('generating');
    setErrorMessage(null);

    try {
      const themesLabels = selectedThemes.map(id => THEMES.find(t => t.id === id)?.label || id);
      const sourcesLabels = selectedSources.map(id => NEWS_SOURCES.find(s => s.id === id)?.name || id);
      
      const data = await generateWeeklyNewsletter(themesLabels, sourcesLabels, customSources, gmailConnected);
      
      setNewsletterData(data);
      // Add to history (newest first)
      setHistory(prev => [data, ...prev]);
      setStatus('preview');
    } catch (error) {
      console.error(error);
      setErrorMessage("Oops! Our AI editor is having a coffee break. Please try again.");
      setStatus('error');
    }
  };

  const handleConfirmSchedule = (config: ScheduleConfig) => {
    setActiveSchedule(config);
    setIsScheduleModalOpen(false);
    setStatus('scheduled');
  };

  const handleSelectHistoryItem = (item: NewsletterData) => {
    setNewsletterData(item);
    setIsHistoryModalOpen(false);
    setStatus('preview');
  };

  const handleSendEmail = (email: string) => {
    setStatus('sent');
  };

  const handleReset = () => {
    setStatus('selection');
    setNewsletterData(null);
    setSelectedThemes([]);
    setSelectedSources([]);
    setCustomSources([]);
    setActiveSchedule(null);
    setGmailConnected(false);
  };

  // --- Views ---

  if (status === 'scheduled') {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="bg-white/10 p-8 rounded-full mb-6 animate-pulse">
           <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="text-4xl font-bold mb-4 font-serif">Automation Active!</h1>
        <p className="text-indigo-100 text-lg max-w-md mx-auto mb-8">
          We'll send your {activeSchedule?.frequency} news report to <strong>{activeSchedule?.recipients}</strong> every day at {activeSchedule?.sendTime}.
        </p>
        <button onClick={handleReset} className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-colors">Return to Dashboard</button>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="bg-white/10 p-8 rounded-full mb-6 animate-bounce">
           <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-4xl font-bold mb-4 font-serif">It's on the way!</h1>
        <button onClick={handleReset} className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-colors">Curate Another</button>
      </div>
    );
  }

  if (status === 'generating') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-md">
          <div className="relative w-24 h-24 mx-auto mb-8">
             <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-2xl">{gmailConnected ? '📧' : '⚡'}</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{gmailConnected ? 'Scanning your Inbox...' : 'Editor at work...'}</h2>
          <p className="text-gray-500 animate-pulse">
            Reconciling {selectedThemes.length} topics {gmailConnected ? 'with your email newsletters' : ''}...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'preview' && newsletterData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NewsletterPreview 
          data={newsletterData} 
          onBack={() => setStatus('selection')} 
          onSend={handleSendEmail}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-6 sm:py-10 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 font-serif mb-2 tracking-tight">The Witty Weekly Wire</h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">Now with intelligent Gmail integration.</p>
          </div>
          <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 p-2 rounded-xl transition-all flex flex-col items-center gap-1"
            title="Archive"
          >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             <span className="text-[10px] font-bold uppercase tracking-widest">Archive</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full">
        {status === 'error' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-md">
            <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* 1. Themes Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
              1. Choose your topics
            </h2>
            <span className="text-sm text-gray-500 font-medium">{selectedThemes.length} selected</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEMES.map(theme => (
              <ThemeCard key={theme.id} theme={theme} isSelected={selectedThemes.includes(theme.id)} onToggle={toggleTheme} />
            ))}
          </div>
        </section>

        {/* 2. Sources Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
              2. Power Up Sources
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Standard Sources */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Popular Publications</h3>
              <div className="flex flex-wrap gap-2">
                {NEWS_SOURCES.map(source => (
                  <SourceChip key={source.id} source={source} isSelected={selectedSources.includes(source.id)} onToggle={toggleSource} />
                ))}
              </div>
            </div>

            {/* Integration Section */}
            <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 ${gmailConnected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Integrations</h3>
                {gmailConnected && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Active</span>}
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${gmailConnected ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>📧</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">Gmail Newsletters</h4>
                  <p className="text-xs text-gray-500">Read & summarize your subscriptions.</p>
                </div>
                {!gmailConnected ? (
                  <button 
                    onClick={handleConnectGmail}
                    disabled={isConnectingGmail}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {isConnectingGmail ? 'Authenticating...' : 'Connect'}
                  </button>
                ) : (
                  <button onClick={() => setGmailConnected(false)} className="text-gray-400 hover:text-red-500 text-xs font-bold">Disconnect</button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Custom URLs / Social Accounts</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <select value={customInputType} onChange={(e) => setCustomInputType(e.target.value as any)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 outline-none">
                <option value="url">Website URL</option>
                <option value="social">Social Handle</option>
                <option value="newsletter">Email Subject Match</option>
              </select>
              <input 
                type="text" value={customInputValue} onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder="Enter value..." onKeyPress={(e) => e.key === 'Enter' && addCustomSource()}
                className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 outline-none"
              />
              <button onClick={addCustomSource} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {customSources.map(source => (
                <div key={source.id} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100 text-sm">
                  <span>{source.type === 'url' ? '🌐' : source.type === 'social' ? '📱' : '✉️'}</span> {source.value}
                  <button onClick={() => removeCustomSource(source.id)} className="ml-1 hover:text-indigo-900">×</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="sticky bottom-6 z-20 flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
           <button
             onClick={handleGenerate}
             disabled={selectedThemes.length === 0}
             className={`group flex-1 max-w-xs px-10 py-5 rounded-full font-bold text-lg shadow-2xl transition-all transform active:scale-95 ${selectedThemes.length > 0 ? 'bg-gray-900 text-white hover:bg-indigo-600 hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
           >
             <span className="flex items-center justify-center gap-3">Compile Now <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
           </button>

           <button
             onClick={() => setIsScheduleModalOpen(true)}
             disabled={selectedThemes.length === 0}
             className={`group flex-1 max-w-xs px-10 py-5 rounded-full font-bold text-lg shadow-xl border-2 transition-all transform active:scale-95 ${selectedThemes.length > 0 ? 'bg-white border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:-translate-y-1' : 'bg-white border-gray-200 text-gray-300 cursor-not-allowed'}`}
           >
             <span className="flex items-center justify-center gap-3">Schedule Recurring <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
           </button>
        </div>
      </main>

      <ScheduleModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} onConfirm={handleConfirmSchedule} />
      <HistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        history={history} 
        onSelect={handleSelectHistoryItem}
        onClear={() => setHistory([])}
      />
      
      <footer className="bg-white border-t border-gray-200 py-12 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} The Witty Weekly Wire.
      </footer>
    </div>
  );
}

export default App;
