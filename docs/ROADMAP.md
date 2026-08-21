# CAB — The Real World Taxi
## Development Roadmap

This roadmap prioritizes a playable real-world Android vertical slice before breadth.

## Phase 0 — Preserve the prototype

Status: in progress on `feat/cab-v2-foundation`.

Goals:
- keep the original WebSim prototype as reference,
- record source checksums,
- avoid destructive edits to the baseline,
- document missing binary/source pieces when connector limitations prevent direct upload.

Exit criteria:
- baseline is traceable,
- v2 development is separated from prototype code.

## Phase 1 — Foundation specification

Goals:
- product/gameplay specification,
- real-world data rules,
- architecture boundaries,
- Android-first roadmap.

Exit criteria:
- no ambiguity about GPS HQ, real locations, traffic/weather truthfulness, procedural passengers, progression or global city unlocks.

## Phase 2 — Project scaffold

Goals:
- create modular TypeScript/Vite application,
- add Capacitor Android shell,
- establish lint/typecheck/test scripts,
- create environment/provider configuration pattern,
- create basic screen routing and design tokens.

Exit criteria:
- web build works,
- Android debug build opens,
- no provider secrets committed.

## Phase 3 — Real-World vertical slice

Goals:
- foreground GPS flow,
- real map centered on player,
- real nearby POI loading,
- route calculation,
- real weather provider adapter,
- traffic provider adapter or explicit unavailable state,
- `WorldContextService`.

Exit criteria:
- app can start from real GPS and display validated nearby real places,
- data freshness/state is visible and honest.

## Phase 4 — Procedural passenger engine

Goals:
- deterministic Passenger DNA generator,
- personality/needs/preferences,
- mood model,
- recurring passenger IDs,
- dialogue template system,
- humour/event traits.

Exit criteria:
- thousands of generated passengers pass invariant tests,
- traits visibly affect ride logic.

## Phase 5 — Mission engine

Goals:
- mission state machine,
- real pickup/drop-off selection,
- POI-context mission templates,
- fare estimates,
- urgency/difficulty,
- dynamic events,
- cancellation/failure rules.

Exit criteria:
- real GPS area can generate and complete a full mission between real locations.

## Phase 6 — Driving, route freedom and taxi economy

Goals:
- expected vs actual route,
- deliberate detours,
- passenger route tolerance,
- fare/time/distance model,
- waiting time,
- comfort/smoothness scoring,
- fuel/energy/wear foundation,
- anti-exploit rules.

Exit criteria:
- taking a detour can earn more but creates understandable passenger/economic consequences,
- circling cannot dominate optimal play.

## Phase 7 — Mobile UX overhaul

Goals:
- new main menu,
- career dashboard,
- shift setup,
- map-first driving HUD,
- passenger card,
- event/dialogue UI,
- ride result screen,
- settings/privacy/attribution.

Exit criteria:
- no dependency on draggable desktop-like prototype panels,
- portrait Android experience is usable one-handed where practical.

## Phase 8 — Progression systems

Goals:
- persistent XP,
- 60+ data-driven ranks/licenses,
- 300–500 data-driven achievements,
- City Mastery,
- daily/weekly challenges,
- Cab Journal,
- statistics.

Exit criteria:
- progression creates short-, medium- and long-term goals,
- achievement/rank logic is testable and not hard-coded into UI.

## Phase 9 — World career

Goals:
- Home Territory,
- Regional License,
- National Contracts,
- optional Metropolitan transfers,
- Global Elite contracts,
- maximum-level World License,
- free worldwide location choice,
- Random City challenge.

Exit criteria:
- global travel always resolves to real map/POI/weather/traffic context where supported,
- player can remain local by choice.

## Phase 10 — Vehicles and deeper management

Goals:
- multiple vehicle classes,
- garage,
- repairs/cleaning/upgrades,
- EV/fuel differences,
- mission suitability,
- optional fleet-management foundation.

Exit criteria:
- vehicles change strategy rather than only cosmetic appearance.

## Phase 11 — Alpha APK

Goal: produce the first useful on-device APK before feature completeness.

Required alpha slice:
- Android install/launch,
- permission onboarding,
- real GPS start,
- real map/POI mission,
- procedural passenger,
- route completion,
- fare/result,
- local save/restore,
- basic modern mobile UI.

The alpha is for device testing, not Play Store release.

## Phase 12 — Beta hardening

Goals:
- crash/error handling,
- offline/degraded provider modes,
- performance and battery review,
- map/network caching review,
- save migrations/recovery,
- accessibility pass,
- balance pass,
- localization-ready strings,
- analytics/telemetry decision with privacy review,
- dependency/license audit.

## Phase 13 — Play Store readiness

Checklist categories:
- package/application identity,
- target/current Android requirements,
- signing and release build,
- AAB generation,
- permissions minimized,
- privacy policy,
- Data Safety declaration inputs,
- location explanation/onboarding,
- OSM/provider attribution,
- commercial-use provider licenses,
- API-key security,
- content rating inputs,
- store listing/screenshots/icon,
- internal/closed testing,
- pre-launch report review,
- crash/ANR checks,
- release notes/versioning.

Exit criteria:
- signed release AAB passes the project's release checklist and can be submitted to Google Play.

## Working rule

From this point forward:

> **Small verified changes beat large opaque rewrites.**

Each major phase should end with a runnable or inspectable checkpoint before the next one begins.