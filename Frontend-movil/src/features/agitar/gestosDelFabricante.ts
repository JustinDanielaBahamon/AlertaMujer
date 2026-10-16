import { Platform } from "react-native";

/**
 * Marcas cuyo sistema trae gestos de movimiento que se activan al agitar el teléfono y que pueden
 * dispararse junto con la alerta (p. ej. Moto Acciones enciende la linterna con dos movimientos de
 * "hachazo", lo que podría delatar a la usuaria en la oscuridad). La app no puede desactivarlos:
 * solo avisa y explica dónde hacerlo.
 */
export type ConflictoDeGestos = "motorola";

const MARCAS: Record<string, ConflictoDeGestos> = {
  motorola: "motorola",
  lenovo: "motorola", // Lenovo usa las mismas Moto Acciones
};

export function conflictoDeGestos(fabricante: string | undefined, marca?: string): ConflictoDeGestos | null {
  for (const valor of [fabricante, marca]) {
    const clave = (valor ?? "").trim().toLowerCase();
    if (MARCAS[clave]) return MARCAS[clave];
  }
  return null;
}

/** Conflicto del teléfono en el que corre la app (solo Android). */
export function conflictoDeEsteTelefono(): ConflictoDeGestos | null {
  if (Platform.OS !== "android") return null;
  const c = Platform.constants as { Manufacturer?: string; Brand?: string };
  return conflictoDeGestos(c.Manufacturer, c.Brand);
}
