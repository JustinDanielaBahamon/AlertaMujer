// El servicio en primer plano de Notifee viene declarado como "shortService", que Android detiene a
// los 3 minutos. La protección por sacudida debe quedar encendida y enviar la ubicación con la
// pantalla bloqueada, así que se declara como servicio de ubicación.
const { withAndroidManifest } = require("expo/config-plugins");

const SERVICIO = "app.notifee.core.ForegroundService";

module.exports = function withServicioProteccion(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    const permisos = (manifest["uses-permission"] ??= []);
    for (const nombre of ["android.permission.FOREGROUND_SERVICE", "android.permission.FOREGROUND_SERVICE_LOCATION"]) {
      if (!permisos.some((p) => p.$["android:name"] === nombre)) permisos.push({ $: { "android:name": nombre } });
    }

    const app = manifest.application[0];
    const servicios = (app.service ??= []).filter((s) => s.$["android:name"] !== SERVICIO);
    servicios.push({
      $: {
        "android:name": SERVICIO,
        "android:exported": "false",
        "android:foregroundServiceType": "location",
        "tools:replace": "android:foregroundServiceType",
      },
    });
    app.service = servicios;
    return mod;
  });
};
