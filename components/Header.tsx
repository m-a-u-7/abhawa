
import React, { useState } from 'react';
import { Search, Crosshair } from 'lucide-react';
import type { Language, Page } from '../types';
import { texts } from '../constants';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onSearch: (location: string) => void;
  onGeolocate: () => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage, onSearch, onGeolocate, currentPage, setCurrentPage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setSearchTerm('');
    }
  };

  const text = texts[language];

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      {/* Left: Title */}
      <div className="flex items-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-white">
          {text.appName}
        </h1>
      </div>

      {/* Center: Search */}
      <div className="w-full md:w-auto md:flex-1 md:max-w-sm lg:max-w-md order-3 md:order-2">
        <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={text.searchPlaceholder}
              className={`w-full bg-white/10 placeholder-white/60 text-white rounded-full py-2.5 pl-10 pr-20 focus:outline-none focus:ring-2 focus:ring-white/50 transition duration-300 ${language === 'bn' ? 'font-bengali' : ''}`}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={20} />
            <button
              type="button"
              onClick={onGeolocate}
              aria-label="Use current location"
              className="absolute right-11 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <Crosshair size={18} />
            </button>
             <button
              type="submit"
              aria-label={text.search}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 rounded-full text-white hover:bg-blue-400 transition-colors disabled:bg-blue-500/50 disabled:cursor-not-allowed"
              disabled={!searchTerm.trim()}
            >
              <Search size={18} />
            </button>
        </form>
      </div>


      {/* Right: Nav & Language */}
      <div className="flex items-center justify-end bg-black/20 rounded-full p-1 order-2 md:order-3">
        {/* Navigation Tabs */}
        <button
          onClick={() => setCurrentPage('weather')}
          className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 ${currentPage === 'weather' ? 'bg-white text-blue-600 shadow-md' : 'text-white/80 hover:bg-white/10'} ${language === 'bn' ? 'font-bengali' : ''}`}
        >
          {text.weather}
        </button>
        <button
          onClick={() => setCurrentPage('prayer')}
          className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 ${currentPage === 'prayer' ? 'bg-white text-blue-600 shadow-md' : 'text-white/80 hover:bg-white/10'} ${language === 'bn' ? 'font-bengali' : ''}`}
        >
          {text.prayerTimes}
        </button>
        <button
          onClick={() => setCurrentPage('accuweather')}
          className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-300 ${currentPage === 'accuweather' ? 'bg-white text-blue-600 shadow-md' : 'text-white/80 hover:bg-white/10'} ${language === 'bn' ? 'font-bengali' : ''}`}
        >
          {text.accuweather}
        </button>
        
        <div className="h-6 w-px bg-white/20 mx-1"></div>

        {/* Language Switcher */}
        <div className="flex items-center">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${language === 'en' ? 'bg-white text-blue-600' : 'text-white/80 hover:bg-white/10'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${language === 'bn' ? 'bg-white text-blue-600' : 'text-white/80 hover:bg-white/10'}`}
            >
              BN
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;