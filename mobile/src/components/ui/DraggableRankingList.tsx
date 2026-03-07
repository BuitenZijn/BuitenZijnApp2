import React, { useCallback, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";

const ITEM_HEIGHT = 56;
const ITEM_MARGIN = 6;
const TOTAL_HEIGHT = ITEM_HEIGHT + ITEM_MARGIN;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DraggableRankingListProps {
  items: string[];
  onReorder: (newItems: string[]) => void;
  disabled?: boolean;
}

interface DraggableItemProps {
  item: string;
  index: number;
  activeIndex: SharedValue<number>;
  itemCount: number;
  onDragEnd: (from: number, to: number) => void;
  disabled?: boolean;
}

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function DraggableItem({
  item,
  index,
  activeIndex,
  itemCount,
  onDragEnd,
  disabled,
}: DraggableItemProps) {
  const isActive = useSharedValue(false);
  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .activateAfterLongPress(150)
    .onStart(() => {
      isActive.value = true;
      activeIndex.value = index;
      startY.value = 0;
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      const movedPositions = Math.round(translateY.value / TOTAL_HEIGHT);
      const newIndex = clamp(index + movedPositions, 0, itemCount - 1);
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      isActive.value = false;
      activeIndex.value = -1;
      if (newIndex !== index) {
        runOnJS(onDragEnd)(index, newIndex);
      }
    })
    .onFinalize(() => {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      isActive.value = false;
      activeIndex.value = -1;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      zIndex: isActive.value ? 100 : 1,
      elevation: isActive.value ? 10 : 0,
      shadowOpacity: isActive.value ? 0.3 : 0,
      opacity: withTiming(isActive.value ? 0.95 : 1, { duration: 100 }),
      backgroundColor: isActive.value
        ? "rgba(155,89,182,0.35)"
        : "rgba(255,255,255,0.1)",
      borderColor: isActive.value ? "rgba(155,89,182,0.6)" : "transparent",
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.row, animatedStyle]}>
        <Text style={styles.grip}>☰</Text>
        <Text style={styles.index}>{index + 1}.</Text>
        <Text style={styles.itemText}>{item}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default function DraggableRankingList({
  items,
  onReorder,
  disabled = false,
}: DraggableRankingListProps) {
  const activeIndex = useSharedValue(-1);

  const handleDragEnd = useCallback(
    (from: number, to: number) => {
      const newItems = [...items];
      const [removed] = newItems.splice(from, 1);
      newItems.splice(to, 0, removed);
      onReorder(newItems);
    },
    [items, onReorder],
  );

  return (
    <View
      style={[styles.container, { minHeight: items.length * TOTAL_HEIGHT }]}
    >
      {items.map((item, i) => (
        <DraggableItem
          key={`${item}-${i}`}
          item={item}
          index={i}
          activeIndex={activeIndex}
          itemCount={items.length}
          onDragEnd={handleDragEnd}
          disabled={disabled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: ITEM_HEIGHT,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: ITEM_MARGIN,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  grip: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 18,
    marginRight: 10,
    width: 24,
    textAlign: "center",
  },
  index: {
    color: "#f1c40f",
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
  },
  itemText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
