/**
 * Detecta la IP de red actual del computador y la escribe en el archivo .env
 * como EXPO_PUBLIC_API_URL, para que Expo Go (el celular) apunte al backend
 * correcto sin tener que editar la IP a mano cada vez.
 *
 * Se ejecuta automáticamente antes de `expo start` (ver package.json).
 *
 * Uso manual:
 *   node ./scripts/update-env.js            -> detecta y escribe la IP
 *   node ./scripts/update-env.js 10.0.0.5   -> fuerza una IP concreta
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const API_PORT = process.env.API_PORT || "8080";
const ENV_PATH = path.join(__dirname, "..", ".env");

/** Rangos / interfaces que NO queremos usar (virtuales, docker, VM, etc.) */
const IGNORED_NAME_HINTS = [
  "vethernet",
  "hyper-v",
  "wsl",
  "virtualbox",
  "vmware",
  "loopback",
  "default switch",
  "bluetooth",
  "tap",
  "tun",
  "docker",
];

function isUsableAddress(address) {
  if (!address) return false;
  if (address.startsWith("127.")) return false; // loopback
  if (address.startsWith("169.254.")) return false; // link-local (sin red)
  if (address.startsWith("172.17.")) return false; // docker default
  if (address.startsWith("172.18.")) return false; // docker/WSL
  if (address.startsWith("192.168.56.")) return false; // VirtualBox host-only
  return true;
}

function scoreInterface(name, address) {
  const lower = name.toLowerCase();
  let score = 0;

  // Penalizar interfaces virtuales
  if (IGNORED_NAME_HINTS.some((h) => lower.includes(h))) score -= 100;

  // Preferir Wi-Fi / WLAN y Ethernet real
  if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("wlan")) score += 50;
  if (lower.includes("ethernet")) score += 20;

  // Preferir rangos privados típicos de LAN
  if (address.startsWith("192.168.")) score += 10;
  if (address.startsWith("10.")) score += 10;

  return score;
}

function detectLocalIPv4() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs || []) {
      const family = typeof addr.family === "string" ? addr.family : `IPv${addr.family}`;
      if (family !== "IPv4") continue;
      if (addr.internal) continue;
      if (!isUsableAddress(addr.address)) continue;

      candidates.push({
        name,
        address: addr.address,
        score: scoreInterface(name, addr.address),
      });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

function writeEnv(url) {
  const content =
    `# Archivo generado automáticamente por scripts/update-env.js\n` +
    `# No es necesario editarlo a mano: se actualiza al ejecutar "npm start".\n` +
    `EXPO_PUBLIC_API_URL=${url}\n`;

  fs.writeFileSync(ENV_PATH, content, "utf8");
}

function main() {
  const forcedIP = process.argv[2];
  let ip;

  if (forcedIP) {
    ip = forcedIP;
    console.log(`[update-env] IP forzada manualmente: ${ip}`);
  } else {
    const best = detectLocalIPv4();
    if (best) {
      ip = best.address;
      console.log(`[update-env] IP detectada: ${ip}  (interfaz: ${best.name})`);
    } else {
      console.warn("[update-env] No se detectó ninguna IP de red válida. Se usará localhost.");
      ip = "localhost";
    }
  }

  const url = `http://${ip}:${API_PORT}`;
  writeEnv(url);
  console.log(`[update-env] EXPO_PUBLIC_API_URL=${url}`);
  console.log("[update-env] .env actualizado.");
}

main();
