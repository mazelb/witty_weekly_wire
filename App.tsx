import React, { useState } from 'react';
import { THEMES } from './constants';
import { ThemeCard } from './components/ThemeCard';
import { NewsletterPreview } from './components/NewsletterPreview';
import { generateWeeklyNewsletter } from './services/geminiService';
import { AppStatus, NewsletterData } from './types';

function App() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
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

  const handleGenerate = async () => {
    if (selectedThemes.length === 0) return;
    
    setStatus('generating');
    setErrorMessage(null);

    try {
      const themesLabels = selectedThemes.map(id => THEMES.find(t => t.id === id)?.label || id);
      const data = await generateWeeklyNewsletter(themesLabels);
      setNewsletterData(data);
      setStatus('preview');
    } catch (error) {
      console.error(error);
      setErrorMessage("Oops! Our AI editor is having a coffee break. Please try again.");
      setStatus('error');
    }
  };

  const handleSendEmail = (email: string) => {
    // Simulate sending
    setStatus('sent');
    setTimeout(() => {
      // Reset after a delay if needed, or keep showing success
    }, 5000);
  };

  const handleReset = () => {
    setStatus('selection');
    setNewsletterData(null);
    setSelectedThemes([]);
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
          Your personalized newsletter has been dispatched into the ether. Check your inbox (or imagination) shortly.
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
             <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Curating your digest...</h2>
          <p className="text-gray-500 animate-pulse">
            Scanning the web for the juiciest stories about {selectedThemes.map(id => THEMES.find(t => t.id === id)?.label).join(', ')}...
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

  // Selection View (Default)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 font-serif mb-4 tracking-tight">
            The Witty Weekly Wire
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Select your favorite topics, and our AI will scour the web to build a factual, yet surprisingly amusing, weekly newsletter just for you.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 w-full">
        
        {status === 'error' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            Choose your mix
          </h2>
          <span className="text-sm text-gray-500 font-medium">
            {selectedThemes.length} selected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {THEMES.map(theme => (
            <ThemeCard 
              key={theme.id}
              theme={theme}
              isSelected={selectedThemes.includes(theme.id)}
              onToggle={toggleTheme}
            />
          ))}
        </div>

        <div className="sticky bottom-6 z-20 flex justify-center">
           <button
             onClick={handleGenerate}
             disabled={selectedThemes.length === 0}
             className={`
               group relative px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform
               ${selectedThemes.length > 0 
                 ? 'bg-gray-900 text-white hover:bg-indigo-600 hover:scale-105 hover:-translate-y-1' 
                 : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
             `}
           >
             <span className="flex items-center gap-3">
               Generate Newsletter
               <svg className={`w-5 h-5 transition-transform ${selectedThemes.length > 0 ? 'group-hover:translate-x-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </span>
           </button>
        </div>

      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} The Witty Weekly Wire. Powered by Gemini 2.5.
        </div>
      </footer>
    </div>
  );
}

export default App;
