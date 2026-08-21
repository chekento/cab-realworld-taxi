# CAB v2 — Android Device Test Log

## 2026-08-21 — First physical Android test

### Result
The first debug APK launched successfully on a physical Android device, but foreground geolocation failed immediately with `GPS ERROR` before Taxi HQ initialization.

### Root cause
The Android platform is generated fresh inside GitHub Actions. The initial APK build did not inject the Android permissions required by the Capacitor Geolocation plugin into the generated `android/app/src/main/AndroidManifest.xml`.

Required foreground permissions:
- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.ACCESS_FINE_LOCATION`

### Fix
- added `scripts/patch-android-manifest.mjs` to inject and verify both permissions after `npx cap add android`;
- Android workflow now fails if the permissions are not present;
- improved runtime permission handling to accept precise or approximate Android location;
- increased cold-fix timeout and added a lower-accuracy fallback;
- improved diagnostics for denied permission, disabled Location services and timeout cases.

### Verification
On the corrected build pipeline:
- TypeScript/Vite build: success;
- native Android project generation: success;
- manifest location-permission patch: success;
- explicit manifest permission grep: success;
- Gradle `assembleDebug`: success;
- APK artifact upload: success.

## 2026-08-21 — GPS-fix physical Android retest

### Result
The corrected APK successfully completed the real-world data bootstrap on a physical Android device.

Observed on device:
- foreground GPS: **live**;
- GPS accuracy: approximately **±21 m** during the captured test;
- OpenStreetMap POI query: **200 real POIs** returned;
- road routing: **live**;
- current weather: **live**;
- procedural mission generation: **ready to drive**;
- example route: real OSM pickup to real OSM drop-off with a **3.2 km / 5 min** baseline route;
- live traffic: correctly reported **proxy not configured**, with no invented delay data.

### Conclusion
The real-world acquisition chain now works on physical Android hardware:

`Android GPS → real HQ → OSM POIs → procedural passenger/mission → OSRM road route → current weather`

The remaining visible gap in this test build is the absence of an interactive driving map. The next alpha adds a live map with player position, pickup/drop-off markers, route geometry, follow mode and opt-in continuous foreground GPS tracking.
