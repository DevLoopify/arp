import ListView from '@/components/ListView';
import Colors from '@/constants/Colors';
import { useSearchLocation } from '@/context/SearchLocationContext';
import useCurrentLocation from '@/hooks/useCurrentLocation';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapContainer from '../../components/MapContainer';

export default function ExploreScreen() {
  const { location: gpsLocation, permissionGranted } = useCurrentLocation();
  const { searchLocation } = useSearchLocation();
  const userLocation = searchLocation ?? gpsLocation;
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.mapPanel}>
        <MapContainer
          isFullScreen={true}
          userLocation={userLocation}
          permissionGranted={permissionGranted}
          onMarkerPress={setSelectedWorkplaceId}
        />
        <View style={styles.listViewOverlay}>
          <ListView userLocation={userLocation} selectedWorkplaceId={selectedWorkplaceId} />
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