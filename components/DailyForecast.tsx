import React, { useState } from 'react';
import type { DailyForecast as DailyForecastType, Language } from '../types';
import WeatherIcon from './WeatherIcon';
import HourlyForecast from './HourlyForecast';
import { ChevronDown, Droplets } from 'lucide-react';

interface DailyForecastProps {
  data: DailyForecastType[];
  title: string;
  lang: Language;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ data, title, lang }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Start with today (index 0) open

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-black/20 p-4 sm:p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20">
      <h3 className={`text-xl font-semibold mb-4 ${lang === 'bn' ? 'font-bengali' : ''}`}>{title}</h3>
      <ul className="space-y-2">
        {data.map((day, index) => (
          <li 
            key={index} 
            className="bg-white/5 rounded-lg transition-all duration-500 ease-in-out overflow-hidden"
          >
            <button 
              onClick={() => handleToggle(index)}
              className="w-full grid grid-cols-[1fr,auto,1fr,auto] sm:grid-cols-[1fr,auto,1.5fr,1fr,auto] items-center gap-2 p-3 cursor-pointer hover:bg-white/10 text-left"
              aria-expanded={openIndex === index}
              aria-controls={`forecast-details-${index}`}
            >
              <span className={`font-medium w-24 truncate ${lang === 'bn' ? 'font-bengali' : ''}`}>{day.day_name}</span>
              
              <div className="flex items-center justify-center gap-2" title={`${day.precipitation_probability}% chance of rain`}>
                 <div className="w-8 h-8 sm:w-10 sm:h-10">
                    <WeatherIcon icon={day.icon || 'default'} isSmall={true}/>
                 </div>
                 <div className="flex items-center gap-1 text-xs text-cyan-200">
                    <Droplets size={12} />
                    <span>{day.precipitation_probability}%</span>
                 </div>
              </div>
              
              <span className={`text-sm text-white/80 text-center hidden sm:block capitalize truncate ${lang === 'bn' ? 'font-bengali' : ''}`}>{day.condition}</span>
              
              <span className="font-semibold text-right">{Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°</span>
              
              <ChevronDown 
                className={`ml-2 text-white/70 transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                size={20}
              />
            </button>
            <div 
              id={`forecast-details-${index}`}
              className={`transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              {openIndex === index && (
                <div className="p-4 border-t border-white/10">
                  <HourlyForecast 
                    data={day.hourly} 
                    title={lang === 'bn' ? `${day.day_name}-এর পূর্বাভাস` : `${day.day_name}'s Forecast`}
                    lang={lang} 
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DailyForecast;