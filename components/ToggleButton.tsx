import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface ToggleButtonProps {
  activeText?: string;  
  inactiveText?: string; 
  activeColor?: string;
  style?: ViewStyle;     
}

export default function ToggleButton({ 
  activeText, 
  inactiveText, 
  activeColor = '#2563EB', 
  style 
}: ToggleButtonProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <Pressable 
      style={[
        styles.track, 
        style, 
        isActive && { backgroundColor: activeColor }
      ]} 
      onPress={() => setIsActive(!isActive)}
    >

      <View style={[styles.contentFlow, isActive ? { flexDirection: 'row' } : { flexDirection: 'row-reverse' }]}>
        
        <View style={styles.knob} />
        
        {(activeText || inactiveText) && (
          <Text style={[styles.text, isActive ? styles.textActive : styles.textInactive]}>
            {isActive ? activeText : inactiveText}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 44, 
    borderRadius: 22,
    backgroundColor: '#E0E0E0',
    padding: 4,
    justifyContent: 'center',
  },
  contentFlow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingHorizontal: 8,
  },
  knob: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  textActive: {
    color: '#FFFFFF',
  },
  textInactive: {
    color: '#374151',
  },
});