import { CustomWorkplacesProvider } from '@/context/CustomWorkplacesContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <FavouritesProvider>
      <CustomWorkplacesProvider>
        <Stack screenOptions={{ headerShown: false }}
        initialRouteName="login">
        </Stack>
      </CustomWorkplacesProvider>
    </FavouritesProvider>
  );
}
