/** Sitio web de AlertaMujer: seguimiento de alertas, evidencias y descarga de la app. */
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://alerta-mujer.vercel.app";

/** APK de Android: recurso del último release del repositorio móvil (el mismo que ofrece la web). */
export const URL_DESCARGA_APK =
  process.env.EXPO_PUBLIC_APK_URL ||
  "https://github.com/JustinDanielaBahamon/AlertaMujer/releases/latest/download/AlertaMujer.apk";
