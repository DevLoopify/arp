import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { useFilters } from '@/context/FiltersContext';
import { useRoulette } from '@/context/RouletteContext';
import { useWorkplaces } from '@/context/WorkplacesContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { applyFilters } from '../utils/applyFilters';
import { getDistanceKm } from '../utils/geo';
import RouletteWheel from './RouletteWheel';
import WorkplaceCard from './WorplaceCard';

const ListView = ({
  userLocation,
  selectedWorkplaceId,
  onSelectWorkplace,
  onSheetIndexChange,
}) => {
  const scrollRef = useRef(null);

  const { workplaces } = useWorkplaces();
  const { filters } = useFilters();
  const { rouletteIds } = useRoulette();
  const [wheelVisible, setWheelVisible] = useState(false);

  const rouletteWorkplaces = useMemo(
    () => workplaces.filter((workplace) => rouletteIds.has(workplace.id)),
    [workplaces, rouletteIds]
  );

  const snapPoints = useMemo(() => ['25%', '50%', '100%'], []);

  const filteredWorkplaces = useMemo(
    () => applyFilters(workplaces, filters, userLocation),
    [workplaces, filters, userLocation]
  );

  const sortedWorkplaces = useMemo(() => {
    let list = filteredWorkplaces;

    if (userLocation) {
      list = [...filteredWorkplaces].sort(
        (a, b) => getDistanceKm(userLocation, a) - getDistanceKm(userLocation, b)
      );
    }

    const noWorkplaceSelected = selectedWorkplaceId == null;
    if (noWorkplaceSelected) {
      return list;
    }

    const selectedWorkplace = list.find(
      (workplace) => workplace.id === selectedWorkplaceId
    );

    if (!selectedWorkplace) {
      return list;
    }

    const remainingWorkplaces = list.filter(
      (workplace) => workplace.id !== selectedWorkplaceId
    );

    return [selectedWorkplace, ...remainingWorkplaces];
  }, [filteredWorkplaces, userLocation, selectedWorkplaceId]);

  useEffect(() => {
    if (selectedWorkplaceId != null) {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }
  }, [selectedWorkplaceId]);

  const handleSheetChange = useCallback(
    (index) => {
      onSheetIndexChange?.(index);
    },
    [onSheetIndexChange]
  );

  const handleWorkplacePress = useCallback(
    (workplaceId) => {
      onSelectWorkplace?.(workplaceId);
    },
    [onSelectWorkplace]
  );

  return (
    <View style={styles.container}>
      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <BottomSheetScrollView
          ref={scrollRef}
          contentContainerStyle={styles.contentContainer}
          stickyHeaderIndices={[0]}
        >
          <View style={styles.rouletteBarSticky}>
            <Pressable
              style={styles.rouletteBarButton}
              onPress={() => setWheelVisible(true)}
            >
              <Ionicons name="dice" size={18} color={Colors.textWhite} />
              <Text style={styles.rouletteBarText}>
                Spin the Wheel{rouletteWorkplaces.length > 0 ? ` (${rouletteWorkplaces.length})` : ''}
              </Text>
            </Pressable>
          </View>

          {sortedWorkplaces.length > 0 ? (
            sortedWorkplaces.map((workplace) => (
              <WorkplaceCard
                key={workplace.id}
                workplace={workplace}
                userLocation={userLocation}
                onPress={() => handleWorkplacePress(workplace.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No results found</Text>

              <Text style={styles.emptyCopy}>
                Try adjusting or resetting your filters.
              </Text>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      <RouletteWheel
        visible={wheelVisible}
        onClose={() => setWheelVisible(false)}
        workplaces={rouletteWorkplaces}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: 'white',
    padding: 12,
  },
  rouletteBarSticky: {
    backgroundColor: 'white',
    paddingBottom: 16,
  },
  rouletteBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  rouletteBarText: {
    ...Typography.button,
    color: Colors.textWhite,
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