// Turns off Android "tagged pointers" checking (Android 11+, strict on 14).
// Some native libraries free memory with a truncated pointer tag and the app crashes on start
// with "Pointer tag ... was truncated". See:
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
