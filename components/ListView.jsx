import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import workplacesData from '../data/worplaces.json';
import WorkplaceCard from './WorplaceCard';

const { workplaces } = workplacesData;

const ListView = ({ userLocation }) => {
  const sheetRef = useRef(null);

  const snapPoints = useMemo(() => ["25%", "50%", "100%"], []);

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
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          {workplaces.map(renderItem)}
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