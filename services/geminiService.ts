
import { GoogleGenAI } from "@google/genai";
import type { WeatherData, PrayerTimesData, Language, GroundingSource } from '../types';

function parseJsonResponse<T>(text: string): T {
    let jsonStr = text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
        jsonStr = match[1].trim();
    }
    
    // Attempt to remove trailing commas from objects and arrays, a common LLM error.
    jsonStr = jsonStr.replace(/,(?=\s*?[}\]])/g, '');

    try {
        return JSON.parse(jsonStr) as T;
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
        console.error("Original text:", text);
        throw new Error("Could not parse data from the AI. The format was invalid.");
    }
}

export async function fetchWeather(ai: GoogleGenAI, location: string, lang: Language): Promise<WeatherData> {
    const prompt = `
        You are a meteorological expert AI. Your sole purpose is to provide weather data that is as accurate and reliable as professional services like Google Weather or AccuWeather. The user's safety and planning depend on your accuracy. **NEVER guess or fabricate data.** All data must be derived directly from the search results of top-tier weather providers. Lives and property may be at stake.

        You will be given a location: "${location}". Your tasks are:
        1.  **Location Resolution**: First, identify the most specific possible location. Resolve it to its primary name, and its administrative details (like Upazila, District, Country). For example, if the input is "Kadakati", resolve it to a primary name "Kadakati" and details "Assasuni, Satkhira, Bangladesh".
        2.  **Data Fetching & Verification**: Using real-time Google Search grounding, you **MUST** provide a forecast of the **HIGHEST POSSIBLE ACCURACY**. Your primary task is to act as an aggregator of the most reliable weather sources available (e.g., Google Weather, AccuWeather, The Weather Channel). **You MUST cross-reference information between these sources to resolve discrepancies and deliver the most trustworthy data.**
        3.  **Date Context**: The current date is ${new Date().toISOString()}.
        4.  **Language**: The language for all descriptive text (condition, day_name, summaries, location details, air quality description) must be ${lang === 'bn' ? 'Bengali' : 'English'}.
        5.  **Time Formatting**:
            - For all top-level time values (like sunrise, sunset), use a 12-hour AM/PM format (e.g., "6:30 AM", "7:00 PM").
            - For hourly forecasts:
                - If the language is English, use the standard 12-hour format (e.g., "9:00 AM", "2:00 PM").
                - **Crucially, if the language is Bengali, YOU MUST use a descriptive 12-hour format. Examples: 'সকাল ৯টা' for 9 AM, 'দুপুর ২টা' for 2 PM, 'সন্ধ্যা ৬টা' for 6 PM, 'রাত ৮টা' for 8 PM. DO NOT use AM/PM for Bengali hours.**
        6.  **Summaries**: For the 'summaries' object, provide **expansive, detailed, and descriptive** summaries for 'today', 'tomorrow', and 'week'. Each summary should be a rich paragraph covering temperature trends, precipitation chances, wind, and notable weather events, based on the aggregated data.
        7.  **Specific Data Requirements**:
            - **\`minutely_summary\`**: Provide a **CRITICALLY ACCURATE**, hyper-local, minute-by-minute precipitation forecast for the next 60 minutes. This is extremely important. Use the most precise data available from sources like AccuWeather's MinuteCast® or similar hyper-local services found via search. Example: "Light rain starting in 15 minutes, stopping in 45 minutes." If no precipitation is expected, state that with high confidence, e.g., "No precipitation expected in the next hour."
            - **\`precipitation_probability\`**: For both \`hourly\` and \`daily\` forecasts, include a numeric \`precipitation_probability\` field representing the chance of precipitation as a percentage (0-100).
            - **\`hourly\` forecast arrays**:
                - For \`daily[0]\` (today), the \`hourly\` array must contain a 24-hour forecast starting from the **current hour of the day**.
                - For all subsequent days (\`daily[1]\` through \`daily[6]\`), the \`hourly\` array must contain a complete 24-hour forecast for that entire day (from 00:00 to 23:00).
        8. **MANDATORY - Data Completeness**:
            - You **MUST** return exactly 7 items in the \`daily\` array, one for today and one for each of the next 6 days. **NO EXCEPTIONS.**
            - **EVERY SINGLE FIELD** in the JSON schema must be populated with a valid value. Do not use null, empty strings, or placeholders. If a piece of data cannot be found, you must find a reasonable and accurate substitute from reliable sources. Incomplete data is unacceptable.
        8.5. **AccuWeather URL**: After resolving the location, perform an additional Google Search to find the specific AccuWeather forecast page URL for that location. The URL should look something like \`https://www.accuweather.com/en/bd/satkhira/29013/weather-forecast/29013\`. Include this URL in the JSON response in the \`accuweatherUrl\` field. If a specific page cannot be found, omit this field.
        9.  **Output Format**: Return the entire output as a single, minified JSON object that strictly adheres to the following TypeScript interface. Ensure all fields are present and the \`icon\` value is ONLY one of the specified \`WeatherIconType\` values.
            \`\`\`typescript
            interface GroundingSource { uri: string; title: string; }
            type WeatherIconType = 'clear-day' | 'clear-night' | 'partly-cloudy-day' | 'partly-cloudy-night' | 'cloudy' | 'rain' | 'sleet' | 'snow' | 'wind' | 'fog' | 'thunderstorm' | 'drizzle' | 'rain-heavy' | 'thunderstorm-rain' | 'default';
            interface CurrentWeather { location_name: string; location_details: string; temperature: number; feels_like: number; condition: string; icon: WeatherIconType; humidity: number; wind_speed: number; air_quality_description: string; air_quality_value: string; sunrise: string; sunset: string; }
            interface HourlyForecast { time: string; temp: number; condition: string; icon: WeatherIconType; precipitation_probability: number; }
            interface DailyForecast { date: string; day_name: string; temp_max: number; temp_min: number; condition: string; icon: WeatherIconType; hourly: HourlyForecast[]; precipitation_probability: number; }
            interface WeatherSummaries { today: string; tomorrow: string; week: string; }
            interface WeatherData { current: CurrentWeather; minutely_summary: string; daily: DailyForecast[]; summaries: WeatherSummaries; dates: { gregorian: string; bengali: string; hijri: string; }; sources?: GroundingSource[]; accuweatherUrl?: string; }
            \`\`\`
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingBudget: 0 },
        },
    });
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = (groundingMetadata?.groundingChunks ?? [])
        .filter((chunk): chunk is { web: { uri: string, title: string } } => 'web' in chunk && !!chunk.web?.uri)
        .map((chunk) => ({ uri: chunk.web.uri, title: chunk.web.title || new URL(chunk.web.uri).hostname }));

    const parsedData = parseJsonResponse<WeatherData>(response.text);
    parsedData.sources = sources.length > 0 ? sources : undefined;

    return parsedData;
}


export async function fetchPrayerTimes(ai: GoogleGenAI, location: string, lang: Language): Promise<PrayerTimesData> {
     const prompt = `
        Act as an Islamic prayer times provider. You will be given a location: "${location}".
        1.  **Location Resolution**: Resolve the location to a specific city/area/upazila in Bangladesh.
        2.  **MANDATORY Data Source & Location Fallback**: Your primary task is to find prayer times from the website \`salat.habibur.com\`.
            - First, try to find the exact location given ("${location}") on that site by searching Google for "prayer times for [resolved location] site:salat.habibur.com".
            - **If the exact location is NOT found**, you MUST find the **geographically closest Upazila or District** to "${location}" that *is* available on \`salat.habibur.com\`. Use that as the source for the prayer times.
            - **Crucially**, in the final JSON output, the \`location\` field must clearly state which location's data was used. For example, if the input was "Kadakati" and you used data for "Assasuni", the \`location\` field should be "Assasuni (for Kadakati)". This is the **ONLY** acceptable source for Bangladeshi locations.
        3.  **Data Accuracy**: Provide the most ACCURATE Hanafi prayer times for the *specific* resolved location for today's date.
        4.  **Date Context**: The current date is ${new Date().toISOString()}.
        5.  **Language**: The location name in the response should be in ${lang === 'bn' ? 'Bengali' : 'English'}.
        6.  **Time Formatting**: All prayer times (start and end) MUST be in a 12-hour AM/PM format (e.g., "4:15 AM", "1:30 PM", "7:00 PM").
        7.  **Output Format**: Return the entire output as a single, minified JSON object that strictly adheres to the following TypeScript interface. Ensure all fields are present. **Under no circumstances should you respond with an explanation instead of the JSON. Always follow the fallback logic and return a valid JSON object.**
            \`\`\`typescript
            interface GroundingSource { uri: string; title: string; }
            interface PrayerTime { start: string; end: string; }
            interface PrayerTimesData { fajr: PrayerTime; dhuhr: PrayerTime; asr: PrayerTime; maghrib: PrayerTime; isha: PrayerTime; date: string; location: string; sources?: GroundingSource[]; }
            \`\`\`
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingBudget: 0 },
        },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = (groundingMetadata?.groundingChunks ?? [])
        .filter((chunk): chunk is { web: { uri: string, title: string } } => 'web' in chunk && !!chunk.web?.uri)
        .map((chunk) => ({ uri: chunk.web.uri, title: chunk.web.title || new URL(chunk.web.uri).hostname }));
        
    const parsedData = parseJsonResponse<PrayerTimesData>(response.text);
    parsedData.sources = sources.length > 0 ? sources : undefined;
    
    return parsedData;
}