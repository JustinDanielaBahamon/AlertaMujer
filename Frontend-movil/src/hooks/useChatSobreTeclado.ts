import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, View, useWindowDimensions } from "react-native";

/**
 * Con edge-to-edge Android no achica la pantalla al abrir el teclado: el chat quedaba debajo.
 * Devuelve el espacio a dejar al final del ScrollView (la altura del teclado) y una función para
 * el foco del chat que desplaza la pantalla hasta dejar el campo de texto justo encima del teclado.
 */
export function useChatSobreTeclado() {
  const scrollRef = useRef<ScrollView>(null);
  const chatRef = useRef<View>(null);
  const [alturaTeclado, setAlturaTeclado] = useState(0);
  const { height: altoPantalla } = useWindowDimensions();
  const quiereVerChat = useRef(false);
  const desplazamiento = useRef(0);

  const llevarAlChat = useCallback(
    (teclado: number) => {
      const scroll = scrollRef.current;
      const chat = chatRef.current;
      if (!scroll || !chat) return;
      chat.measureInWindow((_x, y, _ancho, alto) => {
        // Cuánto tapa el teclado el borde inferior del chat (con un pequeño margen)
        const tapado = y + alto - (altoPantalla - teclado) + 16;
        if (tapado > 0) scroll.scrollTo({ y: desplazamiento.current + tapado, animated: true });
      });
    },
    [altoPantalla],
  );

  useEffect(() => {
    const mostrar = Keyboard.addListener("keyboardDidShow", (e) => {
      setAlturaTeclado(e.endCoordinates.height);
      // Se espera a que el ScrollView tenga el espacio extra antes de medir
      if (quiereVerChat.current) setTimeout(() => llevarAlChat(e.endCoordinates.height), 50);
    });
    const ocultar = Keyboard.addListener("keyboardDidHide", () => {
      setAlturaTeclado(0);
      quiereVerChat.current = false;
    });
    return () => {
      mostrar.remove();
      ocultar.remove();
    };
  }, [llevarAlChat]);

  /** Para el ScrollView: guarda su desplazamiento actual (lo usa llevarAlChat). */
  const alDesplazar = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    desplazamiento.current = e.nativeEvent.contentOffset.y; // en un ref: no re-renderiza al desplazar
  }, []);

  const alEnfocarChat = useCallback(() => {
    quiereVerChat.current = true;
    if (alturaTeclado > 0) llevarAlChat(alturaTeclado);
  }, [alturaTeclado, llevarAlChat]);

  return { scrollRef, chatRef, alturaTeclado, alDesplazar, alEnfocarChat };
}
