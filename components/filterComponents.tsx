import typography from '@/constants/Typography';
import { FEATURE_LIST } from '@/constants/filters';
import { StyleSheet, Text, View } from 'react-native';
import SelectionChip from './SelectionChip';

interface FeaturesFilterProps {
  selectedFeatures: string[];
  onFeatureToggle: (feature: string) => void;
}

export default function FeaturesFilter({ selectedFeatures, onFeatureToggle }: FeaturesFilterProps) {
  return (
    <View style={styles.container}>
      <Text style={typography.caption}>Utilites </Text>
      <View style={styles.chipsContainer}>
       {FEATURE_LIST.map((feature) => (
          <SelectionChip
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
        justifyContent: 'space-between',
        gap: 3,
    },
});