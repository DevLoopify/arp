import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import workplacesData from '../data/worplaces.json';
import { getDistanceKm } from '../utils/geo';
import WorkplaceCard from './WorplaceCard';

const { workplaces } = workplacesData;

const ListView = ({ userLocation, selectedWorkplaceId }) => {
  const sheetRef = useRef(null);
  const scrollRef = useRef(null);

  const snapPoints = useMemo(() => ["25%", "50%", "100%"], []);

  const sortedWorkplaces = useMemo(() => {
    const list = userLocation
      ? [...workplaces].sort(
          (a, b) => getDistanceKm(userLocation, a) - getDistanceKm(userLocation, b)
        )
      : workplaces;

    if (selectedWorkplaceId == null) return list;

    const selected = list.find((workplace) => workplace.id === selectedWorkplaceId);
    if (!selected) return list;

    return [selected, ...list.filter((workplace) => workplace.id !== selectedWorkplaceId)];
  }, [userLocation, selectedWorkplaceId]);

  useEffect(() => {
    if (selectedWorkplaceId != null) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [selectedWorkplaceId]);

  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);

  const renderItem = useCallback(
    (workplace) => <WorkplaceCard key={workplace.id} workplace={workplace} userLocation={userLocation} />,
    [userLocation]
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
        <BottomSheetScrollView ref={scrollRef} contentContainerStyle={styles.contentContainer}>
          {sortedWorkplaces.map(renderItem)}
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: "white",
    padding: 12,
  },
});

export default ListView;