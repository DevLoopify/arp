import { StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Start here</Text>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.copy}>Find new places, ideas, and inspiration.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
});
