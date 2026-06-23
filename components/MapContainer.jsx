import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const fallbackRegion = {
  latitude: 52.52,
  longitude: 13.405,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function MapContainer({
  initialRegion = fallbackRegion,
  markers = [],
  userInterfaceStyle = 'light',
}) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        userInterfaceStyle={userInterfaceStyle}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
          />
        ))}
      </MapView>r
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
