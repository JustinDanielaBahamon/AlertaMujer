// Copies the emergency alarm sound to Android res/raw, where Notifee looks it up by name
// (channel "alertas_sos", sound "alarma_sos").
const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");

module.exports = function withAlarmSound(config) {
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const source = path.join(mod.modRequest.projectRoot, "assets", "sounds", "alarma_sos.wav");
      const target = path.join(mod.modRequest.platformProjectRoot, "app", "src", "main", "res", "raw");
      fs.mkdirSync(target, { recursive: true });
      fs.copyFileSync(source, path.join(target, "alarma_sos.wav"));
      return mod;
    },
  ]);
};
