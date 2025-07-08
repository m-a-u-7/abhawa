import React, { useState } from 'react';
import { Search, Crosshair, CloudSun } from 'lucide-react';
import type { Language } from '../types';
import { texts } from '../constants';

interface InitialSearchProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onSearch: (location: string) => void;
  onGeolocate: () => void;
  geolocationFailed: boolean;
}

const InitialSearch: React.FC<InitialSearchProps> = ({ language, setLanguage, onSearch, onGeolocate, geolocationFailed }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const text = texts[language];

  return (
    <div className="flex items-center justify-center min-h-screen p-4 -my-8">
      <div className="w-full max-w-md text-center animate-fade-in-up">
        <div className="bg-black/25 p-8 rounded-2xl shadow-lg backdrop-blur-md border border-white/20">
          
          <CloudSun size={80} strokeWidth={1} className="text-white/80 mx-auto mb-4 animate-[pulse_5s_ease-in-out_infinite]" />

          <h1 className={`text-4xl font-bold tracking-tighter text-white mb-2 ${language === 'bn' ? 'font-bengali' : ''}`}>
            {text.initialSearchTitle}
          </h1>
          <p className={`text-white/80 mb-8 ${language === 'bn' ? 'font-bengali' : ''}`}>
            {text.initialSearchPrompt}
          </p>
          
          {geolocationFailed && (
            <div className={`bg-yellow-500/20 text-yellow-200 text-center p-2 rounded-lg mb-4 border border-yellow-500/30 text-sm ${language === 'bn' ? 'font-bengali' : ''}`}>
                {texts[language].error.location}
            </div>
           )}

          <form onSubmit={handleSearch} className="relative w-full mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={text.searchPlaceholder}
                className={`w-full bg-white/10 placeholder-white/60 text-white rounded-full py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-300 ${language === 'bn' ? 'font-bengali' : ''}`}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={22} />
              <button
                type="submit"
                aria-label={text.search}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors flex-shrink-0 disabled:bg-blue-500/50 disabled:cursor-not-allowed"
                disabled={!searchTerm.trim()}
              >
                <Search size={20} />
              </button>
          </form>

          <div className="flex items-center my-6">
              <div className="flex-grow border-t border-white/20"></div>
              <span className={`flex-shrink mx-4 text-white/60 text-sm ${language === 'bn' ? 'font-bengali' : ''}`}>{text.or}</span>
              <div className="flex-grow border-t border-white/20"></div>
          </div>
          
          <button
            onClick={onGeolocate}
            className={`w-full flex items-center justify-center gap-3 py-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors ${language === 'bn' ? 'font-bengali' : ''}`}
          >
            <Crosshair size={18} />
            {text.useCurrentLocation}
          </button>

          <div className="mt-8 flex items-center justify-center bg-black/20 rounded-full p-1 w-min mx-auto">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${language === 'en' ? 'bg-white text-blue-600' : 'text-white/80 hover:bg-white/10'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${language === 'bn' ? 'bg-white text-blue-600' : 'text-white/80 hover:bg-white/10'}`}
            >
              BN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialSearch;