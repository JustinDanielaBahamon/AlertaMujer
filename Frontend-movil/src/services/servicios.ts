/**
 * El backend son 3 microservicios (Auth, Alert y Evidence) sin API Gateway: cada petición va al
 * servicio dueño según el inicio de la ruta. Sin EXPO_PUBLIC_ALERT_API_URL / _EVIDENCE_API_URL todo
 * va a la URL principal (el monolito o Auth), así la app funciona igual mientras se despliegan.
 */
const RUTAS_EVIDENCE = ["/api/evidences"];
const RUTAS_ALERT = [
  "/api/alerts", "/api/contacts", "/api/location-logs", "/api/zones", "/api/resources", "/api/saved-routes",
  "/api/frequent-locations", "/api/received-alerts", "/api/zone-reports", "/api/resource-calls", "/api/public/tracking",
];

const empiezaCon = (ruta: string, prefijos: string[]) =>
  prefijos.some((p) => ruta === p || ruta.startsWith(p + "/") || ruta.startsWith(p + "?"));

/** URL base del servicio que atiende esa ruta, o null si es la principal. */
export function servicioPara(
  ruta: string,
  urls: { alert?: string; evidence?: string } = {
    alert: process.env.EXPO_PUBLIC_ALERT_API_URL,
    evidence: process.env.EXPO_PUBLIC_EVIDENCE_API_URL,
  },
): string | null {
  if (urls.evidence && empiezaCon(ruta, RUTAS_EVIDENCE)) return urls.evidence;
  if (urls.alert && empiezaCon(ruta, RUTAS_ALERT)) return urls.alert;
  return null;
}
