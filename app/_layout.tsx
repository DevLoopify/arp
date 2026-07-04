import { FavouritesProvider } from '@/context/FavouritesContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <FavouritesProvider>
      <Stack screenOptions={{ headerShown: false }}
      initialRouteName="login">
      </Stack>
    </FavouritesProvider>
  );
}
