import React, { useState } from "react";
import { View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const { width } = Dimensions.get("window");

interface TutorialPagerProps {
  // Cambiamos a ReactNode para aceptar cualquier combinación de elementos
  children: React.ReactNode; 
}

export const TutorialPager = ({ children }: TutorialPagerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Esto convierte los hijos en un array limpio, eliminando errores de tipado
  const pages = React.Children.toArray(children);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / width);
    setActiveIndex(index);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {pages.map((child, index) => (
    <View key={index} style={{ width: width, flex: 1 }}> {/* Asegúrate de que tenga flex: 1 */}
        {child}
    </View>
    ))}
      </ScrollView>

      {/* INDICADORES (PUNTOS) */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30 }}>
        {pages.map((_, i) => (
          <View
            key={i}
            style={{
              width: activeIndex === i ? 22 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: activeIndex === i ? '#4A148C' : '#d212f8',
              marginHorizontal: 4,
              opacity: activeIndex === i ? 1 : 0.6
            }}
            
          />
        ))}
      </View>
    </View>
  );
};