
export type Language = 'en' | 'bn';
export type Page = 'weather' | 'prayer' | 'accuweather';

export type WeatherIconType = 'clear-day' | 'clear-night' | 'partly-cloudy-day' | 'partly-cloudy-night' | 'cloudy' | 'rain' | 'sleet' | 'snow' | 'wind' | 'fog' | 'thunderstorm' | 'drizzle' | 'rain-heavy' | 'thunderstorm-rain' | 'default';

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface CurrentWeather {
  location_name: string;
  location_details: string;
  temperature: number;
  feels_like: number;
  condition: string;
  icon: WeatherIconType;
  humidity: number;
  wind_speed: number;
  air_quality_description: string;
  air_quality_value: string;
  sunrise: string;
  sunset: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  icon: WeatherIconType;
  precipitation_probability: number;
}

export interface DailyForecast {
  date: string;
  day_name: string;
  temp_max: number;
  temp_min: number;
  condition:string;
  icon: WeatherIconType;
  hourly: HourlyForecast[];
  precipitation_probability: number;
}

export interface WeatherSummaries {
  today: string;
  tomorrow: string;
  week: string;
}

export interface WeatherData {
  current: CurrentWeather;
  minutely_summary: string;
  daily: DailyForecast[];
  summaries: WeatherSummaries;
  dates: {
    gregorian: string;
    bengali: string;
    hijri: string;
  }
  sources?: GroundingSource[];
  accuweatherUrl?: string;
}

export interface PrayerTime {
    start: string;
    end: string;
}

export interface PrayerTimesData {
    fajr: PrayerTime;
    dhuhr: PrayerTime;
    asr: PrayerTime;
    maghrib: PrayerTime;
    isha: PrayerTime;
    date: string;
    location: string;
    sources?: GroundingSource[];
}