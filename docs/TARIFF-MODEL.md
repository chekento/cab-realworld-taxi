# CAB v2 — Taxi Tariff & Detour Model

## Principle

CAB should feel economically realistic without pretending that one fare formula is valid everywhere.

Taxi tariffs can vary by jurisdiction and can change over time. CAB therefore uses data-driven tariff profiles. A profile is only eligible for a "real tariff" mode when its source and verification date are known.

## Tariff profile

The current engine supports:
- base fare,
- stepped distance rates,
- waiting-time rate,
- explicit surcharges,
- currency,
- jurisdiction label,
- source metadata and verification date.

No hard-coded universal Germany/world tariff is used by the engine.

## Actual meter vs. pre-trip estimate

The mission offer may eventually show a non-binding estimate based on the planned route. The actual in-game meter should be driven by the distance/time actually travelled during the mission.

This distinction is important for:
- traffic delays,
- waiting at pickup,
- route changes,
- customer-requested scenic routes,
- intentional detours,
- road closures and diversions.

## Detour gameplay

CAB compares the expected route with the route actually selected/travelled.

The current detour model considers:
- extra distance,
- extra baseline time,
- passenger route tolerance,
- passenger local knowledge,
- passenger punctuality priority.

It outputs a game risk level:
- `normal`
- `noticeable`
- `suspicious`
- `complaint-risk`

The model is a gameplay abstraction, not a claim about real individual behaviour.

## Earning more from a detour

A longer route can result in more billable distance under a tariff profile. This must not become a free exploit.

Potential consequences include:
- reduced passenger mood,
- reduced tip,
- rating penalty,
- complaint event,
- reputation loss,
- achievement/secret achievement triggers,
- legitimate exception when the passenger explicitly requests the longer/scenic route,
- legitimate exception when live traffic/closure makes the deviation reasonable.

The fare engine and detour-risk engine remain separate so CAB can distinguish "the meter increased" from "the passenger considers the route acceptable".

## Future real tariff loading

A production tariff catalogue should record at least:
- jurisdiction/city/region,
- effective-from date,
- source URL/document,
- verification date,
- base fare,
- distance bands,
- waiting rules,
- common surcharges,
- any special rules the generic engine cannot represent.

Profiles with uncertain or stale data should fall back to a clearly labeled CAB game-economy profile rather than being presented as a current real tariff.
