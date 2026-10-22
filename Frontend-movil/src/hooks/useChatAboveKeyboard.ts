import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, View, useWindowDimensions } from "react-native";

/**
 * With edge-to-edge Android does not shrink the screen when the keyboard opens: the chat ended up below it.
 * Returns the space to leave at the end of the ScrollView (the keyboard height) and a function for
 * the chat focus that scrolls the screen until the text field sits right above the keyboard.
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
        // How much the keyboard covers the bottom edge of the chat (with a small margin)
        const covered = y + height - (screenHeight - keyboard) + 16;
        if (covered > 0) scroll.scrollTo({ y: scrollOffset.current + covered, animated: true });
      });
    },
    [screenHeight],
  );

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Wait until the ScrollView has the extra space before measuring
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

  /** For the ScrollView: stores its current offset (used by goToChat). */
  const onScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollOffset.current = e.nativeEvent.contentOffset.y; // in a ref: no re-render while scrolling
  }, []);

  const onChatFocus = useCallback(() => {
    wantsChat.current = true;
    if (keyboardHeight > 0) goToChat(keyboardHeight);
  }, [keyboardHeight, goToChat]);

  return { scrollRef, chatRef, keyboardHeight: keyboardHeight, onScroll: onScroll, onChatFocus: onChatFocus };
}
