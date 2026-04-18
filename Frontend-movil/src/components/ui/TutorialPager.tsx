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

  // true mientras se resuelven permisos — bloquea cualquier nuevo deslizamiento
  const [scrollBloqueado, setScrollBloqueado] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const pages = React.Children.toArray(children);

  const goToIndex = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActiveIndex(index);
  };

  const handleScrollEnd = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Si ya hay un permiso en proceso, ignora el evento completamente
    if (scrollBloqueado) return;

    const xOffset = event.nativeEvent.contentOffset.x;
    const intentIndex = Math.round(xOffset / width);

    if (intentIndex > activeIndex && paginasConBloqueo[activeIndex]) {

      // 1. Bloquea el scroll para que no se pueda deslizar durante los permisos
      setScrollBloqueado(true);

      // 2. Regresa visualmente a la página actual
      goToIndex(activeIndex);

      // 3. Muestra el modal/permiso y espera la decisión del usuario
      const puedePasar = await paginasConBloqueo[activeIndex]();

      if (puedePasar) {
        // 4. Avanza a la siguiente página
        goToIndex(activeIndex + 1);
      }

      // 5. Desbloquea con delay para que el ScrollView termine
      // de procesar eventos pendientes antes de aceptar nuevos gestos
      setTimeout(() => setScrollBloqueado(false), 400);

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
        // Bloquea físicamente el deslizamiento mientras hay permisos pendientes
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