import { StyleSheet, Text, View } from 'react-native';
import MapContainer from '../../components/MapContainer';

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
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  eyebrow: {
    color: '#F43378',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: '#111827',
    fontSize: 34,
    fontWeight: '800',
  },
  copy: {
    marginTop: 10,
    color: '#4b5563',
    fontSize: 16,
  },
  mapPanel: {
    flex: 1,
    width: '100%',
    marginTop: 24,
    minHeight: 320,
  },
});
