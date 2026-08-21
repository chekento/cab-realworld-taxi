import type { MissionSeed, WorldContext } from './core/contracts';
import { getPlayerPosition } from './services/location';

function createMissionSeed(context: WorldContext): MissionSeed {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    origin: context.position,
    status: 'awaiting-live-pois'
  };
}

function formatCoordinate(value: number): string {
  return value.toFixed(5);
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
        <p id="hq-copy" class="muted">CAB uses foreground location only after you choose to initialize your real-world HQ.</p>
        <button id="locate" class="primary" type="button">Use my real location</button>
      </section>

      <section class="status-grid" aria-label="Real-world data status">
        <article><span>MAP / POIs</span><strong id="poi-status">Pending</strong></article>
        <article><span>LIVE WEATHER</span><strong id="weather-status">Pending</strong></article>
        <article><span>LIVE TRAFFIC</span><strong id="traffic-status">Pending</strong></article>
        <article><span>MISSION ENGINE</span><strong id="mission-status">Waiting for GPS</strong></article>
      </section>

      <section class="panel compact">
        <span class="label">VERTICAL SLICE</span>
        <p id="technical-status">Core loaded. No fictional locations will be generated; missions unlock only after real POIs are available.</p>
      </section>
    </main>
  `;

  const locateButton = root.querySelector<HTMLButtonElement>('#locate');
  const hqTitle = root.querySelector<HTMLElement>('#hq-title');
  const hqCopy = root.querySelector<HTMLElement>('#hq-copy');
  const gpsBadge = root.querySelector<HTMLElement>('#gps-badge');
  const missionStatus = root.querySelector<HTMLElement>('#mission-status');
  const technicalStatus = root.querySelector<HTMLElement>('#technical-status');

  if (!locateButton || !hqTitle || !hqCopy || !gpsBadge || !missionStatus || !technicalStatus) {
    throw new Error('CAB UI failed to initialize.');
  }

  locateButton.addEventListener('click', async () => {
    locateButton.disabled = true;
    locateButton.textContent = 'Locating…';
    technicalStatus.textContent = 'Requesting foreground GPS permission and current position…';

    try {
      const position = await getPlayerPosition();
      const context: WorldContext = {
        position,
        localTimeIso: new Date().toISOString(),
        weatherStatus: 'pending',
        trafficStatus: 'pending',
        poiStatus: 'pending'
      };
      const mission = createMissionSeed(context);

      hqTitle.textContent = `HQ ${formatCoordinate(position.latitude)}, ${formatCoordinate(position.longitude)}`;
      hqCopy.textContent = `Accuracy ±${Math.round(position.accuracyMeters)} m. This coordinate becomes the current CAB HQ for the real-world session.`;
      gpsBadge.textContent = 'GPS LIVE';
      gpsBadge.classList.add('live');
      missionStatus.textContent = 'Awaiting real OSM POIs';
      technicalStatus.textContent = `Mission seed ${mission.id.slice(0, 8)} created. Next: resolve real nearby pickup/drop-off POIs, weather and traffic.`;
      locateButton.textContent = 'Refresh location';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown location error.';
      gpsBadge.textContent = 'GPS ERROR';
      missionStatus.textContent = 'Blocked';
      technicalStatus.textContent = message;
      locateButton.textContent = 'Try location again';
    } finally {
      locateButton.disabled = false;
    }
  });
}
