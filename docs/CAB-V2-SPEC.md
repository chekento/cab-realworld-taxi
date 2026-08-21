# CAB — The Real World Taxi
## CAB v2 Product & Gameplay Specification

Status: Foundation specification for `feat/cab-v2-foundation`.

## 1. Product identity

**CAB — The Real World Taxi** is a location-based taxi career game played on the real world.

Core promise:

> **Real World. Real Roads. Real Places. Real Weather. Real Traffic. Procedural People.**

The game must not invent streets, districts, businesses, stations, airports, hospitals, hotels or other physical destinations when real-world data is available. The world layer is grounded in actual map/location data. Fiction belongs primarily to passengers, dialogue, personal stories, challenges and emergent events.

## 2. Design pillars

1. **Reality as the game board** — the player's surroundings are the map.
2. **Taxi work as meaningful decisions** — route, speed, comfort, conversation, risk, timing and economics matter.
3. **Procedural people with character** — passengers feel individual instead of being interchangeable mission markers.
4. **Local knowledge as progression** — playing CAB should improve knowledge of real streets and places.
5. **Career depth** — long-term ranks, licenses, city mastery, vehicles, economy and achievements.
6. **Humour through believable situations** — funny passengers and incidents, not a cartoon world detached from reality.
7. **Global endgame** — the player begins locally and eventually earns the right to operate anywhere in the world.

## 3. Starting location and Taxi HQ

- On first launch the player may grant foreground location access.
- With permission, the player's real GPS location becomes the initial **Taxi HQ** and career start area.
- Exact GPS coordinates should be handled locally where possible and must not be uploaded merely to run the basic game.
- If GPS permission is denied, CAB offers a manual map/location choice.
- Taxi HQ can later gain gameplay functions such as garage, shift start, vehicle selection, statistics and local contracts.

## 4. Core gameplay loop

1. Start a shift at Taxi HQ or current licensed city.
2. Load real nearby streets, POIs, weather and traffic state.
3. Generate believable passenger offers from real pickup/drop-off context.
4. Compare offers by distance, fare, difficulty, urgency, passenger traits and likely risk/reward.
5. Drive to the real pickup location.
6. Pick up a procedurally generated passenger.
7. Choose route and driving strategy.
8. React to passenger dialogue, requests, traffic, weather and incidents.
9. Drop off at the real destination.
10. Receive fare, tip, rating, XP, mastery and achievement progress.
11. Maintain/refuel/recharge/clean/repair the vehicle and continue the shift.
12. End shift and review performance, finances and local-knowledge gains.

The loop must create decisions, not merely animate an A-to-B route.

## 5. Fare, detours and route choice

CAB should allow route freedom, including deliberate detours.

Fare logic can combine configurable real-world-inspired components such as:
- base fare,
- driven distance,
- elapsed time,
- waiting time,
- legitimate surcharges,
- dynamic demand bonuses where suitable for the game economy.

A longer route may therefore earn more money, but passengers have expectations.

Each passenger can have:
- expected route distance,
- expected journey time,
- route tolerance,
- local-knowledge level,
- price sensitivity,
- urgency,
- suspicion threshold,
- scenic-route preference.

Consequences for unjustified detours may include questioning the driver, reduced mood, reduced tip, rating loss, complaint events or reputation impact. A requested scenic route or customer-approved detour is legitimate and can reward the player.

The system must prevent the optimal strategy from becoming 'drive in circles forever'.

## 6. Procedural Passenger DNA

Passengers are generated locally by deterministic/procedural rules by default; an LLM must not be required for the basic game.

A passenger profile may include:
- seed / stable ID,
- name,
- age band,
- occupation,
- personality archetype,
- patience,
- humour style,
- talkativeness,
- current mood,
- reason for trip,
- urgency,
- local knowledge,
- budget sensitivity,
- tipping tendency,
- comfort preference,
- preferred driving style,
- music preference,
- temperature preference,
- luggage type/size,
- accessibility needs,
- group size,
- pets,
- conversation interests,
- taboo topics,
- hidden quirk,
- event probabilities,
- memory/reputation relation to the player.

