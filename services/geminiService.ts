
import { GoogleGenAI } from "@google/genai";
import type { WeatherData, PrayerTimesData, Language, GroundingSource } from '../types';

function parseJsonResponse<T>(text: string): T {
    let jsonStr = text.trim();

    // Strategy 1: Look for a JSON markdown code block anywhere in the text.
    const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = jsonStr.match(fenceRegex);

    if (match && match[1]) {
        jsonStr = match[1].trim();
    } else {
        // Strategy 2: If no block, find the main JSON object/array.
        // This is a fallback for when the LLM forgets the markdown fence.
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        const firstBracket = jsonStr.indexOf('[');
        const lastBracket = jsonStr.lastIndexOf(']');

        let start = -1;
        let end = -1;

        if (firstBrace !== -1 && lastBrace > firstBrace) {
            // It's an object.
            start = firstBrace;
            end = lastBrace;
        } else if (firstBracket !== -1 && lastBracket > firstBracket) {
            // It's an array.
            start = firstBracket;
            end = lastBracket;
        }
        
        // If we found a start and end, extract the substring.
        if (start !== -1) {
            jsonStr = jsonStr.substring(start, end + 1);
        }
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
        You are a meteorological expert AI. Your sole purpose is to provide weather data that is as accurate and reliable as professional services like Google Weather or AccuWeather. The user's safety and planning depend on your accuracy. **NEVER guess or fabricate data.** All data must be derived directly from the search results of top-tier weather providers.

        You will be given a location: "${location}". Your tasks are:
        1.  **Upazila Identification**: First, you **MUST** identify the specific **Upazila** the location "${location}" belongs to. All subsequent steps will use this identified Upazila name. Resolve it to its primary name (e.g., 'Assasuni') and its administrative details (like District, Country). For example, if the input is "Kadakati", you must identify its Upazila as "Assasuni".
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
        8.  **MANDATORY - AccuWeather URL Generation (Upazila-based)**: You must generate a precise AccuWeather URL based on the location's **Upazila**. Follow these steps *exactly*:
            a. Take the **Upazila** you identified in step 1. This is the **only** location name you will use for this process.
            b. Perform a targeted Google Search to find the unique AccuWeather **Location Key** for that **Upazila**. Use a query like: "accuweather location key for [Identified Upazila Name], [District Name], Bangladesh".
            c. The key is a number (e.g., \`29013\`).
            d. Sanitize the **Upazila name** for the URL: make it lowercase and replace spaces with hyphens (e.g., "Assasuni" becomes "assasuni").
            e. Construct the final URL using this exact pattern: \`https://www.accuweather.com/en/bd/[sanitized-upazila-name]/[location-key]/weather-forecast/[location-key]\`.
            f. Example: For a location in Assasuni, Satkhira (key 29013), the final URL would be \`https://www.accuweather.com/en/bd/assasuni/29013/weather-forecast/29013\`.
            g. Place this constructed URL into the \`accuweatherUrl\` field in the JSON. If a location key cannot be found after a diligent search, and only in that case, you may omit the \`accuweatherUrl\` field.
        9.  **MANDATORY - Data Completeness & Integrity**:
            - You **MUST** return exactly 7 items in the \`daily\` array, for today and the next 6 days. **THIS IS A NON-NEGOTIABLE REQUIREMENT.** Do not provide a shorter forecast.
            - **EVERY SINGLE FIELD** in the JSON schema must be populated with an accurate, non-null value. This explicitly includes the \`dates\` object: you must find and provide the \`gregorian\`, \`bengali\`, AND \`hijri\` dates for the current day. Incomplete data is a failure to complete the task.
        10. **Output Format**: Your response **MUST** be a single, minified JSON object and nothing else. Do not include any introductory text, explanation, or markdown formatting around the JSON block. Your entire output must be a string that can be directly parsed into JSON. It must strictly adhere to the following TypeScript interface. Ensure all fields are present and the \`icon\` value is ONLY one of the specified \`WeatherIconType\` values.
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
        model: 'gemini-2.5-flash',
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
        Act as an Islamic prayer times provider. Your sole purpose is to provide prayer times based on the location's **Upazila**.
        You will be given a location: "${location}".
        
        1.  **Upazila Identification**: First, you **MUST** determine the specific **Upazila** that "${location}" belongs to. This is the only geographical unit you will use.
        2.  **MANDATORY Data Source**: You **MUST** find prayer times for the identified **Upazila** from the website \`salat.habibur.com\`. Use a targeted Google Search to find the correct page, for example: "prayer times for [Identified Upazila Name] site:salat.habibur.com". This is the **ONLY** acceptable source for Bangladeshi locations.
        3.  **Location Field in JSON**: The \`location\` field in your final JSON output must clearly state which Upazila's data was used, especially if the original input was more specific. For example, if the input was "Kadakati" and the Upazila is "Assasuni", the \`location\` field must be "Assasuni (for Kadakati)". This is a strict requirement.
        4.  **Data Accuracy**: Provide the most ACCURATE Hanafi prayer times for the identified Upazila for today's date.
        5.  **Date Context**: The current date is ${new Date().toISOString()}.
        6.  **Language**: The location name in the response should be in ${lang === 'bn' ? 'Bengali' : 'English'}.
        7.  **Time Formatting**: All prayer times (start and end) MUST be in a 12-hour AM/PM format (e.g., "4:15 AM", "1:30 PM", "7:00 PM").
        8.  **Output Format**: Your response **MUST** be a single, minified JSON object and nothing else. Do not include any introductory text, explanation, or markdown formatting around the JSON block. Your entire output must be a string that can be directly parsed into JSON. It must strictly adhere to the following TypeScript interface. Ensure all fields are present. **Under no circumstances should you respond with an explanation instead of the JSON. Always follow the logic and return a valid JSON object.**
            \`\`\`typescript
            interface GroundingSource { uri: string; title: string; }
            interface PrayerTime { start: string; end: string; }
            interface PrayerTimesData { fajr: PrayerTime; dhuhr: PrayerTime; asr: PrayerTime; maghrib: PrayerTime; isha: PrayerTime; date: string; location: string; sources?: GroundingSource[]; }
            \`\`\`
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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