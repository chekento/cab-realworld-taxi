import type { MissionSeed, RouteSnapshot, WorldContext } from './core/contracts';
import { createRealWorldMission } from './missions/generate';
import { getPlayerPosition } from './services/location';
import { loadNearbyPois } from './world/poi/overpass';
import { loadDrivingRoute } from './world/routing/osrm';

function formatCoordinate(value: number): string {
  return value.toFixed(5);
}

function formatDistance(meters: number): string {
  if (meters < 1_000) return `${Math.round(meters)} m`;
  return `${(meters / 1_000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours} h ${remainder} min`;
}

function clearMission(root: HTMLElement): void {
  const card = root.querySelector<HTMLElement>('#mission-card');
  if (card) card.hidden = true;
}

function renderMission(root: HTMLElement, mission: MissionSeed): void {
  const card = root.querySelector<HTMLElement>('#mission-card');
  const pickup = root.querySelector<HTMLElement>('#mission-pickup');
  const destination = root.querySelector<HTMLElement>('#mission-destination');
  const passenger = root.querySelector<HTMLElement>('#mission-passenger');
  const routeMetrics = root.querySelector<HTMLElement>('#route-metrics');

  if (!card || !pickup || !destination || !passenger) return;

  if (mission.status !== 'ready' || !mission.pickup || !mission.destination || !mission.passenger) {
    card.hidden = true;
    return;
  }

  pickup.textContent = mission.pickup.name;
  destination.textContent = mission.destination.name;
  passenger.textContent = `${mission.passenger.name}, ${mission.passenger.age} · ${mission.passenger.occupation} · ${mission.passenger.temperament}`;
  if (routeMetrics) routeMetrics.hidden = true;
  card.hidden = false;
}

function renderRoute(root: HTMLElement, snapshot: RouteSnapshot): void {
  const metrics = root.querySelector<HTMLElement>('#route-metrics');
  const distance = root.querySelector<HTMLElement>('#route-distance');
  const duration = root.querySelector<HTMLElement>('#route-duration');
  const alternatives = root.querySelector<HTMLElement>('#route-alternatives');
  const primary = snapshot.routes[0];

  if (!metrics || !distance || !duration || !alternatives || !primary) return;

  distance.textContent = formatDistance(primary.distanceMeters);
  duration.textContent = formatDuration(primary.durationSeconds);
  alternatives.textContent = String(Math.max(0, snapshot.routes.length - 1));
  metrics.hidden = false;
}

