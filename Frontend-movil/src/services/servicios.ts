/**
 * El backend son 3 microservicios (Auth, Alert y Evidence) sin API Gateway: cada petición va al
 * servicio dueño según el inicio de la ruta. Sin EXPO_PUBLIC_ALERT_API_URL / _EVIDENCE_API_URL todo
 * va a la URL principal (el monolito o Auth), así la app funciona igual mientras se despliegan.
 */
const EVIDENCE_ROUTES = ["/api/evidences"];
const ALERT_ROUTES = [
  "/api/alerts", "/api/contacts", "/api/location-logs", "/api/zones", "/api/resources", "/api/saved-routes",
  "/api/frequent-locations", "/api/received-alerts", "/api/zone-reports", "/api/resource-calls", "/api/public/tracking",
  "/api/safe-trips",
];

const startsWith = (route: string, prefixes: string[]) =>
  prefixes.some((p) => route === p || route.startsWith(p + "/") || route.startsWith(p + "?"));

/** URL base del servicio que atiende esa ruta, o null si es la principal. */
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
