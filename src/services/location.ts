import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import type { GeoPoint } from '../core/contracts';

function isGranted(state: string | undefined): boolean {
  return state === 'granted';
}

function describeLocationError(error: unknown): Error {
  const candidate = error as { code?: string; message?: string } | undefined;
  const code = candidate?.code?.trim();
  const raw = candidate?.message?.trim() || (error instanceof Error ? error.message : 'Unknown location error.');
  const lower = `${code ?? ''} ${raw}`.toLowerCase();

  if (lower.includes('permission') || lower.includes('denied')) {
    return new Error('Android location permission was denied. Enable Location permission for CAB in Android Settings and try again.');
  }

  if (lower.includes('disabled') || lower.includes('not enabled') || lower.includes('location services')) {
    return new Error('Android Location services are switched off. Enable device Location/GPS and try again.');
  }

  if (lower.includes('timeout') || lower.includes('0007')) {
    return new Error('CAB could not obtain a location fix in time. Keep Location enabled, move near a window or outdoors, and try again.');
  }

  const diagnostic = code ? ` (${code})` : '';
  return new Error(`Location failed${diagnostic}: ${raw}`);
}

async function acquirePosition(enableHighAccuracy: boolean, timeout: number, maximumAge: number) {
  return Geolocation.getCurrentPosition({
    enableHighAccuracy,
    timeout,
    maximumAge
  });
}

export async function getPlayerPosition(): Promise<GeoPoint> {
  let preciseLocationGranted = true;

  if (Capacitor.isNativePlatform()) {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      throw new Error('The native Geolocation plugin is not available in this Android build.');
    }

    try {
      let permission = await Geolocation.checkPermissions();
      const hasFine = isGranted(permission.location);
      const hasCoarse = isGranted(permission.coarseLocation);

      if (!hasFine && !hasCoarse) {
        permission = await Geolocation.requestPermissions({
          permissions: ['location', 'coarseLocation']
        });
      }

      preciseLocationGranted = isGranted(permission.location);
      const anyLocationGranted = preciseLocationGranted || isGranted(permission.coarseLocation);

      if (!anyLocationGranted) {
        throw new Error('Android location permission was denied. Enable Location permission for CAB in Android Settings and try again.');
      }
    } catch (error) {
      throw describeLocationError(error);
    }
  }

  let position;
  try {
    position = await acquirePosition(preciseLocationGranted, 30_000, 30_000);
  } catch (firstError) {
    if (!Capacitor.isNativePlatform() || !preciseLocationGranted) {
      throw describeLocationError(firstError);
    }

    try {
      position = await acquirePosition(false, 12_000, 60_000);
    } catch (fallbackError) {
      throw describeLocationError(fallbackError);
    }
  }

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyMeters: position.coords.accuracy,
    capturedAt: position.timestamp
  };
}
