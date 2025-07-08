
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { fetchWeather, fetchPrayerTimes } from './services/geminiService';
import type { WeatherData, PrayerTimesData, Language, Page } from './types';
import { texts } from './constants';
import Header from './components/Header';
import WeatherDashboard from './components/WeatherDashboard';
import PrayerTimes from './components/PrayerTimes';
import AccuWeather from './components/AccuWeather';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import InitialSearch from './components/InitialSearch';
import Footer from './components/Footer';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('bn');
  const [location, setLocation] = useState<string | null>(null);
  const [accuWeatherLocation, setAccuWeatherLocation] = useState<string | null>(null);
  const [accuweatherUrl, setAccuweatherUrl] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('weather');
  const [geolocationFailed, setGeolocationFailed] = useState<boolean>(false);

  const handleFetchData = useCallback(async (loc: string, newLang?: Language) => {
    setIsLoading(true);
    setError(null);
    
    // Don't clear data for a simple language change
    if(!newLang) {
        setWeatherData(null);
        setPrayerTimes(null);
        setAccuweatherUrl(null);
    }
    
    const langToUse = newLang || language;

    try {
        const weatherPromise = fetchWeather(ai, loc, langToUse);
        const prayerPromise = fetchPrayerTimes(ai, loc, langToUse);

        const [weatherResult, prayerResult] = await Promise.all([weatherPromise, prayerPromise]);
        
        setWeatherData(weatherResult);
        setPrayerTimes(prayerResult);
        setAccuweatherUrl(weatherResult.accuweatherUrl || null);

        // Set the more specific location for AccuWeather
        if (weatherResult.current) {
            const newAccuWeatherLoc = `${weatherResult.current.location_name}, ${weatherResult.current.location_details}`;
            setAccuWeatherLocation(newAccuWeatherLoc);
        }

        setGeolocationFailed(false);
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error).message || texts[langToUse].error.generic;
      setError(errorMessage);
      localStorage.removeItem('defaultLocation'); // Clear bad location
      setLocation(null);
      setAccuWeatherLocation(null); // Clear AccuWeather location on error
      setAccuweatherUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const setAndSaveLocation = (newLocation: string) => {
    localStorage.setItem('defaultLocation', newLocation);
    setLocation(newLocation);
    handleFetchData(newLocation);
  };

  const handleLocationSearch = (newLocation: string) => {
    setAndSaveLocation(newLocation);
  };
  
  const handleGeolocate = () => {
    setIsLoading(true);
    setGeolocationFailed(false);
    
    const successCallback = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const locationString = `${latitude},${longitude}`;
      setAndSaveLocation(locationString);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.warn(`GEOLOCATION ERROR(${error.code}): ${error.message}`);
      setGeolocationFailed(true);
      setIsLoading(false);
    };
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
        timeout: 10000,
      });
    } else {
        setGeolocationFailed(true);
        setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (location) {
        handleFetchData(location, lang);
    }
  };

  // On initial mount, check for a saved location.
  useEffect(() => {
    const savedLocation = localStorage.getItem('defaultLocation');
    if (savedLocation) {
      setLocation(savedLocation);
      handleFetchData(savedLocation);
    } else {
      setIsLoading(false); // No location, stop loading and show initial search screen.
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleFetchData]);

  // Fetch data if we switch to a tab and data is missing
  useEffect(() => {
    if (location && (currentPage === 'weather' || currentPage === 'prayer')) {
        if (!weatherData || !prayerTimes) {
            handleFetchData(location);
        }
    }
  }, [currentPage, location, weatherData, prayerTimes, handleFetchData]);


  const getBackgroundClass = () => {
    if (!weatherData?.current) return 'from-gray-800 to-gray-900';
    
    const icon = weatherData.current.icon;

    switch (icon) {
      case 'clear-day': return 'from-sky-500 to-blue-700';
      case 'clear-night': return 'from-slate-900 via-indigo-950 to-black';
      case 'partly-cloudy-day': return 'from-sky-600 via-slate-600 to-slate-800';
      case 'partly-cloudy-night': return 'from-slate-800 via-indigo-900 to-slate-950';
      case 'cloudy': return 'from-slate-500 to-gray-700';
      case 'rain': case 'drizzle': case 'rain-heavy': return 'from-slate-700 via-blue-900 to-slate-950';
      case 'thunderstorm': case 'thunderstorm-rain': return 'from-gray-900 via-purple-950 to-indigo-950';
      case 'snow': case 'sleet': return 'from-sky-300 via-slate-400 to-gray-500';
      case 'fog': return 'from-gray-500 via-slate-600 to-gray-800';
      case 'wind': return 'from-teal-400 via-cyan-600 to-sky-700';
      default: return 'from-gray-800 to-gray-900';
    }
  };

  const renderContent = () => {
    if (!location) {
      return <InitialSearch 
                language={language}
                setLanguage={setLanguage}
                onSearch={handleLocationSearch}
                onGeolocate={handleGeolocate}
                geolocationFailed={geolocationFailed}
             />
    }
    
    // Central header for all pages with a location
    return (
      <>
        <Header
          language={language}
          setLanguage={handleLanguageChange}
          onSearch={handleLocationSearch}
          onGeolocate={handleGeolocate}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        <main className="mt-8 flex-grow flex flex-col">
          {error ? (
             <ErrorDisplay message={error} />
          ) : isLoading && currentPage !== 'accuweather' ? (
             <Loader lang={language} />
          ) : (
            <>
              {currentPage === 'weather' && weatherData && <WeatherDashboard weatherData={weatherData} lang={language} />}
              {currentPage === 'prayer' && prayerTimes && <PrayerTimes prayerTimes={prayerTimes} lang={language} />}
              {currentPage === 'accuweather' && location && <AccuWeather accuweatherUrl={accuweatherUrl} location={accuWeatherLocation || location} lang={language} />}
            </>
          )}
        </main>
      </>
    );
  };

  return (
    <div className={`bg-gradient-to-br ${getBackgroundClass()} min-h-screen text-white p-4 sm:p-6 md:p-8 flex flex-col`}>
        <div className="max-w-screen-2xl w-full mx-auto flex-grow flex flex-col">
          {renderContent()}
        </div>
        <Footer />
    </div>
  );
};

export default App;