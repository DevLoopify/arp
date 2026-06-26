import { StyleSheet, View } from 'react-native';
import SelectionChip from './SelectionChip';

interface FeaturesFilterProps {
  selectedFeatures: string[];
  onFeatureToggle: (feature: string) => void;
}

const FEATURE_LIST = ['WAN', 'Energy', 'Coffee', 'Printer', 'Meeting Room', 'Quiet Area', 'Food', 'Parking', 'Accessibility', 'Outdoor Seating'];

export default function FeaturesFilter({ selectedFeatures, onFeatureToggle }: FeaturesFilterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.chipsContainer}>
        {FEATURE_LIST.map((feature) => (
          <SelectionChip
            key={feature}
            text={feature}
            icon={feature.toLowerCase()}
            selected={selectedFeatures.includes(feature)}
            onPress={() => onFeatureToggle(feature)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
});