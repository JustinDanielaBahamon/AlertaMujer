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

  const scrollRef    = useRef<ScrollView>(null);
  // ✅ Ref que siempre tiene el índice real, no se congela en closures async
  const activeIndexRef = useRef(0);

  const pages = React.Children.toArray(children);

  const goToIndex = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    activeIndexRef.current = index; // ✅ actualizamos la ref inmediatamente
    setActiveIndex(index);
  };

  const handleScrollEnd = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (scrollBloqueado) return;

    const xOffset     = event.nativeEvent.contentOffset.x;
    const intentIndex = Math.round(xOffset / width);
    // ✅ Usamos la ref, no el estado (que puede estar desactualizado en async)
    const currentIndex = activeIndexRef.current;

    if (intentIndex > currentIndex && paginasConBloqueo[currentIndex]) {

      setScrollBloqueado(true);

      // Regresa visualmente a la página actual
      goToIndex(currentIndex);

      // Espera la decisión del usuario
      const puedePasar = await paginasConBloqueo[currentIndex]();

      if (puedePasar) {
        // ✅ Usamos activeIndexRef.current que siempre está actualizado
        goToIndex(activeIndexRef.current + 1);
      }

      setTimeout(() => setScrollBloqueado(false), 400);

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

      {/* Indicadores de página */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 30 }}>
        {pages.map((_, i) => (
          <View
            key={i}
            style={{
              width: activeIndex === i ? 22 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: activeIndex === i ? "#4A148C" : "#12bce7",
              marginHorizontal: 4,
              opacity: activeIndex === i ? 1 : 0.6,
            }}
          />
        ))}
      </View>
    </View>
  );
};