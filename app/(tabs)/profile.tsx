import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.copy}>Your account details will live here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    padding: 24,
  },
  title: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '800',
  },
  copy: {
    marginTop: 10,
    color: '#4b5563',
    fontSize: 16,
    textAlign: 'center',
  },
});
