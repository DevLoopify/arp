import { Tabs } from 'expo-router';

import NavBar from '@/components/NavBar';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={styles.container}>
          
    <Tabs
      initialRouteName="explore"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <NavBar {...props} />}
    >
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="favourite" options={{ title: 'Favourite' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