export function mountApp(root: HTMLElement): void {
  root.innerHTML = `
    <main class="shell">
      <section class="hero">
        <span class="eyebrow">CAB v2 FOUNDATION</span>
        <h1>CAB <small>— The Real World Taxi</small></h1>
        <p class="tagline">Real World. Real Roads. Real Places. Real Weather. Real Traffic. Procedural People.</p>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <span class="label">TAXI HQ</span>
            <h2 id="hq-title">Location not initialized</h2>
          </div>
          <span id="gps-badge" class="badge">GPS OFF</span>
        </div>
        <p id="hq-copy" class="muted">CAB uses foreground location only after you choose to initialize your real-world HQ. Nearby real POIs are then queried from OpenStreetMap data.</p>
        <button id="locate" class="primary" type="button">Use my real location</button>
      </section>

      <section class="status-grid" aria-label="Real-world data status">
        <article><span>MAP / POIs</span><strong id="poi-status">Pending</strong></article>
        <article><span>ROAD ROUTING</span><strong id="route-status">Pending</strong></article>
        <article><span>LIVE WEATHER</span><strong id="weather-status">Pending</strong></article>
        <article><span>LIVE TRAFFIC</span><strong id="traffic-status">Pending</strong></article>
        <article><span>MISSION ENGINE</span><strong id="mission-status">Waiting for GPS</strong></article>
      </section>

      <section id="mission-card" class="panel mission-card" hidden>
        <span class="label">FIRST REAL-WORLD MISSION</span>
        <div class="mission-route">
          <div>
            <span class="route-kicker">PICKUP · REAL OSM POI</span>
            <strong id="mission-pickup">—</strong>
          </div>
          <span class="route-arrow" aria-hidden="true">→</span>
          <div>
            <span class="route-kicker">DROP-OFF · REAL OSM POI</span>
            <strong id="mission-destination">—</strong>
          </div>
        </div>
        <p id="mission-passenger" class="passenger-line"></p>
        <div id="route-metrics" class="route-metrics" hidden>
          <div><span>ROAD DISTANCE</span><strong id="route-distance">—</strong></div>
          <div><span>BASE ETA</span><strong id="route-duration">—</strong></div>
          <div><span>ALTERNATIVES</span><strong id="route-alternatives">0</strong></div>
        </div>
        <p class="muted small">Distance and ETA are calculated on the real road network. ETA is still a baseline without live traffic; fare calculation comes later with tariff rules.</p>
      </section>

      <section class="panel compact">
        <span class="label">VERTICAL SLICE</span>
        <p id="technical-status">Core loaded. No fictional locations will be generated; missions unlock only after real POIs are available.</p>
      </section>

      <footer class="attribution">
        Place data: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a> · Routing development adapter: <a href="https://project-osrm.org/" target="_blank" rel="noreferrer">OSRM</a>
      </footer>
    </main>
  `;

  const locateButton = root.querySelector<HTMLButtonElement>('#locate');
  const hqTitle = root.querySelector<HTMLElement>('#hq-title');
  const hqCopy = root.querySelector<HTMLElement>('#hq-copy');
  const gpsBadge = root.querySelector<HTMLElement>('#gps-badge');
  const poiStatus = root.querySelector<HTMLElement>('#poi-status');
  const routeStatus = root.querySelector<HTMLElement>('#route-status');
  const missionStatus = root.querySelector<HTMLElement>('#mission-status');
  const technicalStatus = root.querySelector<HTMLElement>('#technical-status');

  if (!locateButton || !hqTitle || !hqCopy || !gpsBadge || !poiStatus || !routeStatus || !missionStatus || !technicalStatus) {
    throw new Error('CAB UI failed to initialize.');
  }

  locateButton.addEventListener('click', async () => {
    locateButton.disabled = true;
    locateButton.textContent = 'Locating…';
    technicalStatus.textContent = 'Requesting foreground GPS permission and current position…';
    clearMission(root);
    routeStatus.textContent = 'Pending';

    let context: WorldContext;

    try {
      const position = await getPlayerPosition();
      context = {
        position,
        localTimeIso: new Date().toISOString(),
        weatherStatus: 'pending',
        trafficStatus: 'pending',
        poiStatus: 'pending'
      };

      hqTitle.textContent = `HQ ${formatCoordinate(position.latitude)}, ${formatCoordinate(position.longitude)}`;
      hqCopy.textContent = `Accuracy ±${Math.round(position.accuracyMeters)} m. This coordinate is the current CAB HQ for the real-world session.`;
      gpsBadge.textContent = 'GPS LIVE';
      gpsBadge.classList.add('live');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown location error.';
      gpsBadge.textContent = 'GPS ERROR';
      gpsBadge.classList.remove('live');
      missionStatus.textContent = 'Blocked';
      technicalStatus.textContent = message;
      locateButton.textContent = 'Try location again';
      locateButton.disabled = false;
      return;
    }

    poiStatus.textContent = 'Loading real POIs…';
    missionStatus.textContent = 'Waiting for OSM';
    technicalStatus.textContent = 'GPS live. Querying named real-world places around the HQ from OpenStreetMap/Overpass…';

    try {
      const pois = await loadNearbyPois(context.position);
      context.poiStatus = pois.length >= 2 ? 'live' : 'degraded';
      poiStatus.textContent = pois.length >= 2 ? `${pois.length} real POIs` : `${pois.length} POIs · insufficient`;

      const mission = createRealWorldMission(context, pois);
      if (mission.status !== 'ready' || !mission.pickup || !mission.destination) {
        missionStatus.textContent = 'Need more real POIs';
        technicalStatus.textContent = 'GPS works, but the current OSM result does not contain enough distinct real locations for a mission.';
        return;
      }

      renderMission(root, mission);
      missionStatus.textContent = 'Locations ready';
      routeStatus.textContent = 'Calculating real roads…';
      technicalStatus.textContent = `Mission ${mission.id.slice(0, 8)} has real endpoints. Calculating the actual driving route now…`;

      try {
        const route = await loadDrivingRoute(mission.pickup.point, mission.destination.point);
        renderRoute(root, route);
        routeStatus.textContent = 'Road route live';
        missionStatus.textContent = 'Ready to drive';
        technicalStatus.textContent = `Real road route loaded with ${route.routes.length} option${route.routes.length === 1 ? '' : 's'}. Next: live weather and traffic modifiers.`;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown routing error.';
        routeStatus.textContent = 'Routing unavailable';
        missionStatus.textContent = 'Locations ready';
        technicalStatus.textContent = `Real POIs are valid, but the road route could not be loaded: ${message}`;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OSM POI error.';
      context.poiStatus = 'degraded';
      poiStatus.textContent = 'OSM unavailable';
      routeStatus.textContent = 'Blocked';
      missionStatus.textContent = 'Waiting for real POIs';
      technicalStatus.textContent = `GPS is live, but real POIs could not be loaded: ${message}`;
    } finally {
      locateButton.textContent = 'Refresh real-world HQ';
      locateButton.disabled = false;
    }
  });
}
