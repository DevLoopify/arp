import ListView from '@/components/ListView';
import Colors from '@/constants/Colors';
import { StyleSheet, View } from 'react-native';
import MapContainer from '../../components/MapContainer';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mapPanel}>
        <MapContainer isFullScreen={true} />
        <View style={styles.listViewOverlay}>
          <ListView />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundBase,
  },
  mapPanel: {
    flex: 1,
    width: '100%',
    minHeight: 320,
    marginTop: 12,
  },
  listViewOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
});