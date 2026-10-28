/**
 * Detects the computer's current network IP and writes it to the .env file as
 * EXPO_PUBLIC_API_URL, so Expo Go (the phone) points to the right backend without
 * editing the IP by hand every time.
 *
 * Runs automatically before `expo start` (see package.json).
 *
 * Manual use:
 *   node ./scripts/update-env.js            -> detects and writes the IP
 *   node ./scripts/update-env.js 10.0.0.5   -> forces a specific IP
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

const API_PORT = process.env.API_PORT || "8080";
const ENV_PATH = path.join(__dirname, "..", ".env");

/** Interfaces we do NOT want to use (virtual, docker, VM, etc.) */
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
  if (address.startsWith("169.254.")) return false; // link-local (no network)
  if (address.startsWith("172.17.")) return false; // docker default
  if (address.startsWith("172.18.")) return false; // docker/WSL
  if (address.startsWith("192.168.56.")) return false; // VirtualBox host-only
  return true;
}

function scoreInterface(name, address) {
  const lower = name.toLowerCase();
  let score = 0;

  // Penalize virtual interfaces
  if (IGNORED_NAME_HINTS.some((h) => lower.includes(h))) score -= 100;

  // Prefer Wi-Fi / WLAN and real Ethernet
  if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("wlan")) score += 50;
  if (lower.includes("ethernet")) score += 20;

  // Prefer the usual private LAN ranges
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
    `# File generated automatically by scripts/update-env.js\n` +
    `# No need to edit it by hand: it is updated when running "npm start".\n` +
    `EXPO_PUBLIC_API_URL=${url}\n`;

  fs.writeFileSync(ENV_PATH, content, "utf8");
}

function main() {
  const forcedIP = process.argv[2];
  let ip;

  if (forcedIP) {
    ip = forcedIP;
    console.log(`[update-env] IP forced manually: ${ip}`);
  } else {
    const best = detectLocalIPv4();
    if (best) {
      ip = best.address;
      console.log(`[update-env] Detected IP: ${ip}  (interface: ${best.name})`);
    } else {
      console.warn("[update-env] No valid network IP found. Using localhost.");
      ip = "localhost";
    }
  }

  const url = `http://${ip}:${API_PORT}`;
  writeEnv(url);
  console.log(`[update-env] EXPO_PUBLIC_API_URL=${url}`);
  console.log("[update-env] .env updated.");
}

main();
