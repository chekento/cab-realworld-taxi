import type { Coordinate, GeoPoint, RealPoi } from '../../core/contracts';

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

const DEFAULT_OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const MAX_POIS = 200;

function toBoundingBox(center: Coordinate, radiusMeters: number): string {
  const latitudeDelta = radiusMeters / 111_320;
  const longitudeScale = Math.max(Math.cos((center.latitude * Math.PI) / 180), 0.15);
  const longitudeDelta = radiusMeters / (111_320 * longitudeScale);

  const south = center.latitude - latitudeDelta;
  const west = center.longitude - longitudeDelta;
  const north = center.latitude + latitudeDelta;
  const east = center.longitude + longitudeDelta;

  return `${south.toFixed(6)},${west.toFixed(6)},${north.toFixed(6)},${east.toFixed(6)}`;
}

function buildQuery(center: Coordinate, radiusMeters: number): string {
  const bbox = toBoundingBox(center, radiusMeters);

  return `[out:json][timeout:15];
(
  nwr["amenity"]["name"](${bbox});
  nwr["tourism"]["name"](${bbox});
  nwr["shop"]["name"](${bbox});
  nwr["railway"="station"]["name"](${bbox});
  nwr["public_transport"~"station|platform"]["name"](${bbox});
  nwr["aeroway"~"aerodrome|terminal"]["name"](${bbox});
  nwr["office"]["name"](${bbox});
  nwr["leisure"]["name"](${bbox});
);
out center tags qt;`;
}

function categoryFromTags(tags: Record<string, string>): string {
  const keys = ['amenity', 'tourism', 'shop', 'railway', 'public_transport', 'aeroway', 'office', 'leisure'];
  for (const key of keys) {
    const value = tags[key];
    if (value) return `${key}:${value}`;
  }
  return 'place';
}

function normalizeElement(element: OverpassElement): RealPoi | null {
  const name = element.tags?.name?.trim();
  if (!name) return null;

  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    osmId: `${element.type}/${element.id}`,
    name,
    category: categoryFromTags(element.tags ?? {}),
    point: {
      latitude: latitude as number,
      longitude: longitude as number
    }
  };
}

function resolveEndpoint(): string {
  const configured = import.meta.env.VITE_OVERPASS_URL?.trim();
  const endpoint = configured || DEFAULT_OVERPASS_URL;
  const parsed = new URL(endpoint);

  if (parsed.protocol !== 'https:') {
    throw new Error('CAB requires an HTTPS Overpass endpoint.');
  }

  return parsed.toString();
}

export async function loadNearbyPois(position: GeoPoint, radiusMeters = 5_000): Promise<RealPoi[]> {
  const endpoint = resolveEndpoint();
  const query = buildQuery(position, radiusMeters);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 18_000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: new URLSearchParams({ data: query }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`OSM POI request failed with HTTP ${response.status}.`);
    }

    const data = (await response.json()) as OverpassResponse;
    const unique = new Map<string, RealPoi>();

    for (const element of data.elements ?? []) {
      const poi = normalizeElement(element);
      if (!poi) continue;
      unique.set(poi.osmId, poi);
      if (unique.size >= MAX_POIS) break;
    }

    return [...unique.values()];
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('OSM POI request timed out. Try again or configure another Overpass endpoint.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
