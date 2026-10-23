// Dynamic config on top of app.json: adds what the emergency alarm needs (FCM push + Notifee)
// without breaking the build when google-services.json is missing.
const fs = require("fs");
const path = require("path");

module.exports = ({ config }) => {
  // google-services.json: local file (not committed) or an EAS file variable
  const googleServices = process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json";
  const withFirebase = fs.existsSync(path.resolve(__dirname, googleServices));
  // Plain HTTP only for local development (backend on the PC IP); EAS APKs talk to Render over
  // HTTPS and must not allow cleartext traffic
  const easProfile = process.env.EAS_BUILD_PROFILE;
  const allowHttp = !easProfile || easProfile === "development";

  const plugins = (config.plugins ?? []).map((p) => {
    // Notifee publishes its Android library in a local Maven repository inside node_modules
    if (Array.isArray(p) && p[0] === "expo-build-properties") {
      const options = p[1] ?? {};
      const android = options.android ?? {};
      return [
        "expo-build-properties",
        {
          ...options,
          android: {
            ...android,
            usesCleartextTraffic: allowHttp,
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

  if (withFirebase) plugins.push("@react-native-firebase/app");
  plugins.push("./plugins/withAlarmSound");
  plugins.push("expo-secure-store");
  plugins.push("./plugins/withProtectionService");
  // Home screen "SOS" widget (src/features/widget)
  plugins.push([
    "react-native-android-widget",
    {
      widgets: [
        {
          name: "AlertaSOS",
          label: "AlertaMujer SOS",
          description: "Botón para enviar una alerta de emergencia",
          minWidth: "110dp",
          minHeight: "110dp",
          targetCellWidth: 2,
          targetCellHeight: 2,
          previewImage: "./assets/images/widget-sos-preview.png",
          resizeMode: "horizontal|vertical",
          updatePeriodMillis: 0,
        },
      ],
    },
  ]);

  const permissions = new Set([
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
      permissions: [...permissions],
      ...(withFirebase ? { googleServicesFile: googleServices } : {}),
    },
    extra: { ...config.extra, pushConfigurado: withFirebase },
  };
};
