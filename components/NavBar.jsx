import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_DETAILS = {
  explore: {
    label: 'Explore',
    icon: 'search-outline',
    activeIcon: 'search',
  },
  favourite: {
    label: 'Favourite',
    icon: 'heart-outline',
    activeIcon: 'heart',
  },
  profile: {
    label: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
};

export default function NavBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const options = descriptors[route.key]?.options ?? {};
        const details = TAB_DETAILS[route.name] ?? {
          label: options.title ?? route.name,
          icon: 'ellipse-outline',
          activeIcon: 'ellipse',
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.item}
          >
            <Ionicons
              name={isFocused ? details.activeIcon : details.icon}
              size={24}
              color={isFocused ? '#F43378' : '#6b7280'}
            />
            <Text style={[styles.label, isFocused && styles.activeLabel]}>{details.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d1d5db',
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  item: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  activeLabel: {
    color: '#F43378',
  },
});
