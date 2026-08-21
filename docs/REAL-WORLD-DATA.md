# CAB v2 — Real-World Data Specification

This document defines how CAB uses real-world data. It is intentionally provider-abstract so production services can be changed without rewriting game logic.

## 1. Grounding rule

CAB must treat the real world as authoritative for physical geography.

Where data is available, these must be real:
- roads,
- street names,
- intersections,
- districts,
- cities,
- train/bus stations,
- airports,
- hospitals,
- hotels,
- restaurants,
- nightlife venues,
- businesses,
- landmarks,
- other mission-relevant POIs.

Fiction is allowed for passengers, dialogue, fictional personal circumstances and procedural game events.

## 2. Location

### Primary mode
- Android foreground location provides latitude/longitude for the current taxi position and initial Taxi HQ.
- Location permission is requested only when needed.
- Background location is not a CAB v2 foundation requirement.
- The basic game should not require uploading exact home coordinates to a CAB account/server.

### Fallback mode
If location permission is unavailable, the player can manually choose a real place on the map.

### Privacy
- Keep precise coordinates local wherever possible.
- Store only what is necessary for savegame/mastery.
- Any future cloud sync must clearly separate account metadata from precise movement history.

## 3. Map and POI layer

OpenStreetMap-compatible data is the canonical foundation for roads and POIs.

The implementation must use a `MapProvider` / `PoiProvider` abstraction rather than directly coupling mission logic to one public endpoint.

Required capabilities:
- render map tiles/vector map,
- query nearby POIs by categories,
- resolve OSM-style tags into CAB semantic categories,
- preserve source IDs where useful,
- cache data within provider/license rules,
- display legally required attribution.

### POI semantic mapping

Raw map tags are normalized into game categories such as:
- airport,
- railway_station,
- bus_station,
- hospital,
- hotel,
- restaurant,
- bar_club,
- office_business,
- shopping,
- school_university,
- stadium_event,
- attraction,
- park,
- residential,
- industrial,
- charging_fuel,
- vehicle_service.

Mission code consumes CAB categories, not provider-specific raw tags.

## 4. Routing

The routing layer must be replaceable via `RoutingProvider`.

Required output:
- route geometry,
- distance,
- estimated duration,
- alternative routes where available,
- road classes / speed context where available,
- reroute support.

The current prototype may use public/demo routing services, but the production app must not depend on an unaudited public demo endpoint as if it had a production SLA.

### Route-choice gameplay

When alternatives exist, CAB can expose choices such as:
- fastest,
- shortest,
- comfort-oriented,
- avoid motorway,
- scenic/approved detour,
- player-defined route.

The game records actual driven distance/time separately from the expected route so passenger reaction and fare logic can evaluate detours.

## 5. Live traffic

Traffic must be supplied through a `TrafficProvider` interface.

Potential production providers can include commercial real-time traffic platforms. Provider choice is a deployment/licensing decision and must not leak into gameplay code.

Desired traffic data:
- current traffic speed,
- free-flow/reference speed,
- congestion level,
- delay estimate,
- road closures,
- incidents,
- affected road segments,
- provider timestamp/freshness.

### Truthfulness rule

CAB must label traffic state correctly:
- **LIVE** — fresh provider data,
- **CACHED** — previous valid provider data with timestamp,
- **ESTIMATED** — CAB-derived fallback,
- **UNAVAILABLE** — no usable traffic state.

Never display generated traffic as live traffic.

### Gameplay effects

Traffic can affect:
- ETA,
- mission urgency,
- route choice,
- passenger patience,
- surge/demand systems,
- achievement/challenge criteria,
- dynamic rerouting.

## 6. Real weather

Weather must be supplied through a `WeatherProvider` interface using the taxi/city coordinates.

Desired data:
- temperature,
- precipitation/type/intensity,
- wind,
- visibility where available,
- cloud/condition code,
- sunrise/sunset,
- observation/model timestamp.

### Weather truthfulness rule

CAB distinguishes:
- live/current provider condition,
- forecast/model condition,
- cached condition,
- simulated fallback.

The UI must not claim a simulated fallback is real current weather.

### Gameplay effects

Examples:
- rain increases taxi demand and can reduce road speed,
- heavy rain affects visibility/comfort,
- snow/ice raises difficulty and route risk,
- heat increases climate-control relevance,
- storms can trigger transport disruption-style mission modifiers,
- night + weather combinations affect challenge generation.

## 7. Time and calendar context

CAB uses the relevant local timezone for the active real-world location.

Context includes:
- local time,
- weekday/weekend,
- daylight/night,
- optional public-holiday/event adapters later.

Time affects passenger types, demand, nightlife/business missions, rush-hour weighting and difficulty.

## 8. Real-world events

CAB v2 foundation does not require a full live-event feed, but the architecture should allow optional `EventProvider` adapters later for:
- major concerts,
- sports events,
- transport disruption,
- public events.

Provider-derived events must include source/freshness metadata. Procedural events must remain distinguishable from externally sourced real events.

## 9. Data orchestration

A `WorldContextService` combines normalized data into a snapshot for game systems.

Example conceptual output:

```ts
interface WorldContext {
  location: GeoPoint;
  localTime: string;
  nearbyPois: CabPoi[];
  weather: WeatherSnapshot;
  traffic: TrafficSnapshot;
  connectivity: 'online' | 'degraded' | 'offline';
  generatedAt: string;
}
```

Mission generation reads `WorldContext`; it does not independently call provider APIs.

## 10. Caching and rate limits

Every external provider must define:
- cache TTL,
- request limits,
- retry/backoff policy,
- attribution requirements,
- commercial-use rights,
- failure mode.

CAB should favor sensible spatial/temporal caching to avoid wasteful repeated requests while obeying provider licenses.

## 11. API key policy

- No production provider secret is committed to GitHub.
- No secret is embedded plainly in client JavaScript if it grants unrestricted paid API access.
- Public/restricted mobile keys must use provider restrictions where supported.
- Sensitive commercial provider calls can be proxied through a minimal backend if necessary.
- The player must not be forced to provide their own API key for normal gameplay.

## 12. Provider failure behaviour

Provider failures must degrade gracefully.

Examples:
- map available + traffic unavailable → missions still work, traffic marked unavailable,
- weather unavailable → no real-weather bonuses/penalties that claim live grounding,
- routing unavailable → do not generate a mission that cannot be navigated/validated,
- POI query unavailable → use cached real POIs if valid; otherwise restrict mission generation.

No fabricated 'live' values are used to hide outages.

## 13. Global city travel

When a licensed player chooses another real metropolis:
1. resolve the real city/location,
2. load real map/POI context,
3. load local timezone,
4. load weather,
5. load traffic when the chosen provider covers the area,
6. establish a temporary Taxi HQ/start point at an appropriate real map location,
7. generate missions only from validated real POIs/routes.

At maximum level the same pipeline supports free worldwide location selection.

## 14. Production-readiness gate

Before Play Store release, each provider must pass a recorded review for:
- commercial-use permission,
- quotas/costs,
- SLA/availability expectations,
- attribution,
- privacy impact,
- geographic coverage,
- offline/degraded behaviour,
- key/security strategy.

Public community/demo endpoints are acceptable for development only when their policies allow it; they are not assumed to be production infrastructure.