import FilterPopup from '@/components/FilterPopup';
import IconButton from '@/components/IconButton';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { useState } from 'react';

export default function TabLayout() {
  const [filterVisible, setFilterVisible] = useState(false);

  return (
    <>
      <Tabs
        initialRouteName="explore"
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitleStyle: Typography.screenTitle,
          headerStyle: { backgroundColor: Colors.backgroundBase },
          headerShadowVisible: false,
          headerRightContainerStyle: { paddingRight: 16 },
          headerLeftContainerStyle: { paddingLeft: 16 },
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.backgroundWhite,
            borderTopColor: '#d1d5db',
          },
          tabBarLabelStyle: Typography.navLabel,
        }}
      >
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
            ),
            headerLeft: () => (
              <IconButton
                icon={<Ionicons name="add" size={24} />}
                clickHandler={() => router.push('/create_workspace')}
              />
            ),
            headerRight: () => (
              <IconButton
                icon={<Ionicons name="options" size={24} />}
                clickHandler={() => setFilterVisible(true)}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="favourite"
          options={{
            title: 'Favourite',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <FilterPopup visible={filterVisible} onClose={() => setFilterVisible(false)} />
    </>
  );
}