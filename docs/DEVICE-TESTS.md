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

Next physical-device test: install the GPS-fix APK and verify Android permission prompt → Taxi HQ coordinates → OSM POIs → routing → weather.
