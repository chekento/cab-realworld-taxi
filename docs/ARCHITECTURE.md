# CAB v2 — Target Architecture

## 1. Architecture goal

CAB v2 should evolve from the current WebSim-style prototype into a modular Android-capable game without throwing away useful web mapping/game logic unnecessarily.

Recommended direction:
- TypeScript application core,
- modular web UI/game layer,
- Capacitor-based Android shell,
- native plugins only where Android capabilities require them,
- provider adapters for maps, routing, traffic, weather and storage,
- local-first savegame.

The architecture must make it possible to replace providers and UI components without rewriting core game rules.

## 2. Proposed source structure

```text
src/
  app/
  game/
    economy/
    driving/
    scoring/
  world/
    location/
    map/
    poi/
    routing/
    traffic/
    weather/
    context/
  passengers/
    dna/
    generation/
    dialogue/
    memory/
  missions/
    generation/
    templates/
    events/
    objectives/
  progression/
    xp/
    ranks/
    licenses/
    achievements/
    mastery/
    challenges/
  vehicles/
  storage/
  ui/
    screens/
    hud/
    components/
  platform/
    android/
    web/
  config/
```

## 3. Core boundaries

### Game Core
Owns deterministic game rules and should be testable without Android or live network access.

Includes:
- fare calculation,
- passenger satisfaction,
- XP and ranks,
- achievement checks,
- mission state,
- economy,
- vehicle state,
- city mastery.

### World Layer
Normalizes external reality into internal CAB models.

Includes:
- GPS/location,
- map/POI,
- routing,
- weather,
- traffic,
- local time.

### Passenger Layer
Generates fictional people grounded in real trip context.

### Mission Layer
Combines `WorldContext`, passenger rules and progression state into playable missions.

### Presentation Layer
Owns mobile UX only. It must not contain core fare/progression/business logic.

## 4. Deterministic generation

Procedural passengers, achievements and mission selection should support seeds where practical.

Benefits:
- reproducible bugs,
- stable recurring customers,
- deterministic tests,
- daily challenge generation,
- easier balancing.

A seed can be derived from controlled game inputs but must not expose sensitive exact location history unnecessarily.

## 5. State model

Important persisted domains:
- player profile,
- career level/XP,
- rank/license progress,
- achievements,
- city mastery,
- vehicles/garage,
- finances,
- recurring passenger memory,
- mission history summary,
- settings/privacy choices.

Temporary high-frequency GPS traces should not automatically become permanent save data.

## 6. Savegame strategy

Foundation target:
- local-first persistent storage,
- explicit schema version,
- migrations between versions,
- export/import support later,
- optional cloud sync only after local save is stable.

A corrupt save must not brick the app; keep recoverable snapshots where practical.

## 7. Android shell

Android responsibilities include:
- foreground location permission,
- geolocation access,
- network state,
- haptics if used,
- secure storage for appropriate app secrets/tokens,
- lifecycle handling,
- back navigation,
- status/navigation bar integration,
- release signing/build.

CAB should avoid requesting permissions unrelated to a visible feature.

## 8. Network services

All provider calls go through interfaces/adapters.

Example:

```ts
interface WeatherProvider {
  getCurrent(point: GeoPoint): Promise<WeatherSnapshot>;
}

interface TrafficProvider {
  getTraffic(area: GeoBounds): Promise<TrafficSnapshot>;
}
```

The rest of the game receives normalized domain models, never raw provider responses.

## 9. Mission state machine

A mission should use explicit states instead of UI-driven implicit state.

Example:

```text
OFFERED
  -> ACCEPTED
  -> EN_ROUTE_TO_PICKUP
  -> WAITING_FOR_PICKUP
  -> PASSENGER_ONBOARD
  -> EN_ROUTE_TO_DROPOFF
  -> COMPLETED

Any active state may also transition to CANCELLED/FAILED under defined rules.
```

Dynamic events attach to allowed states rather than directly manipulating unrelated UI.

## 10. Passenger model

Passenger profile data should separate:
- immutable/generated identity,
- current trip state,
- player relationship memory.

This supports recurring customers without mixing permanent personality with temporary mood.

## 11. Achievement engine

Achievements are data-driven definitions rather than hundreds of hard-coded `if` statements.

Conceptual form:

```ts
interface AchievementDefinition {
  id: string;
  title: string;
  rarity: AchievementRarity;
  hidden?: boolean;
  conditions: AchievementCondition[];
}
```

Event-driven progress signals can include:
- ride completed,
- route deviation,
- tip received,
- weather condition,
- city visited,
- mastery changed,
- passenger mood changed,
- vehicle state changed.

## 12. Rank/license engine

Ranks and licenses must also be data-driven.

A rank can require combinations of:
- XP,
- completed rides,
- rating,
- city mastery,
- specific achievement IDs,
- mission family counts,
- clean/safe streaks.

This lets balancing change without UI rewrites.

## 13. UI state

Recommended top-level screens:
- splash/onboarding,
- main menu,
- career dashboard,
- shift setup,
- live map/HUD,
- mission offer,
- passenger interaction,
- ride result,
- garage,
- ranks/licenses,
- achievements,
- city mastery/world map,
- journal/statistics,
- settings/privacy/attribution.

Mobile UI must respect thumb reach, safe areas, portrait-first layout and large touch targets.

## 14. Testing strategy

### Unit tests
- fare calculations,
- XP/rank thresholds,
- passenger generation invariants,
- mission eligibility,
- achievement conditions,
- weather/traffic modifiers.

### Deterministic simulation tests
Generate thousands of missions/passengers by seed to catch impossible combinations.

### Provider contract tests
Recorded fixtures validate normalization without hammering live APIs.

### Android device tests
- permission flows,
- GPS acquisition,
- lifecycle/resume,
- offline/degraded network,
- low-memory/background return,
- map rendering,
- release build.

## 15. Security rules

- no secrets committed to Git,
- no unrestricted paid provider keys in web assets,
- validate external data before it reaches game logic,
- sanitize any provider/user text displayed as HTML,
- use HTTPS providers,
- keep dependency surface reasonably small,
- document third-party licenses.

## 16. Migration from prototype

The prototype is a reference, not the future architecture.

Migration principle:
1. preserve visible gameplay behaviour worth keeping,
2. extract reusable logic,
3. replace global mutable state with domain modules,
4. introduce provider interfaces,
5. rebuild mobile UX,
6. add Android wrapper,
7. only then remove obsolete prototype code.

Do not keep expanding a monolithic prototype `script.js` as the v2 implementation strategy.

## 17. First technical vertical slice

The first CAB v2 Android-capable slice should prove exactly this path:

```text
Launch app
-> grant/use foreground GPS
-> load real nearby map/POIs
-> obtain real weather
-> obtain traffic if provider configured
-> generate one procedural passenger
-> generate one mission between real locations
-> calculate route
-> complete ride state machine
-> show result
-> persist XP/money/mastery
-> relaunch and restore save
```

Everything else grows from this verified slice.