Traits must affect gameplay. They must not exist only as flavour text.

### Recurring customers

Some passengers can become recurring customers. A stable passenger seed allows them to remember earlier rides, change over time and unlock multi-ride story arcs.

## 7. Mission Engine

Missions are generated from real locations plus passenger/context rules.

Mission families include:
- standard city fare,
- airport transfer,
- train/bus connection,
- hotel/business transfer,
- hospital/medical visit,
- nightlife,
- family/group,
- tourist/sightseeing,
- accessibility-focused fare,
- pet transport,
- event/concert/stadium,
- wedding,
- VIP/executive,
- long-distance,
- courier/light-delivery where legally/gameplay appropriate,
- bad-weather challenge,
- rush-hour challenge,
- night-shift challenge,
- story mission,
- career examination,
- mystery/comedy event,
- daily/weekly challenge.

Mission generation considers:
- real POI category,
- real local time/day,
- real weather,
- available traffic state,
- route distance/time,
- player rank,
- vehicle type,
- passenger traits,
- local mastery,
- previous missions,
- event cooldowns.

## 8. Dynamic events

Events should combine realism with humour. Examples:
- forgotten phone or wallet,
- oversized luggage,
- passenger falls asleep,
- nervous airport passenger,
- musician with fragile equipment,
- wedding cake requiring smooth driving,
- dog that dislikes sharp turns,
- customer asks for a scenic route,
- customer insists they know a shortcut,
- road closure forces reroute,
- severe rain suddenly slows traffic,
- returning customer recognizes the driver.

Events must be bounded and testable. They may alter objectives, dialogue, rating conditions or route constraints.

## 9. Driving and customer satisfaction

Ride scoring can consider:
- punctuality,
- smoothness,
- speeding/traffic-rule behaviour where detectable,
- route quality,
- passenger-specific preferences,
- conversation choices,
- vehicle condition,
- cleanliness,
- cabin temperature,
- successful handling of special requests,
- safe/appropriate drop-off.

Passenger mood is dynamic and should explain why it changes.

## 10. Local Knowledge / City Mastery

CAB tracks player familiarity with real areas.

Possible signals:
- roads driven,
- districts visited,
- POIs discovered,
- repeated routes,
- navigation reliance,
- successful no-navigation challenges,
- airports/stations/hospitals mastered,
- time-of-day coverage.

City mastery is separate from global career level.

Example:
- Hamburg: 82%
- Berlin: 24%
- London: 6%

### No-GPS / Knowledge challenges

At suitable ranks the player can accept navigation-restricted missions for bonus XP/mastery. The destination remains a real place; the challenge is knowing or learning the route.

## 11. Career progression and world access

The game begins in the real local area and expands gradually.

Suggested progression bands:

- **Levels 1–10 — Home Territory:** GPS home region and basic local work.
- **Levels 11–20 — Regional License:** surrounding towns/cities and regional contracts.
- **Levels 21–30 — National Contracts:** major cities within the player's country.
- **Levels 31–40 — Metropolitan Driver:** optional transfers to selected international metropolises.
- **Levels 41–49 — Global Elite:** advanced international contracts, VIP/events and difficult conditions.
- **Maximum level — World License:** free location choice worldwide.

Metropolitan transfers are **optional**, never forced. The player can continue their local career indefinitely.

At maximum level CAB unlocks:
- worldwide map/location selection,
- temporary Taxi HQ anywhere supported,
- global City Mastery,
- Random City challenge.

## 12. Ranks and licenses

Target: **60+ career ranks/licenses** across multiple tiers rather than only three generic levels.

