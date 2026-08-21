import type { Coordinate, RouteOption, RouteSnapshot } from '../../core/contracts';

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

interface OsrmResponse {
  code: string;
  message?: string;
  routes?: OsrmRoute[];
}

const DEFAULT_OSRM_URL = 'https://router.project-osrm.org';

function resolveEndpoint(): string {
  const configured = import.meta.env.VITE_OSRM_URL?.trim();
  const endpoint = configured || DEFAULT_OSRM_URL;
  const parsed = new URL(endpoint);

  if (parsed.protocol !== 'https:') {
    throw new Error('CAB requires an HTTPS routing endpoint.');
  }

  return parsed.toString().replace(/\/$/, '');
}

function toOsrmCoordinate(point: Coordinate): string {
  return `${point.longitude.toFixed(6)},${point.latitude.toFixed(6)}`;
}

function normalizeRoute(route: OsrmRoute): RouteOption {
  return {
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    geometry: (route.geometry?.coordinates ?? []).map(([longitude, latitude]) => ({
      latitude,
      longitude
    }))
  };
}

export async function loadDrivingRoute(start: Coordinate, end: Coordinate): Promise<RouteSnapshot> {
  const endpoint = resolveEndpoint();
  const coordinates = `${toOsrmCoordinate(start)};${toOsrmCoordinate(end)}`;
  const url = new URL(`${endpoint}/route/v1/driving/${coordinates}`);
  url.searchParams.set('alternatives', 'true');
  url.searchParams.set('steps', 'false');
  url.searchParams.set('overview', 'full');
  url.searchParams.set('geometries', 'geojson');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Routing request failed with HTTP ${response.status}.`);
    }

    const data = (await response.json()) as OsrmResponse;
    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error(data.message || `Routing failed with code ${data.code}.`);
    }

    return {
      provider: configuredProviderName(),
      fetchedAt: Date.now(),
      routes: data.routes.map(normalizeRoute)
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Routing request timed out.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function configuredProviderName(): string {
  return import.meta.env.VITE_OSRM_URL?.trim() ? 'Configured OSRM' : 'OSRM demo';
}
