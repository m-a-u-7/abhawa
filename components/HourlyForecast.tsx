import React, { useState } from 'react';
import type { HourlyForecast as HourlyForecastType, Language } from '../types';
import WeatherIcon from './WeatherIcon';
import { Droplets } from 'lucide-react';

interface HourlyForecastProps {
  data: HourlyForecastType[];
  title: string;
  lang: Language;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data, title, lang }) => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const handleInteraction = (index: number) => {
    setActiveTooltip(activeTooltip === index ? null : index);
  };
  
  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  return (
    <div className="bg-black/20 p-4 sm:p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20">
      <h3 className={`text-xl font-semibold mb-2 ${lang === 'bn' ? 'font-bengali' : ''}`}>{title}</h3>
      <div className="relative scroll-fade-right">
        <div 
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent -mb-4 -mr-4 pr-4"
          onMouseLeave={handleMouseLeave}
          >
          <div className="flex space-x-4 pt-8 pb-4">
              {data.map((hour, index) => (
                <div 
                  key={index} 
                  className="relative flex flex-col items-center space-y-1 flex-shrink-0 bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-lg w-24 text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  >
                  <p className={`text-sm font-medium ${lang === 'bn' ? 'font-bengali' : ''}`}>{hour.time}</p>
                  <div 
                    className="w-10 h-10 cursor-pointer my-1" 
                    onClick={() => handleInteraction(index)}
                    onMouseEnter={() => setActiveTooltip(index)}
                  >
                    <WeatherIcon icon={hour.icon || 'default'} isSmall={true} />
                  </div>
                  <p className="text-xl font-bold">{Math.round(hour.temp)}°</p>
                   <div className="flex items-center justify-center gap-1 text-xs text-cyan-200 opacity-80" title={`${hour.precipitation_probability}% chance of rain`}>
                    <Droplets size={12} />
                    <span>{hour.precipitation_probability}%</span>
                  </div>
                  
                  {activeTooltip === index && (
                    <div 
                      className="absolute bottom-full mb-2 w-max max-w-[150px] bg-gray-900/80 backdrop-blur-sm text-white text-xs font-medium rounded-md py-1 px-3 z-20 shadow-lg text-center capitalize"
                    >
                      {hour.condition}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;