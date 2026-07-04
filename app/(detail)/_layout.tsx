import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { Slot } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function DetailLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomBarButton} onPress={() => console.log('Route pressed!')}>
          <Ionicons name="navigate-outline" size={22} color={Colors.live} />
          <Text style={[styles.bottomBarLabel, { color: Colors.live }]}>Route</Text>
        </Pressable>
        <Pressable style={styles.bottomBarButton} onPress={() => console.log('Review pressed!')}>
          <Ionicons name="chatbubble-outline" size={22} color={Colors.primary} />
          <Text style={styles.bottomBarLabel}>Review</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
  },
  bottomBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  bottomBarLabel: {
    ...Typography.navLabel,
    color: Colors.primary,
  },
});
