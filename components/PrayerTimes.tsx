import React from 'react';
import type { PrayerTimesData, Language } from '../types';
import { texts } from '../constants';
import { Sunrise, Sun, Sunset, Moon, Sparkles } from 'lucide-react';
import DataSourceCard from './InfoCard';

interface PrayerTimesProps {
  prayerTimes: PrayerTimesData;
  lang: Language;
}

const prayerIcons: Record<string, React.ReactNode> = {
    fajr: <Sunrise className="text-cyan-300" />,
    dhuhr: <Sun className="text-yellow-300" />,
    asr: <Sun className="text-orange-300" />,
    maghrib: <Sunset className="text-amber-500" />,
    isha: <Moon className="text-indigo-300" />,
    default: <Sparkles className="text-white" />
};

const PrayerTimes: React.FC<PrayerTimesProps> = ({ prayerTimes, lang }) => {
  const text = texts[lang];
  const prayerOrder: (keyof Omit<PrayerTimesData, 'date' | 'location' | 'sources'>)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const { sources } = prayerTimes;

  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <div className="bg-black/25 p-6 sm:p-8 rounded-2xl shadow-lg backdrop-blur-md border border-white/20">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold ${lang === 'bn' ? 'font-bengali' : ''}`}>{text.prayerSchedule}</h2>
          <p className={`text-lg text-white/80 mt-1 ${lang === 'bn' ? 'font-bengali' : ''}`}>{prayerTimes.location}</p>
          <p className={`text-md text-white/60 ${lang === 'bn' ? 'font-bengali' : ''}`}>{prayerTimes.date}</p>
        </div>
        
        <div className="space-y-3">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-3 gap-4 px-4 py-2 text-white/70 font-semibold">
              <div className={lang === 'bn' ? 'font-bengali' : ''}>{text.waqt}</div>
              <div className={`text-center ${lang === 'bn' ? 'font-bengali' : ''}`}>{text.start}</div>
              <div className={`text-center ${lang === 'bn' ? 'font-bengali' : ''}`}>{text.end}</div>
          </div>
          
          {/* Prayer Rows */}
          {prayerOrder.map((prayerKey, index) => (
            <div key={prayerKey} 
                 className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center bg-white/5 hover:bg-white/10 p-4 rounded-lg transition-all duration-300"
                 style={{ animation: `fadeInUp 0.5s ${index * 0.1}s ease-out forwards`, opacity: 0 }}>
              
              {/* Prayer Name */}
              <div className="flex items-center space-x-4">
                  {prayerIcons[prayerKey] || prayerIcons.default}
                  <span className={`font-bold text-lg ${lang === 'bn' ? 'font-bengali' : ''}`}>{text[prayerKey]}</span>
              </div>

              {/* Start and End Times */}
              <div className="flex justify-between items-center col-span-1 md:col-span-2">
                <div className="flex-1 text-center">
                    <div className={`block md:hidden text-xs text-white/60 mb-1 ${lang === 'bn' ? 'font-bengali' : ''}`}>{text.start}</div>
                    <span className="font-mono text-lg">{prayerTimes[prayerKey].start}</span>
                </div>
                <div className="flex-1 text-center">
                    <div className={`block md:hidden text-xs text-white/60 mb-1 ${lang === 'bn' ? 'font-bengali' : ''}`}>{text.end}</div>
                    <span className="font-mono text-lg">{prayerTimes[prayerKey].end}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {sources && sources.length > 0 && (
          <div className="mt-6">
              <DataSourceCard sources={sources} lang={lang} />
          </div>
      )}
    </div>
  );
};

export default PrayerTimes;