import { AuthProvider } from '@/context/AuthContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { WorkplacesProvider } from '@/context/WorkplacesContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <WorkplacesProvider>
        <FavouritesProvider>
          <Stack screenOptions={{ headerShown: false }}
          initialRouteName="login">
          </Stack>
        </FavouritesProvider>
      </WorkplacesProvider>
    </AuthProvider>
  );
}
