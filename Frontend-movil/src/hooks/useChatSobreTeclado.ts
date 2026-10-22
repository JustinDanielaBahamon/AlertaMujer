import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, View, useWindowDimensions } from "react-native";

/**
 * Con edge-to-edge Android no achica la pantalla al abrir el teclado: el chat quedaba debajo.
 * Devuelve el espacio a dejar al final del ScrollView (la altura del teclado) y una función para
 * el foco del chat que desplaza la pantalla hasta dejar el campo de texto justo encima del teclado.
 */
export function useChatAboveKeyboard() {
  const scrollRef = useRef<ScrollView>(null);
  const chatRef = useRef<View>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { height: screenHeight } = useWindowDimensions();
  const wantsChat = useRef(false);
  const scrollOffset = useRef(0);

  const goToChat = useCallback(
    (keyboard: number) => {
      const scroll = scrollRef.current;
      const chat = chatRef.current;
      if (!scroll || !chat) return;
      chat.measureInWindow((_x, y, _width, height) => {
        // Cuánto tapa el teclado el borde inferior del chat (con un pequeño margen)
        const covered = y + height - (screenHeight - keyboard) + 16;
        if (covered > 0) scroll.scrollTo({ y: scrollOffset.current + covered, animated: true });
      });
    },
    [screenHeight],
  );

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Se espera a que el ScrollView tenga el espacio extra antes de medir
      if (wantsChat.current) setTimeout(() => goToChat(e.endCoordinates.height), 50);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      wantsChat.current = false;
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [goToChat]);

  /** Para el ScrollView: guarda su desplazamiento actual (lo usa llevarAlChat). */
  const onScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollOffset.current = e.nativeEvent.contentOffset.y; // en un ref: no re-renderiza al desplazar
  }, []);

  const onChatFocus = useCallback(() => {
    wantsChat.current = true;
    if (keyboardHeight > 0) goToChat(keyboardHeight);
  }, [keyboardHeight, goToChat]);

  return { scrollRef, chatRef, keyboardHeight: keyboardHeight, onScroll: onScroll, onChatFocus: onChatFocus };
}
