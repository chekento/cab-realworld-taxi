import L, { type Circle, type CircleMarker, type Map, type Polyline } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinate, MissionSeed, RouteOption } from '../../core/contracts';

const DEFAULT_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_ATTRIBUTION = '&copy; OpenStreetMap contributors';

function toLatLng(point: Coordinate): L.LatLngExpression {
  return [point.latitude, point.longitude];
}

function tileUrl(): string {
  const configured = import.meta.env.VITE_TILE_URL?.trim();
  const value = configured || DEFAULT_TILE_URL;
  if (!value.startsWith('https://')) {
    throw new Error('CAB map tile URL must use HTTPS.');
  }
  return value;
}

function tileAttribution(): string {
  return import.meta.env.VITE_TILE_ATTRIBUTION?.trim() || DEFAULT_ATTRIBUTION;
}

export class CabLiveMap {
  private readonly map: Map;
  private readonly playerMarker: CircleMarker;
  private readonly accuracyCircle: Circle;
  private pickupMarker?: CircleMarker;
  private destinationMarker?: CircleMarker;
  private routeLine?: Polyline;
  private followPlayer = true;

  constructor(container: HTMLElement, player: Coordinate, accuracyMeters = 25) {
    this.map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true
    }).setView(toLatLng(player), 16);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.tileLayer(tileUrl(), {
      maxZoom: 19,
      attribution: tileAttribution()
    }).addTo(this.map);

    this.accuracyCircle = L.circle(toLatLng(player), {
      radius: Math.max(8, accuracyMeters),
      weight: 1,
      opacity: 0.45,
      fillOpacity: 0.08
    }).addTo(this.map);

    this.playerMarker = L.circleMarker(toLatLng(player), {
      radius: 9,
      weight: 4,
      opacity: 1,
      fillOpacity: 1
    }).bindTooltip('CAB · You', { direction: 'top' }).addTo(this.map);

    this.map.on('dragstart zoomstart', () => {
      this.followPlayer = false;
    });

    requestAnimationFrame(() => this.map.invalidateSize());
  }

  setPlayer(point: Coordinate, accuracyMeters?: number): void {
    const latLng = L.latLng(point.latitude, point.longitude);
    this.playerMarker.setLatLng(latLng);
    this.accuracyCircle.setLatLng(latLng);
    if (typeof accuracyMeters === 'number' && Number.isFinite(accuracyMeters)) {
      this.accuracyCircle.setRadius(Math.max(8, accuracyMeters));
    }
    if (this.followPlayer) this.map.panTo(latLng, { animate: true, duration: 0.35 });
  }

  setMission(mission: MissionSeed): void {
    if (!mission.pickup || !mission.destination) return;

    this.pickupMarker?.remove();
    this.destinationMarker?.remove();

    this.pickupMarker = L.circleMarker(toLatLng(mission.pickup.point), {
      radius: 9,
      weight: 3,
      opacity: 1,
      fillOpacity: 0.95
    }).bindTooltip(`Pickup · ${mission.pickup.name}`, { direction: 'top' }).addTo(this.map);

    this.destinationMarker = L.circleMarker(toLatLng(mission.destination.point), {
      radius: 9,
      weight: 3,
      opacity: 1,
      fillOpacity: 0.95
    }).bindTooltip(`Drop-off · ${mission.destination.name}`, { direction: 'top' }).addTo(this.map);

    this.fitMission();
  }

  setRoute(route: RouteOption): void {
    this.routeLine?.remove();
    const points = route.geometry.map(toLatLng);
    if (points.length < 2) return;

    this.routeLine = L.polyline(points, {
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    this.fitMission();
  }

  setFollow(enabled: boolean): void {
    this.followPlayer = enabled;
    if (enabled) this.map.panTo(this.playerMarker.getLatLng(), { animate: true, duration: 0.3 });
  }

  isFollowing(): boolean {
    return this.followPlayer;
  }

  fitMission(): void {
    const points: L.LatLng[] = [this.playerMarker.getLatLng()];
    if (this.pickupMarker) points.push(this.pickupMarker.getLatLng());
    if (this.destinationMarker) points.push(this.destinationMarker.getLatLng());
    if (this.routeLine) points.push(...this.routeLine.getLatLngs() as L.LatLng[]);

    if (points.length > 1) {
      this.followPlayer = false;
      this.map.fitBounds(L.latLngBounds(points), {
        paddingTopLeft: [28, 60],
        paddingBottomRight: [28, 110],
        maxZoom: 16,
        animate: true
      });
    }
  }

  invalidate(): void {
    this.map.invalidateSize();
  }

  destroy(): void {
    this.map.remove();
  }
}
