
import React from 'react';
import type { Language } from '../types';
import { texts } from '../constants';

interface DateDisplayProps {
  dates: {
    gregorian: string;
    bengali: string;
    hijri: string;
  };
  dayName: string;
  lang: Language;
}

const DateLine: React.FC<{label: string, value: string, isBengali?: boolean}> = ({ label, value, isBengali=false }) => (
  <div className="flex items-baseline text-sm">
    <span className="w-20 text-white/70 flex-shrink-0">{label}:</span>
    <span className={`${isBengali ? 'font-bengali' : ''} font-medium text-white/90`}>{value}</span>
  </div>
);

const DateDisplay: React.FC<DateDisplayProps> = ({ dates, dayName, lang }) => {
  const text = texts[lang];

  return (
    <div className="bg-white/5 p-4 rounded-lg">
         <h3 className={`font-semibold text-lg mb-2 ${lang === 'bn' ? 'font-bengali' : ''}`}>{text.day}: {dayName}</h3>
         <div className="flex flex-col gap-1.5">
            <DateLine label={text.gregorian} value={dates.gregorian} />
            <DateLine label={text.bengali} value={dates.bengali} isBengali={true} />
            <DateLine label={text.hijri} value={dates.hijri} />
         </div>
    </div>
  );
};

export default DateDisplay;
