import { readFile, writeFile } from 'node:fs/promises';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const finePermission = '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />';
const coarsePermission = '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />';

let manifest = await readFile(manifestPath, 'utf8');

if (!manifest.includes('android.permission.ACCESS_COARSE_LOCATION')) {
  manifest = manifest.replace('<manifest', `${coarsePermission}\n\n<manifest`);
}

if (!manifest.includes('android.permission.ACCESS_FINE_LOCATION')) {
  manifest = manifest.replace('<manifest', `${finePermission}\n\n<manifest`);
}

await writeFile(manifestPath, manifest, 'utf8');

const verified = await readFile(manifestPath, 'utf8');
for (const permission of ['android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION']) {
  if (!verified.includes(permission)) {
    throw new Error(`Required Android permission missing after patch: ${permission}`);
  }
}

console.log('CAB Android manifest patched: coarse + fine foreground location permissions present.');
