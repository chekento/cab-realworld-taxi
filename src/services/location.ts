import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import type { GeoPoint } from '../core/contracts';

export async function getPlayerPosition(): Promise<GeoPoint> {
  if (Capacitor.isNativePlatform()) {
    const current = await Geolocation.checkPermissions();
    if (current.location !== 'granted') {
      const requested = await Geolocation.requestPermissions({ permissions: ['location'] });
      if (requested.location !== 'granted') {
        throw new Error('Location permission is required to use the real-world taxi HQ.');
      }
    }
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyMeters: position.coords.accuracy,
    capturedAt: position.timestamp
  };
}
