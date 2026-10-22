import { useLocationReporting } from "../hooks/use-location-reporting";

/** Component without UI that keeps sending the location while there is a session. */
export default function LocationReport() {
  useLocationReporting();
  return null;
}
