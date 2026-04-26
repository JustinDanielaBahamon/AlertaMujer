import React, { useState, useRef } from "react";
import {
  View, ScrollView, Dimensions,
  NativeSyntheticEvent, NativeScrollEvent
} from "react-native";

const { width } = Dimensions.get("window");

interface TutorialPagerProps {
  children: React.ReactNode;
  paginasConBloqueo?: { [indice: number]: () => Promise<boolean> };
}

export const TutorialPager = ({ children, paginasConBloqueo = {} }: TutorialPagerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollBloqueado, setScrollBloqueado] = useState(false);

  const scrollRef      = useRef<ScrollView>(null);
  const activeIndexRef = useRef(0);
  // ← Set de páginas que ya fueron aprobadas en esta sesión
  const paginasAprobadas = useRef<Set<number>>(new Set());

  const pages = React.Children.toArray(children);

  const goToIndex = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  const handleScrollEnd = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (scrollBloqueado) return;

    const xOffset      = event.nativeEvent.contentOffset.x;
    const intentIndex  = Math.round(xOffset / width);
    const currentIndex = activeIndexRef.current;

    const avanzando = intentIndex > currentIndex;
    const tieneBloqueo = !!paginasConBloqueo[currentIndex];
    // ← Si ya fue aprobada antes, no pide nada
    const yaAprobada = paginasAprobadas.current.has(currentIndex);

    if (avanzando && tieneBloqueo && !yaAprobada) {

      setScrollBloqueado(true);
      goToIndex(currentIndex);

      const puedePasar = await paginasConBloqueo[currentIndex]();

      if (puedePasar) {
        // ← Marca esta página como aprobada para el resto de la sesión
        paginasAprobadas.current.add(currentIndex);
        goToIndex(activeIndexRef.current + 1);
      }

      setTimeout(() => setScrollBloqueado(false), 400);

    } else {
      // Avanza, regresa o ya estaba aprobada → sin bloqueo
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
        scrollEnabled={!scrollBloqueado}
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