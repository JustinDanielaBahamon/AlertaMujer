// Configuración dinámica sobre app.json: agrega lo que necesita la alarma de emergencia (push FCM +
// Notifee) sin romper el build cuando falta google-services.json.
const fs = require("fs");
const path = require("path");

module.exports = ({ config }) => {
  // google-services.json: archivo local (no se sube a git) o variable de archivo de EAS
  const googleServices = process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json";
  const conFirebase = fs.existsSync(path.resolve(__dirname, googleServices));
  // HTTP sin cifrar solo para desarrollo local (backend en la IP del PC); los APK de EAS hablan
  // con Render por HTTPS y no deben permitir tráfico en claro
  const perfilEas = process.env.EAS_BUILD_PROFILE;
  const permitirHttp = !perfilEas || perfilEas === "development";

  const plugins = (config.plugins ?? []).map((p) => {
    // Notifee publica su librería Android en un repositorio Maven local dentro de node_modules
    if (Array.isArray(p) && p[0] === "expo-build-properties") {
      const opciones = p[1] ?? {};
      const android = opciones.android ?? {};
      return [
        "expo-build-properties",
        {
          ...opciones,
          android: {
            ...android,
            usesCleartextTraffic: permitirHttp,
            extraMavenRepos: [
              ...(android.extraMavenRepos ?? []),
              "../../node_modules/@notifee/react-native/android/libs",
            ],
          },
        },
      ];
    }
    return p;
  });

  if (conFirebase) plugins.push("@react-native-firebase/app");
  plugins.push("./plugins/withAlarmSound");
  plugins.push("expo-secure-store");
  plugins.push("./plugins/withServicioProteccion");

  const permisos = new Set([
    ...(config.android?.permissions ?? []),
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.USE_FULL_SCREEN_INTENT",
    "android.permission.VIBRATE",
    "android.permission.WAKE_LOCK",
  ]);

  return {
    ...config,
    plugins,
    android: {
      ...config.android,
      permissions: [...permisos],
      ...(conFirebase ? { googleServicesFile: googleServices } : {}),
    },
    extra: { ...config.extra, pushConfigurado: conFirebase },
  };
};
