// Copia el sonido de la alarma de emergencia a res/raw de Android, donde Notifee lo busca por nombre
// (canal "alertas_sos", sonido "alarma_sos").
const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");

module.exports = function withAlarmSound(config) {
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const origen = path.join(mod.modRequest.projectRoot, "assets", "sounds", "alarma_sos.wav");
      const destino = path.join(mod.modRequest.platformProjectRoot, "app", "src", "main", "res", "raw");
      fs.mkdirSync(destino, { recursive: true });
      fs.copyFileSync(origen, path.join(destino, "alarma_sos.wav"));
      return mod;
    },
  ]);
};
