import { StyleSheet, Text, View } from 'react-native';


export default function FilterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.testText}>Der Filter-Screen funktioniert!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  testText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
});