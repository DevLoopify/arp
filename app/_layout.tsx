import NotificationBanner from '@/components/NotificationBanner';
import { AuthProvider } from '@/context/AuthContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { FiltersProvider } from '@/context/FiltersContext';
import { SearchLocationProvider } from '@/context/SearchLocationContext';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { WorkplacesProvider } from '@/context/WorkplacesContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkplacesProvider>
        <FavouritesProvider>
          <UserProfileProvider>
            <FiltersProvider>
              <SearchLocationProvider>
                <Stack screenOptions={{ headerShown: false }}
                initialRouteName="login">
                </Stack>
                <NotificationBanner />
              </SearchLocationProvider>
            </FiltersProvider>
          </UserProfileProvider>
        </FavouritesProvider>
      </WorkplacesProvider>
    </AuthProvider>
  );
}
