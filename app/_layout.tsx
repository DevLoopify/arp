import NotificationBanner from '@/components/NotificationBanner';
import { AuthProvider } from '@/context/AuthContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { FiltersProvider } from '@/context/FiltersContext';
import { SearchLocationProvider } from '@/context/SearchLocationContext';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { WorkplacesProvider } from '@/context/WorkplacesContext';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
