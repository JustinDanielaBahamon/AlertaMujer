import React, { useEffect, useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

/** "m:ss" que falta para `fin`. Solo este texto se vuelve a dibujar cada segundo. */
export default function CuentaRegresiva({ fin, duracionMin, style }: {
  fin: Date | null;
  duracionMin: number;
  style?: StyleProp<TextStyle>;
}) {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    if (!fin) return;
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [fin]);

  const segundos = fin ? Math.max(0, Math.round((fin.getTime() - ahora) / 1000)) : duracionMin * 60;
  return <Text style={style}>{`${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`}</Text>;
}
