// Desactiva la verificación de "punteros etiquetados" de Android (Android 11+, estricta en 14).
// Algunas bibliotecas nativas liberan memoria con la etiqueta del puntero recortada y la app
// se cierra al iniciar con "Pointer tag ... was truncated". Ver:
// https://source.android.com/docs/security/test/tagged-pointers
const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withPointerTaggingDisabled(config) {
  return withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application?.[0];
    if (app) {
      app.$["android:allowNativeHeapPointerTagging"] = "false";
    }
    return mod;
  });
};
