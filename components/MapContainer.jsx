import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

export default function MapContainer({isFullScreen
}) {
  return (
    <View style={{height: isFullScreen ? '100%' : '50%'}}>
      <MapView style={styles.map}>
        
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
