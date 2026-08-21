import type { Coordinate, WeatherSnapshot } from '../../core/contracts';

const DEFAULT_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

function resolveEndpoint(): URL {
  const endpoint = import.meta.env.VITE_WEATHER_URL?.trim() || DEFAULT_WEATHER_URL;
  const url = new URL(endpoint);
  if (url.protocol !== 'https:') throw new Error('CAB requires an HTTPS weather endpoint.');
  return url;
}

export async function loadCurrentWeather(point: Coordinate): Promise<WeatherSnapshot> {
  const url = resolveEndpoint();
  url.searchParams.set('latitude', point.latitude.toFixed(6));
  url.searchParams.set('longitude', point.longitude.toFixed(6));
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,precipitation,rain,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m,is_day');
  url.searchParams.set('timezone', 'auto');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Weather request failed with HTTP ${response.status}.`);

    const data = await response.json() as { current?: Record<string, number | string> };
    const current = data.current;
    if (!current) throw new Error('Weather response did not contain current conditions.');

    return {
      provider: import.meta.env.VITE_WEATHER_URL?.trim() ? 'Configured weather provider' : 'Open-Meteo evaluation',
      fetchedAt: Date.now(),
      observedAt: String(current.time ?? ''),
      temperatureC: Number(current.temperature_2m ?? 0),
      apparentTemperatureC: Number(current.apparent_temperature ?? 0),
      precipitationMm: Number(current.precipitation ?? 0),
      rainMm: Number(current.rain ?? 0),
      snowfallCm: Number(current.snowfall ?? 0),
      weatherCode: Number(current.weather_code ?? -1),
      cloudCoverPercent: Number(current.cloud_cover ?? 0),
      windSpeedKmh: Number(current.wind_speed_10m ?? 0),
      windGustKmh: Number(current.wind_gusts_10m ?? 0),
      isDay: Number(current.is_day ?? 0) === 1
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Weather request timed out.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function weatherCodeLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Mixed';
}
