import React, { createContext, useContext, useRef, useState } from "react";
import { View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const { width } = Dimensions.get("window");

// Mínimo que el usuario debe arrastrar hacia adelante para contar como "quiere avanzar"
const ARRASTRE_MINIMO = 20;

// Cada página puede saber si es la que se está viendo (lo usa la animación de arriba)
const TutorialPageContext = createContext({ isActive: true });
export const useTutorialPage = () => useContext(TutorialPageContext);

interface TutorialPagerProps {
  children: React.ReactNode;
  paginasConBloqueo?: { [indice: number]: () => Promise<boolean> };
}

export const TutorialPager = ({ children, paginasConBloqueo = {} }: TutorialPagerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef         = useRef<ScrollView>(null);
  const activeIndexRef    = useRef(0);
  const procesandoRef     = useRef(false);
  const intentoAvanceRef  = useRef(0);
  const paginasAprobadas  = useRef<Set<number>>(new Set());

  const pages = React.Children.toArray(children);
  const ultimaPagina = pages.length - 1;

  // Una página está bloqueada si tiene verificación y todavía no la pasó
  const estaBloqueada = (index: number) =>
    !!paginasConBloqueo[index] && !paginasAprobadas.current.has(index);

  // Última página a la que se puede llegar desde la actual sin pasar un bloqueo
  const indiceMaximo = () => {
    let i = activeIndexRef.current;
    while (i < ultimaPagina && !estaBloqueada(i)) i++;
    return i;
  };

  const goToIndex = (index: number) => {
    const destino = Math.max(0, Math.min(index, ultimaPagina));
    scrollRef.current?.scrollTo({ x: destino * width, animated: true });
    activeIndexRef.current = destino;
    setActiveIndex(destino);
  };

  // Mientras el usuario arrastra: si intenta pasar una página bloqueada, el scroll
  // se queda pegado en esa página (no se desliza a la siguiente y regresa)
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const maximo = indiceMaximo();
    const limite = maximo * width;

    if (x > limite + 1) {
      if (maximo === activeIndexRef.current) {
        intentoAvanceRef.current = Math.max(intentoAvanceRef.current, x - limite);
      }
      scrollRef.current?.scrollTo({ x: limite, animated: false });
    }
  };

  const handleScrollBeginDrag = () => {
    intentoAvanceRef.current = 0;
  };

  // Al soltar el dedo: si quería avanzar y la página está bloqueada, corre la verificación
  const handleScrollEndDrag = async () => {
    const actual = activeIndexRef.current;
    const quiereAvanzar = intentoAvanceRef.current > ARRASTRE_MINIMO;
    intentoAvanceRef.current = 0;

    if (!quiereAvanzar || procesandoRef.current || !estaBloqueada(actual)) return;

    procesandoRef.current = true;
    try {
      const puedePasar = await paginasConBloqueo[actual]();
      if (puedePasar) {
        paginasAprobadas.current.add(actual);
        goToIndex(actual + 1);
      }
    } finally {
      procesandoRef.current = false;
    }
  };

  // Al terminar de deslizar: actualiza la página activa (nunca más allá de un bloqueo)
  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    const permitido = Math.min(index, indiceMaximo());
    if (permitido !== activeIndexRef.current) {
      activeIndexRef.current = permitido;
      setActiveIndex(permitido);
    }
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
          <TutorialPageContext.Provider key={index} value={{ isActive: activeIndex === index }}>
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