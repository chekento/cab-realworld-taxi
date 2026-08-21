import type { PassengerDNA, RouteOption } from '../../core/contracts';

export type DetourRisk = 'normal' | 'noticeable' | 'suspicious' | 'complaint-risk';

export interface DetourAssessment {
  extraDistanceMeters: number;
  extraDurationSeconds: number;
  distanceIncreaseRatio: number;
  passengerToleranceRatio: number;
  suspicionScore: number;
  risk: DetourRisk;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Game model only: estimates whether a passenger notices/dislikes a route deviation.
 * It does not claim to model real human behaviour or legal fare rules.
 */
export function assessDetour(
  expectedRoute: RouteOption,
  chosenRoute: RouteOption,
  passenger: PassengerDNA
): DetourAssessment {
  const baseDistance = Math.max(1, expectedRoute.distanceMeters);
  const extraDistanceMeters = Math.max(0, chosenRoute.distanceMeters - expectedRoute.distanceMeters);
  const extraDurationSeconds = Math.max(0, chosenRoute.durationSeconds - expectedRoute.durationSeconds);
  const distanceIncreaseRatio = extraDistanceMeters / baseDistance;

  // A tolerant passenger accepts more route variance; local knowledge reduces that tolerance.
  const toleranceFromPersonality = 0.03 + (passenger.routeTolerance / 100) * 0.17;
  const localKnowledgeReduction = (passenger.localKnowledge / 100) * 0.06;
  const passengerToleranceRatio = clamp(toleranceFromPersonality - localKnowledgeReduction, 0.02, 0.20);

  const excessOverTolerance = Math.max(0, distanceIncreaseRatio - passengerToleranceRatio);
  const suspicionScore = clamp(
    excessOverTolerance * 320 +
      passenger.localKnowledge * 0.45 +
      passenger.punctualityPriority * 0.18 -
      passenger.routeTolerance * 0.12,
    0,
    100
  );

  let risk: DetourRisk = 'normal';
  if (suspicionScore >= 75) risk = 'complaint-risk';
  else if (suspicionScore >= 50) risk = 'suspicious';
  else if (suspicionScore >= 25) risk = 'noticeable';

  return {
    extraDistanceMeters,
    extraDurationSeconds,
    distanceIncreaseRatio,
    passengerToleranceRatio,
    suspicionScore: Math.round(suspicionScore),
    risk
  };
}
