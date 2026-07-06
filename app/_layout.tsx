import { CustomWorkplacesProvider } from '@/context/CustomWorkplacesContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <FavouritesProvider>
      <CustomWorkplacesProvider>
        <UserProfileProvider>
          <Stack screenOptions={{ headerShown: false }}
          initialRouteName="login">
          </Stack>
        </UserProfileProvider>
      </CustomWorkplacesProvider>
    </FavouritesProvider>
  );
}
