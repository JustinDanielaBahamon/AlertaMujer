import { Platform } from "react-native";

/**
 * Marcas cuyo sistema trae gestos de movimiento que se activan al agitar el teléfono y que pueden
 * dispararse junto con la alerta (p. ej. Moto Acciones enciende la linterna con dos movimientos de
 * "hachazo", lo que podría delatar a la usuaria en la oscuridad). La app no puede desactivarlos:
 * solo avisa y explica dónde hacerlo.
 */
export type GestureConflict = "motorola";

const BRANDS: Record<string, GestureConflict> = {
  motorola: "motorola",
  lenovo: "motorola", // Lenovo usa las mismas Moto Acciones
};

export function gestureConflict(manufacturer: string | undefined, brand?: string): GestureConflict | null {
  for (const value of [manufacturer, brand]) {
    const key = (value ?? "").trim().toLowerCase();
    if (BRANDS[key]) return BRANDS[key];
  }
  return null;
}

/** Conflicto del teléfono en el que corre la app (solo Android). */
export function conflictOnThisPhone(): GestureConflict | null {
  if (Platform.OS !== "android") return null;
  const c = Platform.constants as { Manufacturer?: string; Brand?: string };
  return gestureConflict(c.Manufacturer, c.Brand);
}
