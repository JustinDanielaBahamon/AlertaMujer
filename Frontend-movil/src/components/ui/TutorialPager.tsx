import React, { useState, useRef } from "react";
import {
  View, ScrollView, Dimensions,
  NativeSyntheticEvent, NativeScrollEvent
} from "react-native";

const { width } = Dimensions.get("window");

interface TutorialPagerProps {
  children: React.ReactNode;
  // índice de página que requiere acción antes de avanzar
  paginasConBloqueo?: { [indice: number]: () => Promise<boolean> };
}

export const TutorialPager = ({ children, paginasConBloqueo = {} }: TutorialPagerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pages = React.Children.toArray(children);

  const goToIndex = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  const handleScrollEnd = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const intentIndex = Math.round(xOffset / width);

    // Si intenta avanzar (no retroceder) y hay bloqueo en página actual
    if (intentIndex > activeIndex && paginasConBloqueo[activeIndex]) {
      // Regresa a la página actual mientras ejecuta el bloqueo
      goToIndex(activeIndex);
      // Ejecuta la acción (ej: mostrar permisos), espera resultado
      const puedePasar = await paginasConBloqueo[activeIndex]();
      if (puedePasar) {
        goToIndex(intentIndex);
      }
    } else {
      setActiveIndex(intentIndex);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
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
              backgroundColor: activeIndex === i ? "#4A148C" : "#c412e7",
              marginHorizontal: 4,
              opacity: activeIndex === i ? 1 : 0.6,
            }}
          />
        ))}
      </View>
    </View>
  );
};