import React, { useState } from 'react';
import { NewsletterData } from '../types';

interface NewsletterPreviewProps {
  data: NewsletterData;
  onBack: () => void;
  onSend: (email: string) => void;
}

export const NewsletterPreview: React.FC<NewsletterPreviewProps> = ({ data, onBack, onSend }) => {
  const [email, setEmail] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSend(email);
    }
  };

  // Simple Markdown-ish renderer (converts ** to bold, ## to h2, * to bullet)
  // In a real app, use react-markdown. 
  const renderContent = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Headers
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-2xl font-serif font-bold text-gray-900 mt-8 mb-4 border-b pb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-serif font-bold text-gray-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      
      // Bullets
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.trim().substring(2);
        // Handle bolding within bullets
        const parts = content.split('**');
        return (
          <li key={idx} className="ml-6 list-disc mb-2 text-gray-700 font-serif leading-relaxed">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </li>
        );
      }

      // Regular Paragraphs with Bold support
      if (line.trim().length > 0) {
        const parts = line.split('**');
        return (
          <p key={idx} className="mb-4 text-gray-700 font-serif leading-relaxed text-lg">
             {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4 px-4 sm:px-8 flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Topics
        </button>
        <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider hidden sm:block">Preview Mode</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 px-4 sm:px-8">
        
        {/* The Newsletter Paper */}
        <div className="flex-1 bg-paper shadow-xl rounded-sm p-8 sm:p-12 border border-gray-200 min-h-[800px]">
           <div className="text-center border-b-2 border-gray-900 pb-8 mb-8">
             <h1 className="font-serif text-4xl sm:text-5xl font-black text-gray-900 mb-2">The Weekly Wire</h1>
             <div className="flex justify-between text-gray-500 text-sm font-sans uppercase tracking-widest mt-4">
                <span>Vol. 1</span>
                <span>{data.generatedAt.toLocaleDateString()}</span>
                <span>AI Edition</span>
             </div>
           </div>
           
           <div className="prose prose-lg max-w-none">
             {renderContent(data.content)}
           </div>

           {/* Sources Section */}
           {data.sources.length > 0 && (
             <div className="mt-12 pt-8 border-t border-gray-300">
               <h4 className="font-sans text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Sources & Further Reading</h4>
               <ul className="space-y-2">
                 {data.sources.map((source, idx) => (
                   <li key={idx} className="text-sm truncate">
                     <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-2">
                       <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                       {source.title || source.uri}
                     </a>
                   </li>
                 ))}
               </ul>
             </div>
           )}
        </div>

        {/* Sidebar Action */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-2xl">
              📬
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Send to Inbox</h3>
            <p className="text-gray-500 text-sm mb-6">
              Like what you see? Deliver this curated report straight to your email.
            </p>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all transform active:scale-95 flex justify-center items-center gap-2"
              >
                Send It
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-4 text-center">
              *This is a demo. No actual email will be sent, but you get the idea!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
