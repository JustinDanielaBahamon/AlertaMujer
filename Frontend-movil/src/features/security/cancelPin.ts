import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

/**
 * Optional PIN to cancel an alert that was already sent, and the duress PIN: typing the duress one
 * looks like a normal cancel on her phone, but the alert goes on and her contacts are warned that she
 * may be under pressure. A wrong PIN never cancels. Only hashes (with a random salt) are stored, in
 * the phone's secure storage.
 */

const KEY = "alerta_cancel_pins";
export const PIN_LENGTH_MIN = 4;
export const PIN_LENGTH_MAX = 6;

type Stored = { salt: string; pin: string; duress: string | null };
export type PinCheck = "ok" | "duress" | "wrong";

const hash = (salt: string, pin: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);

async function read(): Promise<Stored | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

export const validPin = (pin: string): boolean => new RegExp(`^\\d{${PIN_LENGTH_MIN},${PIN_LENGTH_MAX}}$`).test(pin);

export async function hasCancelPin(): Promise<boolean> {
  return (await read()) !== null;
}

export async function hasDuressPin(): Promise<boolean> {
  return !!(await read())?.duress;
}

/** Saves the PIN and, optionally, the duress PIN (it must be different). */
export async function saveCancelPins(pin: string, duress: string | null): Promise<void> {
  if (!validPin(pin)) throw new Error(`El PIN debe tener de ${PIN_LENGTH_MIN} a ${PIN_LENGTH_MAX} números`);
  if (duress !== null && !validPin(duress)) throw new Error(`El PIN de emergencia debe tener de ${PIN_LENGTH_MIN} a ${PIN_LENGTH_MAX} números`);
  if (duress !== null && duress === pin) throw new Error("El PIN de emergencia debe ser distinto al PIN normal");
  const salt = Crypto.randomUUID();
  const stored: Stored = { salt, pin: await hash(salt, pin), duress: duress === null ? null : await hash(salt, duress) };
  await SecureStore.setItemAsync(KEY, JSON.stringify(stored));
}

export async function removeCancelPins(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}

/** Without a PIN configured any cancel is "ok" (as before). */
export async function checkCancelPin(input: string): Promise<PinCheck> {
  const stored = await read();
  if (!stored) return "ok";
  const h = await hash(stored.salt, input);
  if (h === stored.pin) return "ok";
  if (stored.duress && h === stored.duress) return "duress";
  return "wrong";
}
