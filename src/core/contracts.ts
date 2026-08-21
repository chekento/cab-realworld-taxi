export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface GeoPoint extends Coordinate {
  accuracyMeters: number;
  capturedAt: number;
}

export interface RealPoi {
  osmId: string;
  name: string;
  category: string;
  point: Coordinate;
}

export interface RouteOption {
  distanceMeters: number;
  durationSeconds: number;
  geometry: Coordinate[];
}

export interface RouteSnapshot {
  provider: string;
  fetchedAt: number;
  routes: RouteOption[];
}

export interface WeatherSnapshot {
  provider: string;
  fetchedAt: number;
  observedAt: string;
  temperatureC: number;
  apparentTemperatureC: number;
  precipitationMm: number;
  rainMm: number;
  snowfallCm: number;
  weatherCode: number;
  cloudCoverPercent: number;
  windSpeedKmh: number;
  windGustKmh: number;
  isDay: boolean;
}

export type TrafficSeverity = 'free' | 'light' | 'moderate' | 'heavy' | 'blocked';

export interface TrafficIncident {
  id: string;
  type: string;
  title?: string;
  severity: TrafficSeverity;
  startTime?: string;
  endTime?: string;
  point?: Coordinate;
}

export interface TrafficSnapshot {
  provider: string;
  fetchedAt: number;
  baselineDurationSeconds: number;
  trafficDurationSeconds: number;
  delaySeconds: number;
  averageSpeedKmh?: number;
  freeFlowSpeedKmh?: number;
  congestionRatio?: number;
  routeClosed: boolean;
  incidents: TrafficIncident[];
}

export interface WorldContext {
  position: GeoPoint;
  localTimeIso: string;
  weatherStatus: 'pending' | 'live' | 'degraded';
  trafficStatus: 'pending' | 'live' | 'degraded';
  poiStatus: 'pending' | 'live' | 'degraded';
}

export interface PassengerDNA {
  id: string;
  name: string;
  age: number;
  occupation: string;
  temperament: 'calm' | 'chatty' | 'impatient' | 'reserved' | 'eccentric';
  localKnowledge: number;
  routeTolerance: number;
  humor: number;
  comfortPriority: number;
  punctualityPriority: number;
  tipGenerosity: number;
}

export interface MissionSeed {
  id: string;
  createdAt: number;
  origin: GeoPoint;
  pickup?: RealPoi;
  destination?: RealPoi;
  passenger?: PassengerDNA;
  status: 'awaiting-live-pois' | 'ready' | 'active' | 'complete';
}

export interface RealWorldProvider<T> {
  readonly name: string;
  load(context: WorldContext): Promise<T>;
}
