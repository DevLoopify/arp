import Colors from '@/constants/Colors';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface NoiseSelectorProps {
  selectedLevel: 'quiet' | 'average' | 'noisy' | null;
  onLevelChange: (level: 'quiet' | 'average' | 'noisy' | null) => void;
}

const NOISE_LEVELS: Array<'quiet' | 'average' | 'noisy'> = ['quiet', 'average', 'noisy'];

export default function NoiseSelector({ selectedLevel, onLevelChange }: NoiseSelectorProps) {
  return (
    <View style={styles.row}>
      {NOISE_LEVELS.map((level) => {
        const isSelected = selectedLevel === level;
        return (
          <TouchableOpacity
            key={level}
            activeOpacity={0.8}
            style={[styles.button, isSelected && styles.buttonSelected]}
            onPress={() => onLevelChange(level)}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    width: '100%' as const,
    height: 44,
    backgroundColor: Colors.backgroundWhite,
    gap: 8,
  },
  button: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: Colors.textMuted,
    borderRadius: 8,
    backgroundColor: Colors.backgroundWhite,
  },
  buttonSelected: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  label: {
    color: '#000',
    fontWeight: '600' as const,
  },
  labelSelected: {
    color: '#fff',
  },
};