import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { useFilters } from '@/context/FiltersContext';
import { useWorkplaces } from '@/context/WorkplacesContext';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { applyFilters } from '../utils/applyFilters';
import { getDistanceKm } from '../utils/geo';
import WorkplaceCard from './WorplaceCard';

const ListView = ({
  userLocation,
  selectedWorkplaceId,
  onSelectWorkplace,
  onSheetIndexChange,
}) => {
  const sheetRef = useRef(null);
  const scrollRef = useRef(null);

  const { workplaces } = useWorkplaces();
  const { filters } = useFilters();

  const snapPoints = useMemo(() => ['25%', '50%', '100%'], []);

  const filteredWorkplaces = useMemo(
    () => applyFilters(workplaces, filters, userLocation),
    [workplaces, filters, userLocation]
  );

  const sortedWorkplaces = useMemo(() => {
    const list = userLocation
      ? [...filteredWorkplaces].sort(
          (a, b) =>
            getDistanceKm(userLocation, a) -
            getDistanceKm(userLocation, b)
        )
      : filteredWorkplaces;

    if (selectedWorkplaceId == null) {
      return list;
    }

    const selected = list.find(
      (workplace) => workplace.id === selectedWorkplaceId
    );

    if (!selected) {
      return list;
    }

    return [
      selected,
      ...list.filter(
        (workplace) => workplace.id !== selectedWorkplaceId
      ),
    ];
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
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <BottomSheetScrollView
          ref={scrollRef}
          contentContainerStyle={styles.contentContainer}
        >
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