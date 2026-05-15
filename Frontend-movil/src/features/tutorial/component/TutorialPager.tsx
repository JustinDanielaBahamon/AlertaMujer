import React, { useState, useRef } from "react";
import { View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const { width } = Dimensions.get("window");

interface TutorialPagerProps {
  children: React.ReactNode;
  paginasConBloqueo?: { [indice: number]: () => Promise<boolean> };
}

export const TutorialPager = ({ children, paginasConBloqueo = {} }: TutorialPagerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef          = useRef<ScrollView>(null);
  const activeIndexRef     = useRef(0);
  const procesandoRef      = useRef(false);
  const scrollBloqueadoRef = useRef(false); // ← ref en lugar de estado
  const paginasAprobadas   = useRef<Set<number>>(new Set());

  const pages = React.Children.toArray(children);

  const goToIndex = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  const setScrollBloqueado = (val: boolean) => {
    scrollBloqueadoRef.current = val;
    // Fuerza re-render para que scrollEnabled se actualice
    scrollRef.current?.setNativeProps({ scrollEnabled: !val });
  };

  const handleScrollEnd = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // ── Usa refs, nunca estado — sin stale closure ──
    if (scrollBloqueadoRef.current || procesandoRef.current) return;

    const xOffset      = event.nativeEvent.contentOffset.x;
    const intentIndex  = Math.round(xOffset / width);
    const currentIndex = activeIndexRef.current;

    const avanzando    = intentIndex > currentIndex;
    const tieneBloqueo = !!paginasConBloqueo[currentIndex];
    const yaAprobada   = paginasAprobadas.current.has(currentIndex);

    if (avanzando && tieneBloqueo && !yaAprobada) {

      procesandoRef.current = true;
      setScrollBloqueado(true);
      goToIndex(currentIndex);

      const puedePasar = await paginasConBloqueo[currentIndex]();

      if (puedePasar) {
        paginasAprobadas.current.add(currentIndex);
        const destino = currentIndex + 1;
        goToIndex(destino);
      }

      setTimeout(() => {
        setScrollBloqueado(false);
        procesandoRef.current = false;
      }, 400);

    } else {
      goToIndex(intentIndex);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true} // ← siempre true, controlamos con setNativeProps
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {pages.map((child, index) => (
          <View key={index} style={{ width, flex: 1 }}>
            {child}
          </View>
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