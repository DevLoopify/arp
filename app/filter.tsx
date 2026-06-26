

import ToggleButton from '@/components/ToggleButton';
import FeaturesFilter from '@/components/UtilityFilter';
import typography from '@/constants/Typography';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


 export default function FilterScreen() {
    const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
  return (<SafeAreaView style={styles.container}> 
  <Text style={[typography.sectionTitle]}>Work Mode</Text>
  <ToggleButton 
  inactiveText="👤 Solo Work" 
  activeText="👥 Group Work" 
  style={{ width: '90%', marginTop: 20 }} 
  activeColor="#2563EB" // Optional deine Wunschfarbe
/>
    <Text style={[typography.sectionTitle, { marginTop: 20 }]}>Utilities</Text>
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