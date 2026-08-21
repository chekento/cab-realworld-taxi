import type { Coordinate, RouteOption, TrafficIncident, TrafficSeverity, TrafficSnapshot } from '../../core/contracts';

const MAX_ROUTE_POINTS = 64;
const REQUEST_TIMEOUT_MS = 10_000;

interface TrafficProxyResponse {
  provider?: unknown;
  fetchedAt?: unknown;
  trafficDurationSeconds?: unknown;
  delaySeconds?: unknown;
  averageSpeedKmh?: unknown;
  freeFlowSpeedKmh?: unknown;
  congestionRatio?: unknown;
  routeClosed?: unknown;
  incidents?: unknown;
}

export class TrafficProxyNotConfiguredError extends Error {
  constructor() {
    super('Live traffic proxy is not configured. Set VITE_TRAFFIC_PROXY_URL to an HTTPS CAB traffic proxy endpoint.');
    this.name = 'TrafficProxyNotConfiguredError';
  }
}

function finiteNonNegative(value: unknown, fallback?: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return fallback;
  return value;
}

function validSeverity(value: unknown): TrafficSeverity {
  return value === 'free' || value === 'light' || value === 'moderate' || value === 'heavy' || value === 'blocked'
    ? value
    : 'moderate';
}

function normalizeIncidents(value: unknown): TrafficIncident[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 100).flatMap((candidate, index) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const item = candidate as Record<string, unknown>;
    const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `incident-${index}`;
    const type = typeof item.type === 'string' && item.type.trim() ? item.type.trim() : 'traffic';
    const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : undefined;
    const startTime = typeof item.startTime === 'string' ? item.startTime : undefined;
    const endTime = typeof item.endTime === 'string' ? item.endTime : undefined;

    let point: Coordinate | undefined;
    if (item.point && typeof item.point === 'object') {
      const rawPoint = item.point as Record<string, unknown>;
      const latitude = typeof rawPoint.latitude === 'number' ? rawPoint.latitude : NaN;
      const longitude = typeof rawPoint.longitude === 'number' ? rawPoint.longitude : NaN;
      if (Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
        point = { latitude, longitude };
      }
    }

    return [{ id, type, title, severity: validSeverity(item.severity), startTime, endTime, point }];
  });
}

function sampleGeometry(geometry: Coordinate[]): Coordinate[] {
  if (geometry.length <= MAX_ROUTE_POINTS) return geometry;
  const result: Coordinate[] = [];
  const lastIndex = geometry.length - 1;
  for (let i = 0; i < MAX_ROUTE_POINTS; i += 1) {
    const sourceIndex = Math.round((i / (MAX_ROUTE_POINTS - 1)) * lastIndex);
    const point = geometry[sourceIndex];
    if (point) result.push(point);
  }
  return result;
}

function getProxyUrl(): URL {
  const configured = import.meta.env.VITE_TRAFFIC_PROXY_URL?.trim();
  if (!configured) throw new TrafficProxyNotConfiguredError();
  const url = new URL(configured);
  if (url.protocol !== 'https:') throw new Error('Live traffic proxy must use HTTPS.');
  return url;
}

export async function loadRouteTraffic(route: RouteOption): Promise<TrafficSnapshot> {
  const url = getProxyUrl();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: 1,
        baselineDurationSeconds: route.durationSeconds,
        baselineDistanceMeters: route.distanceMeters,
        route: sampleGeometry(route.geometry)
      }),
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'omit'
    });

    if (!response.ok) throw new Error(`Traffic proxy request failed with HTTP ${response.status}.`);
    const payload = await response.json() as TrafficProxyResponse;
    const trafficDurationSeconds = finiteNonNegative(payload.trafficDurationSeconds);
    const delaySeconds = finiteNonNegative(payload.delaySeconds);

    if (trafficDurationSeconds === undefined && delaySeconds === undefined) {
      throw new Error('Traffic proxy response did not contain a valid live duration or delay.');
    }

    const normalizedDelay = delaySeconds ?? Math.max(0, (trafficDurationSeconds ?? route.durationSeconds) - route.durationSeconds);
    const normalizedDuration = trafficDurationSeconds ?? route.durationSeconds + normalizedDelay;

    return {
      provider: typeof payload.provider === 'string' && payload.provider.trim() ? payload.provider.trim() : 'Configured traffic provider',
      fetchedAt: finiteNonNegative(payload.fetchedAt, Date.now()) ?? Date.now(),
      baselineDurationSeconds: route.durationSeconds,
      trafficDurationSeconds: normalizedDuration,
      delaySeconds: normalizedDelay,
      averageSpeedKmh: finiteNonNegative(payload.averageSpeedKmh),
      freeFlowSpeedKmh: finiteNonNegative(payload.freeFlowSpeedKmh),
      congestionRatio: finiteNonNegative(payload.congestionRatio),
      routeClosed: payload.routeClosed === true,
      incidents: normalizeIncidents(payload.incidents)
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Live traffic proxy timed out.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
