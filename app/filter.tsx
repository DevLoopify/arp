
import FeaturesFilter from '@/components/UtilityFilter';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


 export default function FilterScreen() {
    const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
  return (<SafeAreaView style={styles.container}> 
    <FeaturesFilter
      selectedFeatures={selectedFeatures}
     onFeatureToggle={(feature) => {
  setSelectedFeatures((prev) => {
    if (prev.includes(feature)) {
      return prev.filter((item) => item !== feature);
    } else {
      return [...prev, feature];
    }
  });
}}
      />
    </SafeAreaView>
  );


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  testText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  
});