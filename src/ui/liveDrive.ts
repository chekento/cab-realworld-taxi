import type { GeoPoint, MissionSeed, RouteOption } from '../core/contracts';
import { startPlayerTracking } from '../services/tracking';
import { CabLiveMap } from '../world/map/liveMap';

export class LiveDriveController {
  private readonly panel: HTMLElement;
  private readonly map: CabLiveMap;
  private readonly followButton: HTMLButtonElement;
  private readonly routeButton: HTMLButtonElement;
  private readonly trackingButton: HTMLButtonElement;
  private readonly status: HTMLElement;
  private stopTracking?: () => Promise<void>;

  constructor(root: HTMLElement, initialPosition: GeoPoint) {
    const panel = root.querySelector<HTMLElement>('#drive-map-panel');
    const container = root.querySelector<HTMLElement>('#cab-map');
    const followButton = root.querySelector<HTMLButtonElement>('#map-follow');
    const routeButton = root.querySelector<HTMLButtonElement>('#map-route');
    const trackingButton = root.querySelector<HTMLButtonElement>('#map-live-drive');
    const status = root.querySelector<HTMLElement>('#map-tracking-status');

    if (!panel || !container || !followButton || !routeButton || !trackingButton || !status) {
      throw new Error('CAB live-map UI is incomplete.');
    }

    this.panel = panel;
    this.followButton = followButton;
    this.routeButton = routeButton;
    this.trackingButton = trackingButton;
    this.status = status;

    this.panel.hidden = false;
    this.map = new CabLiveMap(container, initialPosition, initialPosition.accuracyMeters);

    this.followButton.addEventListener('click', () => {
      this.map.setFollow(true);
      this.status.textContent = 'Following your live CAB position.';
    });

    this.routeButton.addEventListener('click', () => {
      this.map.fitMission();
      this.status.textContent = 'Showing player, pickup, drop-off and current route.';
    });

    this.trackingButton.addEventListener('click', () => {
      void this.toggleTracking();
    });
  }

  setPlayer(position: GeoPoint): void {
    this.map.setPlayer(position, position.accuracyMeters);
  }

  setMission(mission: MissionSeed): void {
    this.map.setMission(mission);
  }

  setRoute(route: RouteOption): void {
    this.map.setRoute(route);
  }

  invalidate(): void {
    this.map.invalidate();
  }

  private async toggleTracking(): Promise<void> {
    this.trackingButton.disabled = true;

    try {
      if (this.stopTracking) {
        await this.stopTracking();
        this.stopTracking = undefined;
        this.trackingButton.textContent = 'Start live drive';
        this.status.textContent = 'Live driving paused. Tap Start live drive to follow real movement.';
        return;
      }

      this.map.setFollow(true);
      this.status.textContent = 'Starting live GPS tracking…';
      this.stopTracking = await startPlayerTracking(
        (position) => {
          this.map.setPlayer(position, position.accuracyMeters);
          this.status.textContent = `LIVE · accuracy ±${Math.round(position.accuracyMeters)} m`;
        },
        (message) => {
          this.status.textContent = `Live GPS degraded: ${message}`;
        }
      );
      this.trackingButton.textContent = 'Stop live drive';
      this.status.textContent = 'LIVE DRIVE active. CAB now follows real GPS movement.';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start live drive.';
      this.status.textContent = message;
    } finally {
      this.trackingButton.disabled = false;
    }
  }
}
