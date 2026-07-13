import { StyleSheet, Text, View } from 'react-native';

export default function MapContainer({ isFullScreen }) {
  return (
    <View style={[styles.container, { height: isFullScreen ? '100%' : '65%' }]}>
      <Text style={styles.text}>Map view is not available on web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e5e5',
  },
  text: {
    color: '#666',
  },
});
