import React, { useEffect, useState } from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

/** "m:ss" que falta para `fin`. Solo este texto se vuelve a dibujar cada segundo. */
export default function Countdown({ end, durationMin, style }: {
  end: Date | null;
  durationMin: number;
  style?: StyleProp<TextStyle>;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!end) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [end]);

  const seconds = end ? Math.max(0, Math.round((end.getTime() - now) / 1000)) : durationMin * 60;
  return <Text style={style}>{`${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}</Text>;
}
