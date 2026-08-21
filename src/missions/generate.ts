import type { Coordinate, MissionSeed, RealPoi, WorldContext } from '../core/contracts';
import { generatePassenger } from '../passengers/generate';

function radians(value: number): number {
  return (value * Math.PI) / 180;
}

export function distanceMeters(a: Coordinate, b: Coordinate): number {
  const earthRadius = 6_371_000;
  const deltaLat = radians(b.latitude - a.latitude);
  const deltaLon = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
}

function randomFrom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function choosePickup(context: WorldContext, pois: readonly RealPoi[]): RealPoi {
  const preferred = pois
    .map((poi) => ({ poi, distance: distanceMeters(context.position, poi.point) }))
    .filter(({ distance }) => distance >= 120 && distance <= 3_500)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 24)
    .map(({ poi }) => poi);

  return randomFrom(preferred.length > 0 ? preferred : pois);
}

function chooseDestination(pickup: RealPoi, pois: readonly RealPoi[]): RealPoi | undefined {
  const differentName = pois.filter((poi) => poi.osmId !== pickup.osmId && poi.name !== pickup.name);
  const preferred = differentName.filter((poi) => {
    const distance = distanceMeters(pickup.point, poi.point);
    return distance >= 700 && distance <= 8_000;
  });

  if (preferred.length > 0) return randomFrom(preferred);

  return differentName
    .map((poi) => ({ poi, distance: distanceMeters(pickup.point, poi.point) }))
    .sort((a, b) => b.distance - a.distance)[0]?.poi;
}

export function createRealWorldMission(context: WorldContext, pois: readonly RealPoi[]): MissionSeed {
  const base: MissionSeed = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    origin: context.position,
    status: 'awaiting-live-pois'
  };

  if (pois.length < 2) return base;

  const pickup = choosePickup(context, pois);
  const destination = chooseDestination(pickup, pois);
  if (!destination) return base;

  return {
    ...base,
    pickup,
    destination,
    passenger: generatePassenger(),
    status: 'ready'
  };
}
