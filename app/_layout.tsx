import { AuthProvider } from '@/context/AuthContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { FiltersProvider } from '@/context/FiltersContext';
import { SearchLocationProvider } from '@/context/SearchLocationContext';
import { WorkplacesProvider } from '@/context/WorkplacesContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkplacesProvider>
        <FavouritesProvider>
          <FiltersProvider>
            <SearchLocationProvider>
              <Stack screenOptions={{ headerShown: false }}
              initialRouteName="login">
              </Stack>
            </SearchLocationProvider>
          </FiltersProvider>
        </FavouritesProvider>
      </WorkplacesProvider>
    </AuthProvider>
  );
}
