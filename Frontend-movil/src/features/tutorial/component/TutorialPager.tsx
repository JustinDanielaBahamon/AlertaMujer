import React, { createContext, useContext, useRef, useState } from "react";
import { View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const { width } = Dimensions.get("window");

// Mínimo que el usuario debe arrastrar hacia adelante para contar como "quiere avanzar"
const MIN_DRAG = 20;

// Cada página puede saber si es la que se está viendo (lo usa la animación de arriba)
// y pedir pasar a la siguiente desde un botón (pasa por el mismo bloqueo que deslizar)
const TutorialPageContext = createContext<{ isActive: boolean; advance: () => Promise<void> }>({
  isActive: true,
  advance: async () => {},
});
export const useTutorialPage = () => useContext(TutorialPageContext);

interface TutorialPagerProps {
  children: React.ReactNode;
  lockedPages?: { [index: number]: () => Promise<boolean> };
}

export const TutorialPager = ({ children, lockedPages = {} }: TutorialPagerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef         = useRef<ScrollView>(null);
  const activeIndexRef    = useRef(0);
  const processingRef     = useRef(false);
  const advanceAttemptRef  = useRef(0);
  const approvedPages  = useRef<Set<number>>(new Set());

  const pages = React.Children.toArray(children);
  const lastPage = pages.length - 1;

  // Una página está bloqueada si tiene verificación y todavía no la pasó
  const isLocked = (index: number) =>
    !!lockedPages[index] && !approvedPages.current.has(index);

  // Última página a la que se puede llegar desde la actual sin pasar un bloqueo
  const maxIndex = () => {
    let i = activeIndexRef.current;
    while (i < lastPage && !isLocked(i)) i++;
    return i;
  };

  const goToIndex = (index: number) => {
    const destination = Math.max(0, Math.min(index, lastPage));
    scrollRef.current?.scrollTo({ x: destination * width, animated: true });
    activeIndexRef.current = destination;
    setActiveIndex(destination);
  };

  // La página activa sale de la posición real. Al frenar el scroll con scrollTo, Android a veces no
  // avisa el final del deslizamiento: la página quedaba desfasada y ya no dejaba avanzar.
  const sync = (x: number) => {
    const index = Math.min(Math.round(x / width), maxIndex());
    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      setActiveIndex(index);
    }
  };

  // Mientras el usuario arrastra: si intenta pasar una página bloqueada, el scroll
  // se queda pegado en esa página (no se desliza a la siguiente y regresa)
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const maximum = maxIndex();
    const limit = maximum * width;

    if (x > limit + 1) {
      if (maximum !== activeIndexRef.current) sync(limit);
      advanceAttemptRef.current = Math.max(advanceAttemptRef.current, x - limit);
      scrollRef.current?.scrollTo({ x: limit, animated: false });
    }
  };

  const handleScrollBeginDrag = () => {
    advanceAttemptRef.current = 0;
  };

  // Pasa a la siguiente página; si la actual está bloqueada, primero corre su verificación
  const advance = async () => {
    const current = activeIndexRef.current;
    if (processingRef.current) return;
    if (!isLocked(current)) {
      goToIndex(current + 1);
      return;
    }
    processingRef.current = true;
    try {
      const canPass = await lockedPages[current]();
      if (canPass) {
        approvedPages.current.add(current);
        goToIndex(current + 1);
      }
    } finally {
      processingRef.current = false;
    }
  };

  // Al soltar el dedo: si quería avanzar y la página está bloqueada, corre la verificación
  const handleScrollEndDrag = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const wantsToAdvance = advanceAttemptRef.current > MIN_DRAG;
    advanceAttemptRef.current = 0;
    if (wantsToAdvance) sync(event.nativeEvent.contentOffset.x);
    if (wantsToAdvance && isLocked(activeIndexRef.current)) await advance();
  };

  // Al terminar de deslizar: actualiza la página activa (nunca más allá de un bloqueo)
  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    sync(event.nativeEvent.contentOffset.x);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {pages.map((child, index) => (
          <TutorialPageContext.Provider key={index} value={{ isActive: activeIndex === index, advance }}>
            <View style={{ width, flex: 1 }}>
              {child}
            </View>
          </TutorialPageContext.Provider>
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 30 }}>
        {pages.map((_, i) => (
          <View
            key={i}
            style={{
              width: activeIndex === i ? 22 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: activeIndex === i ? "#4A148C" : "#ffffff",
              marginHorizontal: 4,
              opacity: activeIndex === i ? 1 : 0.6,
            }}
          />
        ))}
      </View>
    </View>
  );
};