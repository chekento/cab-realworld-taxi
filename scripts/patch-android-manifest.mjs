import { readFile, writeFile } from 'node:fs/promises';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
const permissions = [
  '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
  '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />'
];

let manifest = await readFile(manifestPath, 'utf8');
const openingManifest = manifest.match(/<manifest\b[^>]*>/)?.[0];

if (!openingManifest) {
  throw new Error('Could not find opening <manifest> tag in AndroidManifest.xml');
}

const missing = permissions.filter((permission) => {
  const androidName = permission.match(/android:name="([^"]+)"/)?.[1];
  return androidName ? !manifest.includes(androidName) : true;
});

if (missing.length > 0) {
  manifest = manifest.replace(
    openingManifest,
    `${openingManifest}\n\n    ${missing.join('\n    ')}`
  );
  await writeFile(manifestPath, manifest, 'utf8');
}

const verified = await readFile(manifestPath, 'utf8');
for (const androidName of [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION'
]) {
  if (!verified.includes(androidName)) {
    throw new Error(`Required Android permission missing after patch: ${androidName}`);
  }
}

console.log('CAB Android manifest verified: coarse + fine foreground location permissions present.');
