/**
 * The backend is 3 microservices (Auth, Alert and Evidence) with no API Gateway: each request goes to the
 * owning service by the start of the route. Without EXPO_PUBLIC_ALERT_API_URL / _EVIDENCE_API_URL everything
 * goes to the main URL (the monolith or Auth), so the app works the same while they are deployed.
 */
const EVIDENCE_ROUTES = ["/api/evidences"];
const ALERT_ROUTES = [
  "/api/alerts", "/api/contacts", "/api/location-logs", "/api/zones", "/api/resources", "/api/saved-routes",
  "/api/frequent-locations", "/api/received-alerts", "/api/zone-reports", "/api/resource-calls", "/api/public/tracking",
  "/api/safe-trips",
];

const startsWith = (route: string, prefixes: string[]) =>
  prefixes.some((p) => route === p || route.startsWith(p + "/") || route.startsWith(p + "?"));

/** Base URL of the service that handles that route, or null if it is the main one. */
export function serviceFor(
  route: string,
  urls: { alert?: string; evidence?: string } = {
    alert: process.env.EXPO_PUBLIC_ALERT_API_URL,
    evidence: process.env.EXPO_PUBLIC_EVIDENCE_API_URL,
  },
): string | null {
  if (urls.evidence && startsWith(route, EVIDENCE_ROUTES)) return urls.evidence;
  if (urls.alert && startsWith(route, ALERT_ROUTES)) return urls.alert;
  return null;
}
