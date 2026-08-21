export interface DistanceRateBand {
  /** Inclusive cumulative upper bound. Omit/null for the final unlimited band. */
  upToMeters?: number | null;
  centsPerKilometer: number;
}

export interface FareSurcharge {
  id: string;
  label: string;
  cents: number;
}

export interface TaxiTariffProfile {
  id: string;
  jurisdiction: string;
  currency: string;
  sourceLabel: string;
  sourceUrl?: string;
  verifiedAt?: string;
  baseFareCents: number;
  distanceBands: DistanceRateBand[];
  waitingCentsPerHour: number;
  surcharges?: FareSurcharge[];
}

export interface FareEstimateInput {
  distanceMeters: number;
  billableWaitingSeconds: number;
  surchargeIds?: string[];
}

export interface FareEstimate {
  currency: string;
  baseFareCents: number;
  distanceFareCents: number;
  waitingFareCents: number;
  surchargeCents: number;
  totalCents: number;
}

function assertNonNegativeFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a non-negative finite number.`);
}

function distanceFareCents(distanceMeters: number, bands: readonly DistanceRateBand[]): number {
  assertNonNegativeFinite(distanceMeters, 'Distance');
  if (bands.length === 0) throw new Error('Taxi tariff requires at least one distance band.');

  let remaining = distanceMeters;
  let previousLimit = 0;
  let fare = 0;

  for (const band of bands) {
    assertNonNegativeFinite(band.centsPerKilometer, 'Distance rate');
    const upper = band.upToMeters ?? Number.POSITIVE_INFINITY;
    if (upper !== Number.POSITIVE_INFINITY && (!Number.isFinite(upper) || upper <= previousLimit)) {
      throw new Error('Taxi tariff distance bands must have ascending positive limits.');
    }

    const capacity = upper - previousLimit;
    const metersInBand = Math.min(remaining, capacity);
    fare += (metersInBand / 1_000) * band.centsPerKilometer;
    remaining -= metersInBand;
    previousLimit = upper;
    if (remaining <= 0) break;
  }

  if (remaining > 0) throw new Error('Taxi tariff has no unlimited final distance band.');
  return Math.round(fare);
}

export function estimateFare(profile: TaxiTariffProfile, input: FareEstimateInput): FareEstimate {
  assertNonNegativeFinite(profile.baseFareCents, 'Base fare');
  assertNonNegativeFinite(profile.waitingCentsPerHour, 'Waiting rate');
  assertNonNegativeFinite(input.billableWaitingSeconds, 'Waiting time');

  const distanceFare = distanceFareCents(input.distanceMeters, profile.distanceBands);
  const waitingFare = Math.round((input.billableWaitingSeconds / 3_600) * profile.waitingCentsPerHour);
  const selected = new Set(input.surchargeIds ?? []);
  const surchargeCents = (profile.surcharges ?? [])
    .filter((surcharge) => selected.has(surcharge.id))
    .reduce((sum, surcharge) => sum + surcharge.cents, 0);

  return {
    currency: profile.currency,
    baseFareCents: Math.round(profile.baseFareCents),
    distanceFareCents: distanceFare,
    waitingFareCents: waitingFare,
    surchargeCents,
    totalCents: Math.round(profile.baseFareCents) + distanceFare + waitingFare + surchargeCents
  };
}
