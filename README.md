# SkyCast — Weather App

A responsive weather dashboard built with HTML, CSS and vanilla JavaScript.

## Features
- City search
- Current weather conditions
- Hourly forecast for today
- 3-day forecast (compatible with common free-tier WeatherAPI forecast access)
- Geolocation search
- Celsius / Fahrenheit switching
- Recent cities saved in browser local storage
- Dynamic weather backgrounds
- Responsive layout and reduced-motion support

## Setup
1. Create a WeatherAPI key at https://www.weatherapi.com/ and rotate/revoke any key previously placed in `script.js`.
2. Set `WEATHERAPI_KEY` and `WEATHERAPI_URL` as environment variables in your hosting provider. For local Vercel development, copy `.env.example` to `.env.local` and set both values there. Never commit `.env.local`.
3. Use `vercel dev` to run locally so the `/api/weather` serverless function is available.

## Deployment
Deploy this project to Vercel and add `WEATHERAPI_KEY` and `WEATHERAPI_URL` under **Project Settings → Environment Variables** for each environment. Set the URL to WeatherAPI's forecast endpoint. Redeploy after adding or changing the variables. The browser requests the same-origin `/api/weather` function; that function calls WeatherAPI with the server-side settings.

**Security:** Do not put the WeatherAPI key or endpoint URL in `script.js`, HTML, or any `VITE_`/`NEXT_PUBLIC_` variable. Environment variables only remain private when read by server-side code such as `api/weather.js`. `.env.example` contains placeholders only.
