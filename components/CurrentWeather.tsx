
import React from 'react';
import type { CurrentWeather as CurrentWeatherType, Language } from '../types';
import { texts } from '../constants';
import WeatherIcon from './WeatherIcon';
import { Sunrise, Sunset, Droplets, Wind, Leaf } from 'lucide-react';
import DateDisplay from './DateDisplay';

interface CurrentWeatherProps {
  current: CurrentWeatherType;
  dates: {
    gregorian: string;
    bengali: string;
    hijri: string;
  };
  dayName: string;
  lang: Language;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ current, dates, dayName, lang }) => {
  const text = texts[lang];

  const DetailItem: React.FC<{icon: React.ReactNode, label: string, value: string | number}> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
      <div className="text-white/70">{icon}</div>
      <div>
        <p className={`text-sm text-white/70 ${lang === 'bn' ? 'font-bengali' : ''}`}>{label}</p>
        <p className={`font-semibold text-base ${lang === 'bn' ? 'font-bengali' : ''}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-black/25 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Left Column: Main Weather Info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="w-32 h-32 md:w-40 md:h-40 -mt-16 md:-mt-20 -mb-2">
            <WeatherIcon icon={current.icon || 'default'} />
          </div>
          <p className="text-6xl sm:text-7xl font-bold tracking-tighter">{Math.round(current.temperature)}°</p>
          <p className={`text-xl font-medium mt-1 capitalize ${lang === 'bn' ? 'font-bengali' : ''}`}>{current.condition}</p>
          <p className={`text-base text-white/80 ${lang === 'bn' ? 'font-bengali' : ''}`}>
            {text.feelsLike} {Math.round(current.feels_like)}°
          </p>
           <div className="mt-4 pt-4 border-t border-white/10 w-full">
                <h2 className={`text-2xl font-bold truncate ${lang === 'bn' ? 'font-bengali' : ''}`}>{current.location_name}</h2>
                <p className={`text-sm text-white/70 truncate ${lang === 'bn' ? 'font-bengali' : ''}`}>{current.location_details}</p>
           </div>
        </div>
        
        {/* Right Column: Details */}
        <div className="flex flex-col gap-4">
            <DateDisplay dates={dates} dayName={dayName} lang={lang} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DetailItem icon={<Sunrise size={24}/>} label={text.sunrise} value={current.sunrise} />
                <DetailItem icon={<Sunset size={24}/>} label={text.sunset} value={current.sunset} />
                <DetailItem icon={<Droplets size={24}/>} label={text.humidity} value={`${current.humidity}%`} />
                <DetailItem icon={<Wind size={24}/>} label={text.wind} value={`${current.wind_speed} km/h`} />
            </div>
             <DetailItem icon={<Leaf size={24}/>} label={text.airQuality} value={`${current.air_quality_description} (${current.air_quality_value})`} />
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
