
import colors from '@/constants/Colors';
import typography from '@/constants/Typography';
import { StyleSheet, Text, View } from 'react-native';
import SelectionChip from './SelectionChip';


interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  isActive?: boolean;
}


interface FeaturesFilterProps {
  selectedFeatures: string[];
  onFeatureToggle: (feature: string) => void;
}

const FEATURE_LIST  = ['WAN', 'Energy', 'Coffee', 'Printer', 'Meeting Room', 'Quiet Area', 'Food', 'Parking', 'Accessibility', 'Outdoor Seating'];

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
        justifyContent: 'space-between', // Verteilt die zwei Chips links und rechts
    gap: 3,                         // Abstand zwischen den Chips
    },

    button:{
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingVertical: 12,  
      backgroundColor: colors.textWhite,
      borderColor: colors.primary,
      borderWidth: 2,
    },

    buttonActive: {
      backgroundColor: colors.primary,
    },

    text:{
        ...typography.button,
        color: colors.textWhite,
    },

    textActive: {
      color: colors.primary,
    },

  


    

    noiseLevelContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        marginTop: 8,
    },
    noiseLevelButton: {
    padding: 10,
    backgroundColor: 'typography.',
    borderRadius: 5,    
  },

});