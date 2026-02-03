import React, { useState } from 'react';
import { THEMES, NEWS_SOURCES } from './constants';
import { ThemeCard } from './components/ThemeCard';
import { SourceChip } from './components/SourceChip';
import { NewsletterPreview } from './components/NewsletterPreview';
import { generateWeeklyNewsletter } from './services/geminiService';
import { AppStatus, NewsletterData, CustomSource } from './types';

function App() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [customSources, setCustomSources] = useState<CustomSource[]>([]);
  const [customInputValue, setCustomInputValue] = useState('');
  const [customInputType, setCustomInputType] = useState<CustomSource['type']>('url');
  
  const [status, setStatus] = useState<AppStatus>('selection');
  const [newsletterData, setNewsletterData] = useState<NewsletterData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      
      const data = await generateWeeklyNewsletter(themesLabels, sourcesLabels, customSources);
      setNewsletterData(data);
      setStatus('preview');
    } catch (error) {
      console.error(error);
      setErrorMessage("Oops! Our AI editor is having a coffee break. Please try again.");
      setStatus('error');
    }
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
  };

  // --- Views ---

  if (status === 'sent') {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="bg-white/10 p-8 rounded-full mb-6 animate-bounce">
           <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-4xl font-bold mb-4 font-serif">It's on the way!</h1>
        <p className="text-indigo-100 text-lg max-w-md mx-auto mb-8">
          Your personalized newsletter has been dispatched. Keep an eye on your inbox!
        </p>
        <button 
          onClick={handleReset}
          className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-colors"
        >
          Curate Another
        </button>
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
             <div className="absolute inset-0 flex items-center justify-center text-2xl">⚡</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Editor at work...</h2>
          <p className="text-gray-500 animate-pulse">
            Analyzing {selectedThemes.length} topics and scouring your {customSources.length + selectedSources.length} preferred sources.
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
      <header className="bg-white border-b border-gray-200 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 font-serif mb-4 tracking-tight">
            The Witty Weekly Wire
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Your personal AI editor for the news that actually matters to you.
          </p>
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
              <ThemeCard 
                key={theme.id}
                theme={theme}
                isSelected={selectedThemes.includes(theme.id)}
                onToggle={toggleTheme}
              />
            ))}
          </div>
        </section>

        {/* 2. Sources Section */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
              2. News Sources
            </h2>
          </div>
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Popular Publications</h3>
            <div className="flex flex-wrap gap-3 mb-10">
              {NEWS_SOURCES.map(source => (
                <SourceChip 
                  key={source.id}
                  source={source}
                  isSelected={selectedSources.includes(source.id)}
                  onToggle={toggleSource}
                />
              ))}
            </div>

            <hr className="mb-8 border-gray-100" />

            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Add Your Own (Websites, Social, Newsletters)</h3>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 flex gap-2">
                <select 
                  value={customInputType}
                  onChange={(e) => setCustomInputType(e.target.value as any)}
                  className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                >
                  <option value="url">Website URL</option>
                  <option value="social">Social Media Handle</option>
                  <option value="newsletter">Newsletter Name</option>
                </select>
                <input 
                  type="text" 
                  value={customInputValue}
                  onChange={(e) => setCustomInputValue(e.target.value)}
                  placeholder={customInputType === 'url' ? 'https://example.com' : customInputType === 'social' ? '@username' : 'The Morning Brew'}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSource()}
                  className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                />
              </div>
              <button 
                onClick={addCustomSource}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors whitespace-nowrap"
              >
                Add Source
              </button>
            </div>

            {/* Custom Sources List */}
            {customSources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customSources.map(source => (
                  <div key={source.id} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 text-sm font-medium">
                    <span className="opacity-70">
                      {source.type === 'url' ? '🌐' : source.type === 'social' ? '📱' : '✉️'}
                    </span>
                    {source.value}
                    <button 
                      onClick={() => removeCustomSource(source.id)}
                      className="ml-1 hover:text-indigo-900 focus:outline-none"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {customSources.length === 0 && (
              <p className="text-xs text-gray-400 italic">No custom sources added yet.</p>
            )}
          </div>
        </section>

        <div className="sticky bottom-6 z-20 flex justify-center">
           <button
             onClick={handleGenerate}
             disabled={selectedThemes.length === 0}
             className={`
               group relative px-10 py-5 rounded-full font-bold text-lg shadow-2xl transition-all transform active:scale-95
               ${selectedThemes.length > 0 
                 ? 'bg-gray-900 text-white hover:bg-indigo-600 hover:-translate-y-1' 
                 : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
             `}
           >
             <span className="flex items-center gap-3">
               Compile My Edition
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </span>
           </button>
        </div>

      </main>

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} The Witty Weekly Wire. 
          <p className="mt-2">Made for curious minds.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
