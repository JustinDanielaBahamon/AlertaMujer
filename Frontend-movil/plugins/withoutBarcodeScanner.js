// expo-camera always ships the ML Kit barcode scanner native library (libbarhopper_v3.so, ~5 MB per
// CPU architecture). The app only records video and never scans codes (the analyzer is only created
// when barcode scanning is requested), so the library is left out of the APK.
const { withAppBuildGradle } = require("expo/config-plugins");

const MARKER = "// withoutBarcodeScanner";

module.exports = function withoutBarcodeScanner(config) {
  return withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes(MARKER)) {
      mod.modResults.contents += `
${MARKER}
android {
    packagingOptions {
        jniLibs {
            excludes += ["**/libbarhopper_v3.so"]
        }
    }
}
`;
    }
    return mod;
  });
};
