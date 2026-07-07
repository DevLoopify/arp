import { useFilters } from '@/context/FiltersContext';
import { useWorkplaces } from '@/context/WorkplacesContext';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { applyFilters } from '../utils/applyFilters';

const fallbackRegion = {
  latitude: 49.8726,
  longitude: 8.6527,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const METERS_PER_DEGREE_LAT = 111320;
const CIRCLE_PADDING_FACTOR = 1.8; // keeps the circle comfortably inside the viewport

function regionForRadius(latitude, longitude, radiusMeters) {
  const span = radiusMeters * 2 * CIRCLE_PADDING_FACTOR;
  const latitudeDelta = span / METERS_PER_DEGREE_LAT;
  const longitudeDelta = span / (METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180));
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

// Shifts the map's center southward so the point renders higher up on screen,
// in the middle of whatever portion isn't covered by an overlay (e.g. a bottom sheet).
function applyCenterOffset(region, centerOffsetRatio) {
  if (!centerOffsetRatio) return region;
  return { ...region, latitude: region.latitude - region.latitudeDelta * centerOffsetRatio };
}

export default function MapContainer({
  isFullScreen,
  userLocation,
  permissionGranted,
  radius = null,
  onMarkerPress,
  centerOffsetRatio = 0,
}) {
  const mapRef = useRef(null);
  const { workplaces } = useWorkplaces();
  const { filters } = useFilters();
  const filteredWorkplaces = useMemo(
    () => applyFilters(workplaces, filters, userLocation),
    [workplaces, filters, userLocation]
  );
  const center = userLocation ?? fallbackRegion;

  const initialRegion = applyCenterOffset(
    radius
      ? regionForRadius(center.latitude, center.longitude, radius)
      : {
          ...center,
          latitudeDelta: fallbackRegion.latitudeDelta,
          longitudeDelta: fallbackRegion.longitudeDelta,
        },
    centerOffsetRatio
  );

  useEffect(() => {
    if (!radius) return;
    mapRef.current?.animateToRegion(
      applyCenterOffset(regionForRadius(center.latitude, center.longitude, radius), centerOffsetRatio),
      300
    );
  }, [radius, center.latitude, center.longitude, centerOffsetRatio]);

  return (
    <View style={{ height: isFullScreen ? '100%' : '65%' }}>
      <MapView
        ref={mapRef}
        key={`${center.latitude}-${center.longitude}`}
        style={styles.map}
        mapType="standard"
        userInterfaceStyle="light"
        initialRegion={initialRegion}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={permissionGranted}
      >
        {filteredWorkplaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.title}
            description={place.description}
            onPress={() => onMarkerPress?.(place.id)}
          />
        ))}
        {radius && (
          <Circle
            center={{ latitude: center.latitude, longitude: center.longitude }}
            radius={radius}
            strokeColor="#1E88E5"
            strokeWidth={2}
            fillColor="rgba(30, 136, 229, 0.15)"
          />
        )}
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
