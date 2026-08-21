import { Geolocation } from '@capacitor/geolocation';
import type { GeoPoint } from '../core/contracts';

type PositionHandler = (point: GeoPoint) => void;
type ErrorHandler = (message: string) => void;

export async function startPlayerTracking(
  onPosition: PositionHandler,
  onError: ErrorHandler
): Promise<() => Promise<void>> {
  const watchId = await Geolocation.watchPosition(
    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 3000
    },
    (position, error) => {
      if (error) {
        onError(error.message || 'Live GPS tracking failed.');
        return;
      }
      if (!position) return;

      onPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        capturedAt: position.timestamp
      });
    }
  );

  return async () => {
    await Geolocation.clearWatch({ id: watchId });
  };
}
