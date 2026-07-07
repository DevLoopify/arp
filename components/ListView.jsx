import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { useFilters } from '@/context/FiltersContext';
import { useWorkplaces } from '@/context/WorkplacesContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { applyFilters } from '../utils/applyFilters';
import { getDistanceKm } from '../utils/geo';
import WorkplaceCard from './WorplaceCard';

const SPIN_STEPS = 12;
const SPIN_MIN_DELAY = 45;
const SPIN_MAX_DELAY = 260;
const MAX_BLUR_INTENSITY = 35;

function delayForStep(step, steps) {
  const t = step / steps;
  return SPIN_MIN_DELAY + (SPIN_MAX_DELAY - SPIN_MIN_DELAY) * t * t;
}

const ListView = ({ userLocation, selectedWorkplaceId, onSelectWorkplace }) => {
  const sheetRef = useRef(null);
  const scrollRef = useRef(null);
  const spinTimeoutRef = useRef(null);
  const itemLayoutsRef = useRef({});
  const { workplaces } = useWorkplaces();
  const { filters } = useFilters();
  const [highlightedId, setHighlightedId] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [blurIntensity, setBlurIntensity] = useState(0);

  const snapPoints = useMemo(() => ["25%", "50%", "100%"], []);

  const filteredWorkplaces = useMemo(
    () => applyFilters(workplaces, filters, userLocation),
    [workplaces, filters, userLocation]
  );

  const sortedWorkplaces = useMemo(() => {
    const list = userLocation
      ? [...filteredWorkplaces].sort(
          (a, b) => getDistanceKm(userLocation, a) - getDistanceKm(userLocation, b)
        )
      : filteredWorkplaces;

    if (selectedWorkplaceId == null) return list;

    const selected = list.find((workplace) => workplace.id === selectedWorkplaceId);
    if (!selected) return list;

    return [selected, ...list.filter((workplace) => workplace.id !== selectedWorkplaceId)];
  }, [filteredWorkplaces, userLocation, selectedWorkplaceId]);

  useEffect(() => {
    if (selectedWorkplaceId != null) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [selectedWorkplaceId]);

  useEffect(() => {
    return () => clearTimeout(spinTimeoutRef.current);
  }, []);

  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);

  const handleItemLayout = useCallback((id, event) => {
    itemLayoutsRef.current[id] = event.nativeEvent.layout.y;
  }, []);

  const handleRandomPick = () => {
    const total = sortedWorkplaces.length;
    if (isSpinning || total === 0) return;

    if (total === 1) {
      onSelectWorkplace?.(sortedWorkplaces[0].id);
      return;
    }

    setIsSpinning(true);

  
    const finalIndex = Math.floor(Math.random() * total);
    const steps = Math.min(SPIN_STEPS, finalIndex + 1);
    let step = 0;

    const runStep = () => {
      const index = steps === 1 ? finalIndex : Math.round((finalIndex * step) / (steps - 1));
      const candidate = sortedWorkplaces[index];
      setHighlightedId(candidate.id);
      setBlurIntensity(Math.round(MAX_BLUR_INTENSITY * (1 - step / steps)));

      const y = itemLayoutsRef.current[candidate.id];
      if (y != null) {
        scrollRef.current?.scrollTo({ y, animated: true });
      }

      step += 1;
      if (step < steps) {
        spinTimeoutRef.current = setTimeout(runStep, delayForStep(step, steps));
      } else {
        setBlurIntensity(0);
        onSelectWorkplace?.(candidate.id);
        setIsSpinning(false);
      }
    };

    runStep();
  };

  const renderItem = useCallback(
    (workplace) => (
      <View key={workplace.id} onLayout={(event) => handleItemLayout(workplace.id, event)}>
        <WorkplaceCard
          workplace={workplace}
          userLocation={userLocation}
          highlighted={workplace.id === highlightedId}
        />
      </View>
    ),
    [userLocation, highlightedId, handleItemLayout]
  );
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <View style={styles.header}>
          <Pressable
            style={[styles.randomButton, filteredWorkplaces.length === 0 && styles.randomButtonDisabled]}
            onPress={handleRandomPick}
            disabled={isSpinning || filteredWorkplaces.length === 0}
            hitSlop={8}
          >
            <Ionicons name="dice-outline" size={20} color={Colors.textWhite} />
          </Pressable>
        </View>
        <View style={styles.listWrapper}>
          <BottomSheetScrollView ref={scrollRef} contentContainerStyle={styles.contentContainer}>
            {sortedWorkplaces.length > 0 ? (
              sortedWorkplaces.map(renderItem)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptyCopy}>Try adjusting or resetting your filters.</Text>
              </View>
            )}
          </BottomSheetScrollView>
          {blurIntensity > 0 && (
            <BlurView
              intensity={blurIntensity}
              tint="light"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          )}
        </View>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  randomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  randomButtonDisabled: {
    opacity: 0.4,
  },
  listWrapper: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: "white",
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyCopy: {
    ...Typography.caption,
    marginTop: 6,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

export default ListView;
