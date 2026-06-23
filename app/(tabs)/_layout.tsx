import { Tabs } from 'expo-router';

import NavBar from '@/components/NavBar';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="explore"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NavBar {...props} />}
    >
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="favourite" options={{ title: 'Favourite' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
