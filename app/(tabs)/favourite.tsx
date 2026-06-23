import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

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
    backgroundColor: Colors.backgroundWarm,
    padding: 24,
  },
  title: {
    ...Typography.screenTitle,
    color: Colors.textPrimary,
  },
  copy: {
    ...Typography.body,
    marginTop: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
