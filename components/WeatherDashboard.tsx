import React from 'react';
import type { WeatherData, Language } from '../types';
import CurrentWeather from './CurrentWeather';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForecast';
import SummaryCard from './SummaryCard';
import DataSourceCard from './InfoCard';
import { texts } from '../constants';

interface WeatherDashboardProps {
  weatherData: WeatherData;
  lang: Language;
}

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ weatherData, lang }) => {
  const text = texts[lang];
  const { current, minutely_summary, daily, summaries, dates, sources } = weatherData;

  // Ensure daily data exists before trying to access it
  const today = daily && daily.length > 0 ? daily[0] : null;
  
  // Show the full hourly forecast for today
  const todaysHourly = today ? today.hourly : [];

  const dayName = today ? today.day_name : '';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up">
      {/* Main Column */}
      <div className="xl:col-span-2 space-y-6">
        <CurrentWeather 
          current={current} 
          dates={dates} 
          dayName={dayName}
          lang={lang} 
        />
        <SummaryCard title={text.minuteCast} content={minutely_summary} lang={lang} />
        <HourlyForecast data={todaysHourly} title={text.hourlyForecast} lang={lang} />
        <DailyForecast data={daily} title={text.weeklyForecast} lang={lang} />
      </div>

      {/* Sidebar Column */}
      <div className="xl:col-span-1 space-y-6">
        <SummaryCard title={text.todaysSummary} content={summaries.today} lang={lang} />
        <SummaryCard title={text.tomorrowsSummary} content={summaries.tomorrow} lang={lang} />
        <SummaryCard title={text.weeklySummary} content={summaries.week} lang={lang} />
        {sources && sources.length > 0 && (
          <DataSourceCard sources={sources} lang={lang} />
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;