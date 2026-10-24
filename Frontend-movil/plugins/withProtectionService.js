// Notifee declares its foreground service as "shortService", which Android stops after 3 minutes.
// Shake protection must stay on and send the location with the screen locked, so it is declared as a
// location service. It is also a microphone service: an alert activated by shaking without the app on
// screen records audio under it (Android does not let a microphone service start from the background).
const { withAndroidManifest } = require("expo/config-plugins");

const SERVICE = "app.notifee.core.ForegroundService";

module.exports = function withProtectionService(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";

    const permissions = (manifest["uses-permission"] ??= []);
    for (const name of [
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_LOCATION",
      "android.permission.FOREGROUND_SERVICE_MICROPHONE",
    ]) {
      if (!permissions.some((p) => p.$["android:name"] === name)) permissions.push({ $: { "android:name": name } });
    }

    const app = manifest.application[0];
    const services = (app.service ??= []).filter((s) => s.$["android:name"] !== SERVICE);
    services.push({
      $: {
        "android:name": SERVICE,
        "android:exported": "false",
        "android:foregroundServiceType": "location|microphone",
        "tools:replace": "android:foregroundServiceType",
      },
    });
    app.service = services;
    return mod;
  });
};
