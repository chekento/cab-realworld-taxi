# CAB v2 — Development Roadmap

## Current verified foundation

The `feat/cab-v2-foundation` branch currently proves the following real-world chain:

```text
foreground GPS
-> real Taxi HQ
-> real named OpenStreetMap POIs
-> procedural passenger
-> real pickup/drop-off mission
-> real road routing + alternatives
-> live current weather
-> optional live traffic through a secure HTTPS proxy
-> jurisdiction-aware taximeter engine
-> passenger-aware detour risk engine
```

The web core is continuously type-checked and built with GitHub Actions.

## Phase 1 — Foundation and baseline

- preserve WebSim v1 reference
- document product/gameplay direction
- establish TypeScript/Vite/Capacitor architecture
- establish provider boundaries
- keep secrets out of client assets

Status: substantially complete on the foundation branch.

## Phase 2 — Real-world vertical slice

- foreground GPS Taxi HQ
- OSM POI discovery
- real mission endpoints
- procedural passenger generation
- real road routing
- route alternatives
- live current weather
- live traffic proxy contract
- degraded-network behaviour

Status: client-side slice implemented. Live traffic requires a configured CAB HTTPS proxy with a licensed upstream provider.

## Phase 3 — Taxi gameplay core

- verified local tariff catalogue
- taximeter driven by actual travelled distance/time
- route-choice screen
- intentional-detour mechanics
- passenger suspicion/complaint/reward consequences
- passenger-requested scenic routes
- traffic/closure justification for legitimate diversions
- ride state machine
- pickup/wait/onboard/drop-off flow
- satisfaction/tip/rating calculation
- first mission result screen

## Phase 4 — Career progression

- XP and levels
- 60+ career ranks/licenses
- 300–500 data-driven achievements
- city mastery
- home territory -> regional -> national -> metropolitan -> global progression
- optional metropolis contracts at higher levels
- World License / free location choice at maximum level
- daily/weekly challenges
- recurring passengers and mini story arcs

## Phase 5 — Economy and fleet

- verified tariff profiles by jurisdiction
- vehicle ownership
- fuel/energy
- wear/maintenance
- cleaning/interior condition
- upgrades
- garage
- insurance/service costs as game systems
- multiple taxi classes

## Phase 6 — World depth

- real-time weather gameplay modifiers
- live traffic flow/incidents/closures
- time/day/week effects
- real POI category mission logic
- major event hooks where reliable real data is available
- airport/station/hospital/nightlife/business mission families
- local-knowledge/no-navigation challenges

## Phase 7 — Android internal alpha

- generate native Capacitor Android project
- required foreground location declarations
- privacy/permission UX
- Android build CI
- unsigned/debug internal APK artifact
- device test on real Android hardware
- lifecycle/resume tests
- GPS/network degraded-mode tests

## Phase 8 — Production hardening

- replace public demo routing infrastructure
- deploy licensed live-traffic proxy
- deploy commercial/licensed weather path as required
- verify OSM tile/POI production infrastructure and attribution
- API abuse/rate-limit protection
- crash handling/logging policy
- savegame schema/migrations
- accessibility/localization
- performance/battery/network optimization

## Phase 9 — Play Store release

- package/app metadata
- icon/splash/store assets
- privacy policy
- Data Safety declarations
- permission review
- third-party licenses/attributions
- release signing
- signed release APK for final device verification
- Android App Bundle (AAB)
- internal/closed testing
- Play Console submission

## Immediate next checkpoint

Create a reproducible GitHub Actions Android build that generates the native Capacitor project from the verified web core and publishes a debug APK artifact. This keeps the first APK reproducible without prematurely committing a large generated Android tree.