Ranks should combine XP with achievements/requirements such as:
- completed rides,
- minimum rating,
- perfect drop-offs,
- city mastery,
- clean/safe streaks,
- airport/station experience,
- night-shift experience,
- special mission completions.

Example rank families:
- Rookie Driver,
- Local Driver,
- Reliable Driver,
- City Specialist,
- Night Driver,
- Airport Specialist,
- Five-Star Driver,
- Professional Driver,
- Executive Driver,
- VIP Chauffeur,
- Metropolitan Driver,
- International Driver,
- Global Elite,
- World License.

Detailed rank tables are a separate balancing dataset, not hard-coded UI text.

## 13. Achievements

Target: **300–500 achievements** with categories and rarities.

Rarities:
- Common,
- Uncommon,
- Rare,
- Epic,
- Legendary,
- Secret.

Achievement categories:
- distance,
- rides,
- earnings,
- rating,
- tips,
- smooth driving,
- difficult customers,
- weather,
- traffic,
- night shifts,
- airports/stations,
- local mastery,
- cities/countries,
- vehicles,
- maintenance,
- dialogue,
- recurring passengers,
- story arcs,
- comedy/secret conditions,
- near-empty fuel/energy,
- special route choices.

Achievements should reward unusual play as well as raw grinding.

## 14. Economy and vehicles

Long-term systems may include:
- fuel/energy,
- repairs,
- cleaning,
- tyres/wear,
- insurance abstraction,
- upgrades,
- vehicle purchase,
- compact/hybrid/EV/van/luxury classes,
- passenger/mission suitability,
- garage expansion,
- optional later fleet/company management.

The economy must create choices without turning CAB into spreadsheet micromanagement.

## 15. Mobile UX / main menu

The prototype's floating desktop-like panels are not the target Android UI.

Target main navigation:
- Continue Career,
- New Career,
- Start Shift / Free Drive,
- Daily & Weekly Challenges,
- World / City Select,
- Garage,
- Driver Profile,
- Ranks & Licenses,
- Achievements,
- City Mastery,
- Cab Journal,
- Statistics,
- Settings,
- Privacy / Data / Attribution.

### In-ride HUD

Keep the driving screen focused:
- map/navigation,
- current speed / road context,
- trip meter/fare,
- ETA,
- compact passenger mood/status,
- current objective/event,
- essential vehicle state.

### Ride Result screen

Explain outcomes:
- fare,
- tip,
- XP,
- rating,
- punctuality,
- comfort,
- route choice,
- passenger mood,
- special bonuses/penalties,
- mastery progress,
- achievements.

## 16. Cab Journal

Memorable passengers, rare events, story arcs, city milestones and exceptional rides can be recorded in a local journal. This gives procedural gameplay a sense of personal history.

## 17. Daily / weekly challenges

Examples:
- five rides above 90% passenger satisfaction,
- complete a night shift,
- complete airport rides in rain,
- finish multiple rides without navigation,
- complete a shift without a complaint,
- discover new real POIs,
- drive in a newly unlocked metropolis.

Challenges must be generated from capabilities actually available in the player's current city/data state.

## 18. Realism and humour rule

**Reality defines the world; humour defines the people and situations.**

Humour must not falsify the map layer. A funny passenger can travel to a real railway station; CAB should not invent a fake railway station just to make a joke.

## 19. Offline/degraded behaviour

CAB should distinguish between:
- live data available,
- cached/recent data,
- simulated fallback.

The UI must not present simulated traffic/weather as live data. Core career/save functionality should remain usable when a live provider is temporarily unavailable.

## 20. Non-goals for v2 foundation

Not required for the first playable Android alpha:
- multiplayer,
- real-money economy,
- user-to-user passenger data,
- always-on background location,
- mandatory cloud account,
- mandatory LLM/API key,
- fully simulated physical traffic vehicles on every road.

The first alpha succeeds when a real GPS-based area can produce a real-location mission with a procedural passenger, a playable route, persistent result and modern mobile UX.