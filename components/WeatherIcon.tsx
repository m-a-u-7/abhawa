
import React from 'react';
import { Sun, Moon, CloudSun, CloudMoon, Cloud, CloudRain, CloudLightning, Snowflake, Wind, CloudFog, ThermometerSun, CloudDrizzle, CloudRainWind, CloudHail } from 'lucide-react';
import type { WeatherIconType } from '../types';

interface WeatherIconProps {
  icon: WeatherIconType;
  isSmall?: boolean;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ icon, isSmall = false }) => {
  const size = isSmall ? 24 : 96;
  const strokeWidth = isSmall ? 1.5 : 1;

  const iconMap: Record<WeatherIconType, React.ReactNode> = {
    'clear-day': <Sun size={size} strokeWidth={strokeWidth} className="text-yellow-400 animate-spin-slow" />,
    'clear-night': <Moon size={size} strokeWidth={strokeWidth} className="text-indigo-200" />,
    'partly-cloudy-day': <CloudSun size={size} strokeWidth={strokeWidth} className="text-yellow-200" />,
    'partly-cloudy-night': <CloudMoon size={size} strokeWidth={strokeWidth} className="text-indigo-300" />,
    'cloudy': <Cloud size={size} strokeWidth={strokeWidth} className="text-gray-300" />,
    'rain': <CloudRain size={size} strokeWidth={strokeWidth} className="text-blue-300" />,
    'drizzle': <CloudDrizzle size={size} strokeWidth={strokeWidth} className="text-blue-200" />,
    'rain-heavy': <CloudRainWind size={size} strokeWidth={strokeWidth} className="text-blue-400" />,
    'sleet': <CloudHail size={size} strokeWidth={strokeWidth} className="text-sky-300" />,
    'snow': <Snowflake size={size} strokeWidth={strokeWidth} className="text-white animate-spin-slow" />,
    'wind': <Wind size={size} strokeWidth={strokeWidth} className="text-gray-200" />,
    'fog': <CloudFog size={size} strokeWidth={strokeWidth} className="text-gray-400" />,
    'thunderstorm': <CloudLightning size={size} strokeWidth={strokeWidth} className="text-yellow-300 animate-pulse" />,
    'thunderstorm-rain': (
        <div className="relative w-full h-full flex items-center justify-center">
          <CloudRain size={size} strokeWidth={strokeWidth} className="text-blue-300" />
          <CloudLightning size={size * 0.7} strokeWidth={strokeWidth} className="text-yellow-300 absolute opacity-90 animate-pulse" style={{ animationDuration: '1.5s' }} />
        </div>
      ),
    'default': <ThermometerSun size={size} strokeWidth={strokeWidth} className="text-orange-400" />
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
        {iconMap[icon] || iconMap['default']}
    </div>
  );
};

export default WeatherIcon;