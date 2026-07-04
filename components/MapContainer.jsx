import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import workplacesData from '../data/worplaces.json';

const { initialRegion: fallbackRegion, workplaces } = workplacesData;

export default function MapContainer({ isFullScreen, userLocation, permissionGranted }) {
  const region = userLocation
    ? {
        ...userLocation,
        latitudeDelta: fallbackRegion.latitudeDelta,
        longitudeDelta: fallbackRegion.longitudeDelta,
      }
    : fallbackRegion;

  return (
    <View style={{ height: isFullScreen ? '100%' : '65%' }}>
      <MapView
        key={`${region.latitude}-${region.longitude}`}
        style={styles.map}
        mapType="standard"
        userInterfaceStyle="light"
        initialRegion={region}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={permissionGranted}
      >
        {workplaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.title}
            description={place.description}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    display: 'flex',
    flex: 1,
  },
});
