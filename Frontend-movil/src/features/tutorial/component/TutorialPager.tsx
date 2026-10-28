import React, { createContext, useContext, useRef, useState } from "react";
import { View, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from "react-native";

const { width } = Dimensions.get("window");

// Minimum the user must drag forward to count as "wants to advance"
const MIN_DRAG = 20;

// Each page can know whether it is the visible one (used by the animation above)
// and ask to go to the next one from a button (it goes through the same lock as swiping)
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

  // A page is locked if it has a check and has not passed it yet
  const isLocked = (index: number) =>
    !!lockedPages[index] && !approvedPages.current.has(index);

  // Last page reachable from the current one without passing a lock
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

  // The active page comes from the real position. When the scroll is stopped with scrollTo, Android sometimes does not
  // report the end of the swipe: the page got out of sync and no longer let her advance.
  const sync = (x: number) => {
    const index = Math.min(Math.round(x / width), maxIndex());
    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      setActiveIndex(index);
    }
  };

  // While the user drags: if she tries to pass a locked page, the scroll
  // sticks on that page (it does not slide to the next one and come back)
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

  // Goes to the next page; if the current one is locked, its check runs first
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

  // When the finger is lifted: if she wanted to advance and the page is locked, the check runs
  const handleScrollEndDrag = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const wantsToAdvance = advanceAttemptRef.current > MIN_DRAG;
    advanceAttemptRef.current = 0;
    if (wantsToAdvance) sync(event.nativeEvent.contentOffset.x);
    if (wantsToAdvance && isLocked(activeIndexRef.current)) await advance();
  };

  // When the swipe ends: update the active page (never beyond a lock)
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