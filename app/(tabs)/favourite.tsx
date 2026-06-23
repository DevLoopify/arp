import { StyleSheet, Text, View } from 'react-native';

export default function FavouriteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favourite</Text>
      <Text style={styles.copy}>Saved items will show up here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff7ed',
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
