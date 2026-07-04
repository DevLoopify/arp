import WorkplaceCard from '@/components/WorplaceCard';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { useFavourites } from '@/context/FavouritesContext';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import workplacesData from '../../data/worplaces.json';

const { workplaces } = workplacesData;

export default function FavouriteScreen() {
  const { favouriteIds } = useFavourites();
  const favouriteWorkplaces = workplaces.filter((workplace) => favouriteIds.has(workplace.id));

  if (favouriteWorkplaces.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.title}>Favourite</Text>
        <Text style={styles.copy}>Tap the heart on a workplace to save it here.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
      {favouriteWorkplaces.map((workplace) => (
        <WorkplaceCard key={workplace.id} workplace={workplace} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
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
  listContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundBase,
  },
  listContent: {
    padding: 16,
  },
});
