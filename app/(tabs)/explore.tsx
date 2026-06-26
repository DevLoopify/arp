import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import MapContainer from '../../components/MapContainer';
import PrimaryButton from '../../components/PrimaryButton';

const darmstadtRegion = {
  latitude: 49.8728,
  longitude: 8.6512,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const darmstadtMarkers = [
  {
    id: 'darmstadt-center',
    title: 'Darmstadt',
    description: 'Innenstadt',
    coordinate: {
      latitude: 49.8728,
      longitude: 8.6512,
    },
  },
  {
    id: 'tu-darmstadt',
    title: 'TU Darmstadt',
    description: 'Campus Stadtmitte',
    coordinate: {
      latitude: 49.8748,
      longitude: 8.6566,
    },
  },
];

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <PrimaryButton label="Filter" onPress={() => router.push('/filter')} />
      </View>
      <Text style={styles.eyebrow}>Start here</Text>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.copy}>Find new places, ideas, and inspiration.</Text>
      <View style={styles.mapPanel}>
        <MapContainer initialRegion={darmstadtRegion} markers={darmstadtMarkers} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundBase,
    padding: 24,
  },
  eyebrow: {
    ...Typography.eyebrow,
    color: Colors.accent,
  },
  title: {
    ...Typography.sectionTitle,
    marginTop: 8,
    color: Colors.textPrimary,
  },
  copy: {
    ...Typography.body,
    marginTop: 10,
    color: Colors.textSecondary,
  },
  mapPanel: {
    flex: 1,
    width: '100%',
    marginTop: 24,
    minHeight: 320,
  },
  filterContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 1,
  },
});
