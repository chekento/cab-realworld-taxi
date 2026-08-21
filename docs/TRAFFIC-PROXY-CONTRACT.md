# CAB v2 — Live Traffic Proxy Contract

Status: foundation contract for `feat/cab-v2-foundation`.

## Why a proxy exists

CAB must not ship a shared TomTom, HERE, or similar paid traffic-provider credential inside the Android APK/web bundle. Any credential embedded in client assets can be extracted and abused.

Therefore the client talks only to a CAB-controlled HTTPS endpoint. That backend may use a licensed traffic provider and converts provider-specific responses into the normalized CAB traffic model.

## Client request

Method: `POST`

Content-Type: `application/json`

Example body:

```json
{
  "schemaVersion": 1,
  "baselineDurationSeconds": 820,
  "baselineDistanceMeters": 11640,
  "route": [
    { "latitude": 53.63, "longitude": 10.24 },
    { "latitude": 53.62, "longitude": 10.20 }
  ]
}
```

Rules:
- route coordinates come from the already-calculated real road route,
- the client downsamples route geometry to at most 64 points,
- the backend must validate all coordinates and request sizes,
- no provider credential is sent by the client,
- exact location history should not be retained longer than operationally required,
- rate limiting and abuse protection belong on the backend.

## Normalized response

```json
{
  "provider": "HERE Traffic",
  "fetchedAt": 1787342400000,
  "trafficDurationSeconds": 1040,
  "delaySeconds": 220,
  "averageSpeedKmh": 31.5,
  "freeFlowSpeedKmh": 48.0,
  "congestionRatio": 0.66,
  "routeClosed": false,
  "incidents": [
    {
      "id": "provider-incident-id",
      "type": "accident",
      "title": "Accident",
      "severity": "heavy",
      "startTime": "2026-08-21T19:45:00Z",
      "point": { "latitude": 53.625, "longitude": 10.215 }
    }
  ]
}
```

Allowed severity values:
- `free`
- `light`
- `moderate`
- `heavy`
- `blocked`

CAB treats unknown severities conservatively as `moderate`.

## Provider mapping

The backend adapter is responsible for translating provider-specific concepts into CAB fields. Examples:
- current/expected speed -> `averageSpeedKmh`,
- free-flow/reference speed -> `freeFlowSpeedKmh`,
- provider jam factor -> `congestionRatio` or severity,
- road closure -> `routeClosed=true`,
- accidents/works/closures/events -> normalized `incidents`.

The Android/web client must not contain provider-specific authentication code.

## Failure behavior

Traffic is an enrichment layer, not a prerequisite for basic routing.

If the proxy is:
- not configured,
- offline,
- timed out,
- rate limited,
- or returns invalid data,

CAB keeps the real route and baseline ETA, marks traffic as degraded, and must not invent a delay value.

## Security requirements

Production proxy requirements:
- HTTPS only,
- provider credentials stored server-side,
- request validation,
- response normalization,
- rate limiting,
- reasonable request body limits,
- short network timeouts,
- CORS limited to intended clients where applicable,
- provider-license compliance,
- minimal logging of precise location data,
- no returning upstream credentials or raw authorization headers.

## Privacy principle

A route necessarily contains location information. The proxy should process only what is needed for live traffic and avoid permanent route-history retention by default. Any analytics requiring precise trip history must be a separate, explicit product/privacy decision.
