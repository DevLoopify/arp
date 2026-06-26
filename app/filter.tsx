import NoiseSelector from '@/components/NoiseSelector';
import ToggleButton from '@/components/ToggleButton';
import FeaturesFilter from '@/components/UtilityFilter';
import typography from '@/constants/Typography';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FilterScreen() {
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>([]);
  const [noiseLevel, setNoiseLevel] = React.useState<'quiet' | 'average' | 'noisy' | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={typography.sectionTitle}>Work Mode</Text>
      <NoiseSelector selectedLevel={noiseLevel} onLevelChange={setNoiseLevel} />

      <ToggleButton
        inactiveText="👤 Solo Work"
        activeText="👥 Group Work"
        style={{ width: '90%', marginTop: 20 }}
        activeColor="#2563EB"
      />

      <Text style={[typography.sectionTitle, styles.sectionTitleSpacing]}>Utilities</Text>
      <FeaturesFilter
        selectedFeatures={selectedFeatures}
        onFeatureToggle={(feature) => {
          setSelectedFeatures((prev) =>
            prev.includes(feature) ? prev.filter((item) => item !== feature) : [...prev, feature]
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitleSpacing: {
    marginTop: 20,
  },
});