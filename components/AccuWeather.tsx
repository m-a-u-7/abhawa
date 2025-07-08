
import React from 'react';
import type { Language } from '../types';

interface AccuWeatherProps {
  accuweatherUrl?: string | null;
  location: string;
  lang: Language;
}

const AccuWeather: React.FC<AccuWeatherProps> = ({ accuweatherUrl, location, lang }) => {
  const getSrcUrl = () => {
    let url = accuweatherUrl;
    // If we have a specific URL, sync its language with the app's language
    if (url) {
      if (lang === 'bn') {
        url = url.replace('/en/', '/bn/');
      } else {
        url = url.replace('/bn/', '/en/');
      }
      return url;
    }
    
    // Fallback to search if no specific URL is provided
    const searchLang = lang === 'bn' ? 'bn' : 'en';
    return `https://www.accuweather.com/${searchLang}/search-locations?q=${encodeURIComponent(location)}`;
  };
  
  const src = getSrcUrl();

  return (
    <div className="animate-fade-in-up w-full flex-grow flex flex-col bg-black/20 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 overflow-hidden" style={{minHeight: '80vh'}}>
      <iframe
        key={src} // Force iframe reload on src change
        src={src}
        title={`AccuWeather - ${location}`}
        className="w-full h-full flex-grow border-0 rounded-2xl"
        sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
      ></iframe>
    </div>
  );
};

export default AccuWeather;