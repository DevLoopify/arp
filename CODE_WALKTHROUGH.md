# arp — Full Code Walkthrough

This document exists so you can understand every part of this project as if you had written it yourself — the React Native/Expo frontend, the Go backend, and the server it runs on. It goes file by file, in the order you'd naturally build things, pasting the real code and explaining what it does and *why* it's written that way.

There are three parts:

1. **Frontend** (`app/`, `components/`, `context/`, `utils/`, `constants/`, `hooks/`) — the Expo/React Native mobile app.
2. **Backend** (`backend/`) — the Go REST API and Postgres database.
3. **Deployment** (`docker-compose.yml`, the server, Caddy, DNS) — how it's actually hosted at `https://arp.syntraq.de`.

---

# Part 1 — Frontend

## 1.1 How routing works: Expo Router and file-based navigation

This app uses **Expo Router**, which turns your file structure inside `app/` directly into your navigation structure — a bit like how Next.js turns `pages/` into routes. You don't write a big switch statement of routes anywhere; the folder/file names *are* the routes.

```
app/
  index.tsx           -> "/"
  login.tsx           -> "/login"
  register.tsx        -> "/register"
  create_workspace.tsx-> "/create_workspace"
  _layout.tsx          (wraps the whole app)
  (tabs)/
    _layout.tsx         (defines the bottom tab bar)
    explore.tsx        -> "/(tabs)/explore"
    favourite.tsx      -> "/(tabs)/favourite"
    profile.tsx        -> "/(tabs)/profile"
  (detail)/
    _layout.tsx         (wraps detail + review with a bottom action bar)
    detail.tsx         -> "/(detail)/detail"
    review.tsx         -> "/(detail)/review"
```

Folders in parentheses like `(tabs)` and `(detail)` are **route groups** — they organize files and let you attach a shared `_layout.tsx`, but the parentheses themselves don't show up in the URL.

### `app/index.tsx` — the entry point

```tsx
import { Redirect } from 'expo-router';

export default function StartScreen() {
  return <Redirect href={'/login'} />;
}
```

When the app launches, Expo Router loads whatever `app/index.tsx` exports as the root route. Here it does nothing but immediately redirect to `/login`. This is a common pattern: keep `index.tsx` a "traffic director" instead of putting real screen logic at the root.

### `app/_layout.tsx` — the root layout and global providers

Every screen in the app is a descendant of this file. This is where **React Context Providers** get mounted, because Context has to wrap everything that wants to read from it.

```tsx
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
```

Why this exact nesting order matters: **`AuthProvider` is outermost** because both `WorkplacesProvider` and `FavouritesProvider` need to read the current login token (`useAuth()` inside them) — a child can read from any provider above it in the tree, never below. `WorkplacesProvider` sits above `FavouritesProvider` mostly for readability; they don't actually depend on each other.

`<Stack screenOptions={{ headerShown: false }}>` sets up a stack navigator (screens push/pop like a call stack) with no default header bar — each screen builds its own header where needed (see the tab layout below, which turns headers back on just for the tabs). `initialRouteName="login"` means the app always starts on the login screen, matching the `index.tsx` redirect above.

### `app/(tabs)/_layout.tsx` — the bottom tab bar

This is "first we create a navbar, therefore we edit `_layout.tsx`" — this file *is* the navbar.

```tsx
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
```

`<Tabs>` is Expo Router's built-in bottom-tab navigator. Each `<Tabs.Screen name="explore">` maps to `app/(tabs)/explore.tsx` **by filename** — that's the whole wiring, you never import the screen components directly here.

The `tabBarIcon` render prop gets called by the navigator with `{ focused, color, size }` so the icon can swap between filled/outline (`search` vs `search-outline`) depending on whether that tab is active, and automatically inherit the right color/size for the current platform.

The `headerLeft`/`headerRight` on the `explore` tab are how the "+" (create workspace) and filter-options buttons end up in the top bar — they're just custom components slotted into the header, only for that one screen.

Notice `FilterPopup` is rendered *outside* `<Tabs>` but *inside* the fragment (`<>...</>`) returned by this layout. That's deliberate: a `Modal`-based popup needs to render on top of everything, including the tab bar, so it can't live inside a specific tab screen — it lives at the tab-layout level instead, and its `visible`/`onClose` state is owned by this component and passed as props (this is the standard React pattern of ["lifting state up"](https://react.dev/learn/sharing-state-between-components) — the state has to live in the nearest common ancestor of everything that needs it).

### `app/(detail)/_layout.tsx` — the bottom action bar for detail/review

```tsx
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { Slot, router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function DetailLayout() {
  const { workplace } = useLocalSearchParams<{ workplace: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomBarButton} onPress={() => console.log('Route pressed!')}>
          <Ionicons name="navigate-outline" size={22} color={Colors.live} />
          <Text style={[styles.bottomBarLabel, { color: Colors.live }]}>Route</Text>
        </Pressable>
        <Pressable
          style={styles.bottomBarButton}
          onPress={() =>
            router.push({ pathname: '/review', params: { workplace: workplace ?? '' } })
          }
        >
          <Ionicons name="chatbubble-outline" size={22} color={Colors.primary} />
          <Text style={styles.bottomBarLabel}>Review</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

`<Slot />` is the "whatever child route is currently active, render it here" placeholder for a plain (non-tab, non-stack) layout — it's how `detail.tsx` and `review.tsx` both get this same bottom bar wrapped around them without duplicating the bar's JSX in both files.

`useLocalSearchParams<{ workplace: string }>()` reads the URL params passed to *this* route. Since the whole workplace object is passed around the app as a JSON string in the `workplace` param (see below), this layout grabs it and forwards it unchanged to the Review button, so tapping "Review" carries the workplace data along to `/review`.

The "Route" button is a stub (`console.log`) — turn-by-turn directions were never actually implemented, just scaffolded.

---

## 1.2 Passing data between screens: the `workplace` JSON-string param pattern

You'll see this a lot: `params: { workplace: JSON.stringify(workplace) }` and `JSON.parse(workplace)` on the other end. Expo Router (like most router libraries) only supports **string** route params — you can't push an object directly. So the convention here is: serialize the whole workplace object to a JSON string when navigating, and parse it back out on the receiving screen. It's simple and avoids a global "currently selected workplace" store, at the cost of re-fetching (`review.tsx` re-fetches fresh workplace data from the API after submitting, rather than trusting the possibly-stale param — see 1.2 below).

---

## 1.3 Auth screens

### `app/login.tsx`

```tsx
import React, { useState } from 'react';
import { Alert, View, Text } from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import TextButton from '@/components/TextButton';
import { Link, router } from 'expo-router';
import authStyles from '@/constants/authStyles';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/utils/api';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        setIsSubmitting(true);
        try {
            await login(email, password);
            router.replace('/(tabs)/explore');
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Could not reach the server.';
            Alert.alert('Login failed', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={authStyles.container}>
            <Text style={authStyles.title}>ARP</Text>
            <Text style={authStyles.subtitle}>
            Log in to your account and start finding the perfect place to work.
            </Text>

            <View style={[authStyles.form, { marginTop: 64 }]}>
                <InputField
                    label="E-Mail"
                    value={email}
                    onChangeText={setEmail}
                    secureTextEntry={false}
                    keyboardType="email-address"
                />
                <InputField
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    keyboardType="default"
                />
                <TextButton
                    label="Forgot password?"
                    onPress={() => console.log('Forgot password pressed!')}
                    textStyle={authStyles.textButton}
                />
                <View style={{ marginTop: 36 }}>
                    <PrimaryButton
                        label={isSubmitting ? 'Logging in...' : 'Log In'}
                        onPress={handleLogin}
                    />
                </View>

                <View style={authStyles.registerRow}>
                    <Text style={authStyles.registerHint}>Don't have an account yet? </Text>
                    <Link href="/register" style={authStyles.registerLink}>
                        Create One
                    </Link>
                </View>
            </View>
        </View>
    );
}
```

This is a **controlled form**: `email`/`password` are React state, and every `InputField` is wired via `value` + `onChangeText` so React always knows the current text (rather than reading the native text input imperatively).

`handleLogin` is `async` because `login(...)` (from `useAuth()`, see 1.7) makes a real network call and we need to `await` its result before deciding what to do next. `isSubmitting` exists purely for UX — it disables/relabels the button while the request is in flight so a double-tap can't fire two login requests.

The `try/catch` distinguishes two failure modes: `ApiError` (defined in `utils/api.ts`) means *the server responded, but said no* (e.g. "invalid email or password") — so we show its actual message. Anything else (a thrown `TypeError: Network request failed`, for instance) means *the request never reached the server at all* — DNS failure, no internet, server down — so we show a generic "Could not reach the server."

On success, `router.replace('/(tabs)/explore')` — **replace**, not `push` — swaps the login screen out of the navigation stack entirely, so pressing the hardware/gesture back button from `explore` doesn't take the user back to the login screen.

### `app/register.tsx`

Nearly identical structure, with one extra guard:

```tsx
const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
        Alert.alert('Passwords do not match', 'Please make sure both passwords are the same.');
        return;
    }
    setIsSubmitting(true);
    try {
        await register(name, email, password);
        router.replace('/(tabs)/explore');
    } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not reach the server.';
        Alert.alert('Registration failed', message);
    } finally {
        setIsSubmitting(false);
    }
};
```

The password-confirmation check happens **before** touching the network at all — no reason to make an API call for a mistake we can catch instantly on-device. Everything else mirrors login: `register()` (also from `useAuth()`) hits the backend, stores the returned token, and on success the user lands straight in the app — registration doubles as login, there's no separate "please log in after registering" step.

---

## 1.4 The Explore tab: map + list

### `app/(tabs)/explore.tsx`

```tsx
import ListView from '@/components/ListView';
import Colors from '@/constants/Colors';
import useCurrentLocation from '@/hooks/useCurrentLocation';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapContainer from '../../components/MapContainer';

export default function ExploreScreen() {
  const { location: userLocation, permissionGranted } = useCurrentLocation();
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.mapPanel}>
        <MapContainer
          isFullScreen={true}
          userLocation={userLocation}
          permissionGranted={permissionGranted}
          onMarkerPress={setSelectedWorkplaceId}
        />
        <View style={styles.listViewOverlay}>
          <ListView userLocation={userLocation} selectedWorkplaceId={selectedWorkplaceId} />
        </View>
      </View>
    </View>
  );
}
```

This screen itself is thin on purpose — it just wires two children together and owns the one piece of state they both need to share: `selectedWorkplaceId`. Tapping a map pin (`onMarkerPress`) sets it; `ListView` receives it so it can scroll that workplace's card to the top. Neither `MapContainer` nor `ListView` know about each other directly — they're coordinated through their shared parent, which is the standard React way to let sibling components communicate.

`ListView` is absolutely positioned (`listViewOverlay` — `position: 'absolute'`, filling the whole map panel) so it can float as a bottom sheet *on top of* the map rather than pushing it up.

### `components/MapContainer.jsx`

```jsx
import { useWorkplaces } from '@/context/WorkplacesContext';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

const fallbackRegion = {
  latitude: 49.8726,
  longitude: 8.6527,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const METERS_PER_DEGREE_LAT = 111320;
const CIRCLE_PADDING_FACTOR = 1.8; // keeps the circle comfortably inside the viewport

function regionForRadius(latitude, longitude, radiusMeters) {
  const span = radiusMeters * 2 * CIRCLE_PADDING_FACTOR;
  const latitudeDelta = span / METERS_PER_DEGREE_LAT;
  const longitudeDelta = span / (METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180));
  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

export default function MapContainer({ isFullScreen, userLocation, permissionGranted, radius = null, onMarkerPress }) {
  const mapRef = useRef(null);
  const { workplaces } = useWorkplaces();
  const center = userLocation ?? fallbackRegion;

  const initialRegion = radius
    ? regionForRadius(center.latitude, center.longitude, radius)
    : {
        ...center,
        latitudeDelta: fallbackRegion.latitudeDelta,
        longitudeDelta: fallbackRegion.longitudeDelta,
      };

  useEffect(() => {
    if (!radius) return;
    mapRef.current?.animateToRegion(regionForRadius(center.latitude, center.longitude, radius), 300);
  }, [radius, center.latitude, center.longitude]);

  return (
    <View style={{ height: isFullScreen ? '100%' : '65%' }}>
      <MapView
        ref={mapRef}
        key={`${center.latitude}-${center.longitude}`}
        style={styles.map}
        mapType="standard"
        userInterfaceStyle="light"
        initialRegion={initialRegion}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={permissionGranted}
      >
        {workplaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.title}
            description={place.description}
            onPress={() => onMarkerPress?.(place.id)}
          />
        ))}
        {radius && (
          <Circle
            center={{ latitude: center.latitude, longitude: center.longitude }}
            radius={radius}
            strokeColor="#1E88E5"
            strokeWidth={2}
            fillColor="rgba(30, 136, 229, 0.15)"
          />
        )}
      </MapView>
    </View>
  );
}
```

This component is reused in two very different places: full-screen in the Explore tab, and as a small preview map inside the radius-picker in `FilterPopup` (that's what `isFullScreen`/`radius` are for — same component, different mode).

`workplaces` used to come from merging a bundled static JSON file with a locally-stored list of "custom" workplaces. **That's gone now** — `useWorkplaces()` (from `context/WorkplacesContext.tsx`, section 1.7) pulls the live list straight from the backend API, and a workplace someone else created shows up here for everyone, not just on the device that created it.

`regionForRadius` is a bit of trigonometry: a MapView "region" is defined by lat/long deltas (essentially how zoomed in it is), not a plain radius in meters. Because degrees of longitude get physically narrower the further you are from the equator, the longitude delta has to be divided by `cos(latitude)` to still look like a circle on screen rather than an ellipse. `CIRCLE_PADDING_FACTOR = 1.8` just leaves some breathing room so the circle isn't touching the edges of the map view.

The `key={...center...}` on `<MapView>` is a deliberate React trick: changing a component's `key` forces React to unmount and remount it from scratch instead of just re-rendering. `initialRegion` (as the name suggests) is only read once, on mount — so without this, moving to a wildly different location wouldn't re-center the map. Re-mounting via `key` sidesteps that.

### `components/ListView.jsx`

```jsx
import { useWorkplaces } from '@/context/WorkplacesContext';
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDistanceKm } from '../utils/geo';
import WorkplaceCard from './WorplaceCard';

const ListView = ({ userLocation, selectedWorkplaceId }) => {
  const sheetRef = useRef(null);
  const scrollRef = useRef(null);
  const { workplaces } = useWorkplaces();

  const snapPoints = useMemo(() => ["25%", "50%", "100%"], []);

  const sortedWorkplaces = useMemo(() => {
    const list = userLocation
      ? [...workplaces].sort(
          (a, b) => getDistanceKm(userLocation, a) - getDistanceKm(userLocation, b)
        )
      : workplaces;

    if (selectedWorkplaceId == null) return list;

    const selected = list.find((workplace) => workplace.id === selectedWorkplaceId);
    if (!selected) return list;

    return [selected, ...list.filter((workplace) => workplace.id !== selectedWorkplaceId)];
  }, [workplaces, userLocation, selectedWorkplaceId]);

  useEffect(() => {
    if (selectedWorkplaceId != null) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [selectedWorkplaceId]);

  const handleSheetChange = useCallback((index) => {
    console.log("handleSheetChange", index);
  }, []);

  const renderItem = useCallback(
    (workplace) => <WorkplaceCard key={workplace.id} workplace={workplace} userLocation={userLocation} />,
    [userLocation]
  );
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onChange={handleSheetChange}
      >
        <BottomSheetScrollView ref={scrollRef} contentContainerStyle={styles.contentContainer}>
          {sortedWorkplaces.map(renderItem)}
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};
```

`<BottomSheet>` (from `@gorhom/bottom-sheet`) is the draggable panel that can be dragged to 25%, 50%, or 100% of the screen height (`snapPoints`) — `index={1}` starts it at the middle snap point (50%).

The sorting logic: if we know the user's location, sort every workplace by distance (`getDistanceKm`, section 1.8) — nearest first. Then, independently, if a specific workplace was just tapped on the map (`selectedWorkplaceId`), pull that one to the very front regardless of distance, so tapping a pin visibly surfaces its card. Both of these are wrapped in `useMemo` so the (mildly expensive) sort + distance calculation only re-runs when `workplaces`, `userLocation`, or the selection actually change — not on every render.

`GestureHandlerRootView` is required boilerplate — `react-native-gesture-handler` (which the bottom sheet's drag gestures depend on) needs exactly one of these somewhere near the root of anything that uses gestures.

### `components/WorplaceCard.jsx`

This is the card you see both in the list view and the Favourites tab.

```jsx
export default function WorkplaceCard({ workplace, width = screenWidth - 32, userLocation = null }) {
    const { title, description, images, rating, noise, crowdedness, utilities, latitude, longitude } = workplace;
    const resolvedImages = images.map(resolveImage).filter(Boolean);
    const crowdLevel = crowdLevels[crowdedness];
    const distanceLabel = userLocation
        ? formatDistance(getDistanceKm(userLocation, { latitude, longitude }))
        : null;

    return (
        <View style={[styles.card, { width }]}>
            <View>
                {resolvedImages.length > 0 ? (
                    <ImageCarousel images={resolvedImages} width={width} />
                ) : (
                    <View style={[styles.imagePlaceholder, { width }]}>
                        <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                    </View>
                )}
                <View style={styles.favouriteButtonPosition}>
                    <FavouriteButton workplaceId={workplace.id} />
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <View style={styles.titleTextGroup}>
                        <Link style={styles.title} numberOfLines={1} href={{pathname: '/(detail)/detail', params:{
                            workplace: JSON.stringify(workplace)
                        }}}>{title}</Link>
                        {distanceLabel && <Text style={styles.distance}>({distanceLabel})</Text>}
                    </View>
                    <View style={workplaceMetaStyles.metaItem}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={workplaceMetaStyles.metaText}>{rating.toFixed(1)}</Text>
                    </View>
                </View>
                <Text style={styles.description} numberOfLines={2}>{description}</Text>

                {utilities?.length > 0 && (
                    <View style={[workplaceMetaStyles.utilities, styles.utilitiesSpacing]}>
                        {utilities.map((utility) => (
                            <View key={utility} style={workplaceMetaStyles.chip}>
                                <Ionicons name={getUtilityIcon(utility)} size={12} color={Colors.textWhite} />
                                <Text style={workplaceMetaStyles.chipText}>{utility}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.metaRow}>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                    <View style={workplaceMetaStyles.liveBox}>
                        <View style={workplaceMetaStyles.metaItem}>
                            <Ionicons name="volume-medium-outline" size={16} color={Colors.textMuted} />
                            <Text style={workplaceMetaStyles.metaText}>{noise}/5</Text>
                        </View>
                        {crowdLevel && (
                            <View style={workplaceMetaStyles.metaItem}>
                                <Ionicons name={crowdLevel.icon} size={16} color={crowdLevel.color} />
                                <Text style={[workplaceMetaStyles.metaText, { color: crowdLevel.color }]}>{crowdLevel.label}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}
```

`images.map(resolveImage).filter(Boolean)` turns raw image path strings into something React Native's `<Image>` can actually render — see `resolveImage` in section 1.8, which is also where the fix for backend-hosted image URLs lives.

`<Link href={{ pathname: '/(detail)/detail', params: { workplace: JSON.stringify(workplace) } }}>` is Expo Router's declarative navigation — tapping the title text navigates to the detail screen, carrying the whole workplace object along as a stringified param (see the pattern explained in 1.2).

`FavouriteButton` is dropped in with just a `workplaceId` — the card itself holds no favourite state; that's entirely `FavouritesContext`'s job (section 1.7), which is what lets the same button work identically here, in the detail screen, wherever.

---

## 1.5 Detail and Review screens

### `app/(detail)/detail.tsx`

```tsx
export default function DetailScreen(){
    const { workplace } = useLocalSearchParams<{ workplace: string }>();
    const parsedWorkplace = JSON.parse(workplace);
    const { rating, noise, crowdedness, reviews, utilities } = parsedWorkplace;
    const resolvedImages = parsedWorkplace.images.map(resolveImage).filter(Boolean);
    const crowdLevel = crowdLevels[crowdedness];
    const utilityRows = getUtilityRowsPerColumn(utilities?.length ?? 0);
    const utilitiesGridHeight = utilityRows * UTILITY_CHIP_HEIGHT + (utilityRows - 1) * UTILITY_CHIP_GAP;
    return(
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.imageContainer}>
                <ImageCarousel images={resolvedImages} width={screenWidth} height={screenHeight / 2} />
                ...
                <View style={styles.favouriteButtonPosition}>
                    <FavouriteButton workplaceId={parsedWorkplace.id} />
                </View>
            </View>
            ...
            <View style={styles.section}>
                <Text style={styles.sectionHeading}>Live Capacity</Text>
                <CrowdChart
                    average={parsedWorkplace.crowdByHourAverage}
                    today={parsedWorkplace.crowdByHourToday}
                    currentHour={new Date().getHours()}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionHeading}>Reviews</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewsRow}>
                    {reviews?.map((review) => (
                        <ReviewCard
                            key={review.id}
                            author={review.author}
                            rating={review.rating}
                            comment={review.comment}
                            date={review.date}
                            avatarUri={getAvatarUri(review.id)}
                        />
                    ))}
                </ScrollView>
            </View>
            ...
        </ScrollView>
    )
}
```

This screen just reads the `workplace` param and renders it — it doesn't call the API itself. It's the screen you land on right after tapping a card (where the param came straight from the already-loaded list), *and* the screen `review.tsx` redirects back to after submitting a review, in which case the param is a **freshly re-fetched** workplace object (see below) so the new review and updated average rating actually show up immediately.

`getUtilityRowsPerColumn` + the height math above it exist because the utilities grid uses `flexDirection: 'column'` with wrapping (so chips fill top-to-bottom then wrap into a new column, like a newspaper layout) — a `View` with `flexWrap` needs an explicit height to know when to wrap, so this pre-computes how tall the grid needs to be based on how many utility chips there are.

`getAvatarUri(review.id)` — there's no real user avatar system, so this generates a stable-looking placeholder avatar per review ID (see `utils/avatar.js`, section 1.8).

### `app/(detail)/review.tsx` — submitting a review

```tsx
import { useWorkplaces } from '@/context/WorkplacesContext';
import { api } from '@/utils/api';
...

export default function ReviewScreen() {
  const { workplace } = useLocalSearchParams<{ workplace: string }>();
  const parsedWorkplace = workplace ? JSON.parse(workplace) : null;
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addReview } = useWorkplaces();

  const handleSubmit = async () => {
    if (!parsedWorkplace) {
      router.back();
      return;
    }

    allowRemove.current = true;
    setIsSubmitting(true);
    try {
      await addReview(parsedWorkplace.id, { rating, comment });
      const updatedWorkplace = await api.workplaces.get(parsedWorkplace.id);
      router.replace({ pathname: '/(detail)/detail', params: { workplace: JSON.stringify(updatedWorkplace) } });
    } catch (err) {
      Alert.alert('Could not submit review', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  ...
```

This one changed meaningfully from how it originally worked. **Before**, this screen manually built a fake review object with a made-up `id` and appended it to a local copy of `parsedWorkplace.reviews`, recomputed the average rating client-side with plain arithmetic, and pushed that edited object straight back to the detail screen. It never actually persisted anywhere — reload the app, and the "new" review was gone.

**Now**: `addReview(...)` (from `WorkplacesContext`, section 1.7) does a real `POST /api/workplaces/{id}/reviews` — the review is saved in Postgres, permanently, visible to everyone. Right after that succeeds, it explicitly re-fetches the workplace with `api.workplaces.get(id)` rather than trying to patch the old object locally — this guarantees the `rating` shown on the following detail screen is exactly what the *server* computed (the backend averages all reviews itself; see Part 2), not a client-side approximation that could drift.

The still-present `confirmVisible` modal ("You've made changes... discard or save?") is unchanged — it's a plain local-state guard against navigating away with unsaved input, independent of the network logic.

---

## 1.6 Favourite, Profile, and Create Workspace screens

### `app/(tabs)/favourite.tsx`

```tsx
import { useFavourites } from '@/context/FavouritesContext';
import { useWorkplaces } from '@/context/WorkplacesContext';

export default function FavouriteScreen() {
  const { favouriteIds } = useFavourites();
  const { workplaces } = useWorkplaces();
  const favouriteWorkplaces = workplaces.filter((workplace) => favouriteIds.has(workplace.id));

  if (favouriteWorkplaces.length === 0) {
    return ( /* empty state */ );
  }

  return (
    <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
      {favouriteWorkplaces.map((workplace) => (
        <WorkplaceCard key={workplace.id} workplace={workplace} />
      ))}
    </ScrollView>
  );
}
```

Deliberately simple: it's the full workplace list (from the backend, via `useWorkplaces()`) filtered down to just the IDs the user has favourited (from `FavouritesContext`, which itself talks to the backend — section 1.7). There used to also be a `CustomWorkplacesContext` merged in here manually; that concept doesn't exist anymore because "custom" workplaces are now just regular workplaces that happen to have an owner, and the backend already returns them in the same list (more on this in Part 2).

### `app/(tabs)/profile.tsx`

Still the original placeholder — a title, a `ProfilePicture`, and static copy ("Your account details will live here"). Nothing here calls the backend yet; it's the obvious next screen to build out (show the logged-in user's name/email from `useAuth()`, add a log-out button).

### `app/create_workspace.tsx` — adding a new workplace

```tsx
import { useWorkplaces } from '@/context/WorkplacesContext';
...

export default function CreateWorkspace() {
    ...
    const { addWorkplace } = useWorkplaces();

    const pickPhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            const newUris = result.assets.map((asset) => asset.uri);
            setPhotoUris((prev) => [...(prev || []), ...newUris]);
        }
    };

    const handleAdd = async () => {
        const missing: string[] = [];
        if (!name.trim()) missing.push('a title');
        if (!description.trim()) missing.push('a description');
        if (!photoUris?.length) missing.push('at least one photo');
        if (!markerCoordinate) missing.push('a location');

        if (missing.length > 0) {
            setError(`Please add ${missing.join(', ')}.`);
            return;
        }
        setError(null);
        setIsSubmitting(true);
        try {
            await addWorkplace({
                name,
                description,
                utilities: selectedUtilities,
                location: markerCoordinate!,
                photoUris: photoUris ?? [],
            });
            router.back();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create the workplace.');
        } finally {
            setIsSubmitting(false);
        }
    };
    ...
```

The form itself (name/description text fields, a grid of tappable utility chips, a photo picker, a map you tap to drop a pin) hasn't changed. What changed is what happens on submit.

**Before**: `addWorkplace` (from the now-deleted `CustomWorkplacesContext`) copied the picked photos into the app's private on-device documents directory using `expo-file-system`, and wrote the new workplace as JSON into a file on-device. That meant a workplace you created only ever existed on *your* phone — nobody else's app would ever see it, and reinstalling the app would wipe it.

**Now**: `addWorkplace` (from `WorkplacesContext`, section 1.7) actually uploads each photo to the backend and creates a real row in the `workplaces` table, visible to every user of the app. The screen itself didn't need to know any of these plumbing details change — it still just calls `addWorkplace({ name, description, utilities, location, photoUris })` with the exact same shape of argument as before; only what happens inside that function changed. That's the point of putting this logic behind a Context in the first place: the screen is insulated from *how* a workplace gets persisted.

Client-side validation (the `missing` array) still happens before touching the network at all, same reasoning as the password-mismatch check in `register.tsx`.

---

## 1.7 Contexts: shared state across the whole app

React Context is how this app shares state (like "who's logged in" or "which workplaces exist") between screens that aren't directly nested inside each other, without manually passing props down through every layer ("prop drilling"). Each context here follows the same shape: a `Provider` component that owns the actual state, and a `useXyz()` hook that any descendant component calls to read/update it.

### `context/AuthContext.tsx`

```tsx
import { api, ApiError, User } from '@/utils/api';
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = 'arp_auth_token';

type AuthContextValue = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
            if (!storedToken) {
                setIsLoading(false);
                return;
            }
            try {
                const me = await api.auth.me(storedToken);
                setToken(storedToken);
                setUser(me);
            } catch (err) {
                if (err instanceof ApiError && err.status === 401) {
                    await SecureStore.deleteItemAsync(TOKEN_KEY);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { token: newToken, user: newUser } = await api.auth.login(email, password);
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
        setUser(newUser);
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const { token: newToken, user: newUser } = await api.auth.register(name, email, password);
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
        setUser(newUser);
    }, []);

    const logout = useCallback(async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, token, isLoading, login, register, logout }),
        [user, token, isLoading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
```

This is the most security-relevant file in the frontend, so worth understanding in full.

**Where the token lives**: `expo-secure-store`, not `AsyncStorage` or plain React state. `SecureStore` writes to the iOS Keychain / Android Keystore — encrypted, OS-managed storage — rather than a plaintext file, which matters because this token is effectively a password substitute (anyone with it can act as that user against the API).

**The mount-time effect** (`useEffect(..., [])`) implements "stay logged in across app restarts": on every fresh app launch, check if a token was saved from a previous session; if so, validate it against the backend (`api.auth.me`) rather than trusting it blindly, because a token could have expired (they're valid for 7 days server-side — see Part 2) or been invalidated. If the server says `401 Unauthorized`, the stale token is deleted so we don't keep retrying with garbage. `isLoading` exists so the rest of the app (or a future splash screen) can tell "we're still checking for a saved session" apart from "we checked, and nobody's logged in."

**`useCallback` around `login`/`register`/`logout`**: these functions get put into `value`, which every consumer of `useAuth()` re-renders on change of. Wrapping them in `useCallback` (with an empty dependency array, since they don't close over anything that changes) means their function identity stays stable across re-renders, so `useMemo`'s dependency check below doesn't think they've "changed" every time and needlessly rebuild `value` — a standard perf pattern once a Context is read by many components.

The exported `useAuth()` hook's null-check (`throw new Error(...)`) is a deliberate guardrail: it turns "I forgot to wrap this screen in `<AuthProvider>`" from a confusing `undefined.token` crash somewhere deep in a component into an immediate, clear error pointing at the actual mistake.

### `context/WorkplacesContext.tsx`

```tsx
import { useAuth } from '@/context/AuthContext';
import { api, Review, Workplace } from '@/utils/api';
...

export type NewWorkplaceEntry = {
    name: string;
    description: string;
    utilities: string[];
    location: { latitude: number; longitude: number };
    photoUris: string[];
};

export function WorkplacesProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        const list = await api.workplaces.list();
        setWorkplaces(list);
    }, []);

    useEffect(() => {
        refresh().finally(() => setIsLoading(false));
    }, [refresh]);

    const addWorkplace = useCallback(
        async (entry: NewWorkplaceEntry) => {
            if (!token) throw new Error('You must be logged in to add a workplace.');

            const uploaded = await Promise.all(entry.photoUris.map((uri) => api.uploads.upload(token, uri)));

            const workplace = await api.workplaces.create(token, {
                title: entry.name,
                description: entry.description,
                latitude: entry.location.latitude,
                longitude: entry.location.longitude,
                utilities: entry.utilities,
                images: uploaded.map((u) => u.url),
            });

            await refresh();
            return workplace;
        },
        [token, refresh]
    );

    const addReview = useCallback(
        async (workplaceId: number, payload: { rating: number; comment: string }) => {
            if (!token) throw new Error('You must be logged in to add a review.');
            const review = await api.reviews.create(token, workplaceId, payload);
            await refresh();
            return review;
        },
        [token, refresh]
    );
    ...
```

This context replaced **two** older things at once: the static, bundled `data/worplaces.json` file that every screen used to import directly, and `CustomWorkplacesContext`, which stored user-created workplaces in a JSON file on-device via `expo-file-system`. Both are gone. There is exactly one source of truth now: whatever the backend's `GET /api/workplaces` returns, held in this context's `workplaces` state, fetched once on mount (`useEffect(..., [refresh])`) and re-fetched (`refresh()`) after any mutation.

That "re-fetch the whole list after any change" approach (rather than optimistically patching the local `workplaces` array in JS) is a deliberate simplicity trade-off: with a small dataset like this it's cheap, and it guarantees the client's view always matches exactly what the server computed (e.g. the recalculated average `rating` after a new review) instead of trying to keep two copies of the truth in sync by hand.

`addWorkplace` does two network calls in sequence, on purpose in this order: first upload every photo (`Promise.all` runs them concurrently rather than one-by-one, since they don't depend on each other), *then* create the workplace row referencing the resulting image URLs — the workplace can't be created with image URLs that don't exist yet. Both `addWorkplace` and `addReview` guard on `if (!token) throw ...` at the very top, because both correspond to backend endpoints that require authentication (Part 2) — better to fail immediately with a clear message than let a doomed unauthenticated request go out over the network.

### `context/FavouritesContext.tsx`

```tsx
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';

export function FavouritesProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [favouriteIds, setFavouriteIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!token) {
            setFavouriteIds(new Set());
            return;
        }
        api.favourites.list(token).then((ids) => setFavouriteIds(new Set(ids)));
    }, [token]);

    const toggleFavourite = useCallback(
        (id: number) => {
            if (!token) return;

            setFavouriteIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                    api.favourites.remove(token, id).catch(() => setFavouriteIds((cur) => new Set(cur).add(id)));
                } else {
                    next.add(id);
                    api.favourites.add(token, id).catch(() =>
                        setFavouriteIds((cur) => {
                            const reverted = new Set(cur);
                            reverted.delete(id);
                            return reverted;
                        })
                    );
                }
                return next;
            });
        },
        [token]
    );

    const isFavourite = useCallback((id: number) => favouriteIds.has(id), [favouriteIds]);
    ...
```

Two things worth calling out here.

First, `favouriteIds` is a JS `Set<number>`, not an array. `isFavourite(id)` gets called once per workplace card, every render, potentially for a long list — `Set.has()` is O(1) versus an array's `.includes()` being O(n), and it also naturally de-duplicates.

Second, and more interesting: `toggleFavourite` is **optimistic**. It updates local state immediately (flipping the heart icon instantly, no waiting for a network round-trip) and fires the actual `api.favourites.add`/`remove` call in the background. If that background call fails, the `.catch(...)` handler reverts the local state back — so the UI briefly shows the "wrong" state only if the request genuinely failed, which is rare, and the user gets instant feedback the other 99% of the time. This is a common pattern for low-stakes, easily-reversible actions like a favourite toggle (versus, say, submitting a review, which waits for the server before showing anything, because there's real content being created that shouldn't silently vanish on failure).

The public interface (`favouriteIds`, `isFavourite`, `toggleFavourite`) is **identical** to what this context looked like when favourites were purely `useState` with no backend at all — meaning `FavouriteButton` and every screen using `useFavourites()` needed zero changes when this got wired to the real API. That's the whole value of hiding persistence behind a hook: callers don't care where the data actually lives.

---

## 1.8 Utilities

### `utils/api.ts` — the one place that knows how to talk to the backend

```ts
import Constants from 'expo-constants';

export const API_URL: string = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:8080/api';

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function request<T>(path: string, options: RequestInit & { token?: string } = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    const res = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: {
            ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    });

    if (!res.ok) {
        let message = res.statusText;
        try {
            const body = await res.json();
            message = body.error ?? message;
        } catch {
            // response wasn't JSON; fall back to statusText
        }
        throw new ApiError(res.status, message);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}
```

`API_URL` comes from `Constants.expoConfig?.extra?.apiUrl` — which is set in `app.json` (`expo.extra.apiUrl`, currently `"https://arp.syntraq.de/api"`). This is Expo's mechanism for baking a config value into the app that isn't a secret (unlike, say, `JWT_SECRET`, which lives only on the server and never ships to the client) but does need to be different between, say, a local dev build and production — it's read from the app's config/manifest at runtime rather than hardcoded. The `?? 'http://localhost:8080/api'` fallback only matters if that config value somehow isn't present.

> **A real bug this caused, worth remembering:** Expo's Fast Refresh (the "save a file, see it update instantly" hot-reload) only re-runs your JS — it does **not** re-fetch the native app config/manifest that `Constants.expoConfig` is read from. After first adding `extra.apiUrl` to `app.json`, the already-running app kept its *old* manifest snapshot in memory and silently fell through to the `localhost:8080` fallback, meaning it happily talked to a backend running on the laptop instead of the real server — no error, no warning, it just worked against the wrong target. A registered user showed up nowhere on the production server until a **full app reload** (not a Fast Refresh) forced the manifest to be re-read. Moral: if a change to `app.json`/`expo.extra`/config plugins doesn't seem to be taking effect, reload the whole app, don't just save-and-hope.

`request<T>` is a small generic wrapper around `fetch` shared by every API call in this file, so none of the individual endpoint functions below have to repeat: attaching `Content-Type: application/json` only when there's actually a body, attaching `Authorization: Bearer <token>` only when a token was passed in, checking `res.ok` and turning a non-2xx response into a thrown `ApiError` (carrying the HTTP status and the server's own error message when it sent one as JSON), and handling `204 No Content` responses (used by the favourite add/remove endpoints, which return nothing) without trying to `.json()` parse an empty body.

```ts
export const api = {
    auth: {
        register: (name: string, email: string, password: string) => ...,
        login: (email: string, password: string) => ...,
        me: (token: string) => request<User>('/auth/me', { token }),
    },
    workplaces: {
        list: () => request<Workplace[]>('/workplaces'),
        get: (id: number) => request<Workplace>(`/workplaces/${id}`),
        create: (token: string, payload: {...}) => ...,
    },
    reviews: { create: (token, workplaceId, payload) => ... },
    favourites: {
        list: (token: string) => request<number[]>('/favourites', { token }),
        add: (token: string, workplaceId: number) => request<void>(`/favourites/${workplaceId}`, { method: 'POST', token }),
        remove: (token: string, workplaceId: number) => request<void>(`/favourites/${workplaceId}`, { method: 'DELETE', token }),
    },
    uploads: {
        upload: async (token: string, fileUri: string): Promise<{ url: string }> => {
            const filename = fileUri.split('/').pop() ?? 'photo.jpg';
            const ext = (/\.(\w+)$/.exec(filename)?.[1] ?? 'jpg').toLowerCase();
            const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

            const form = new FormData();
            form.append('image', { uri: fileUri, name: filename, type: mimeType } as unknown as Blob);

            const res = await fetch(`${API_URL}/uploads`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
            if (!res.ok) throw new ApiError(res.status, 'upload failed');
            return res.json();
        },
    },
};
```

Everything is namespaced (`api.auth.login`, `api.workplaces.list`, ...) purely for readability at the call site.

`uploads.upload` can't go through the shared `request()` helper, because file uploads use `multipart/form-data`, not JSON — you build a `FormData` object instead of calling `JSON.stringify`, and critically you must **not** manually set a `Content-Type` header yourself; `fetch` sets it (including the required random multipart boundary string) automatically when the body is a `FormData`, which is why this function only sets the `Authorization` header and lets `fetch` figure out the rest. The `{ uri, name, type }` object shape for the appended file is a React-Native-specific convention `fetch` understands, even though it isn't a real spec-compliant `Blob` (hence the `as unknown as Blob` cast to satisfy TypeScript).

Also exported from this file:

```ts
export function resolveApiUrl(path: string): string {
    if (/^https?:\/\//.test(path)) return path;
    return `${API_URL.replace(/\/api\/?$/, '')}${path}`;
}
```

The backend's upload endpoint returns paths like `/uploads/xyz.jpg` — relative to the server, not a full URL. `resolveApiUrl` turns that into `https://arp.syntraq.de/uploads/xyz.jpg` by stripping the `/api` suffix off the configured API base and prepending it to the path (React Native's `<Image>` component needs a real absolute URL, it can't resolve a relative path the way a browser would).

### `utils/resolveImage.js`

```js
const imageMap = {
    'Unknown.jpg': require('../assets/images/Unknown.jpg'),
    ...
};

import { resolveApiUrl } from './api';

export function resolveImage(path) {
    const filename = path.split('/').pop();
    if (imageMap[filename]) return imageMap[filename];
    return { uri: resolveApiUrl(path) };
}
```

There are two completely different kinds of image reference in this app, and this function is what unifies them for `<Image source={...}>`. The five/six seeded demo workplaces reference a handful of photos that are bundled *inside the app itself* (`assets/images/...`) — those have to be loaded via a literal `require(...)` call (Metro, the bundler, statically resolves `require` paths at build time; you cannot compute a dynamic `require` string, hence the hardcoded lookup table). Any image uploaded through the app, on the other hand, lives on the server and needs a real network URL. `resolveImage` checks the bundled-asset map first by filename; if it's not one of the known bundled images, it falls back to treating the path as a server-relative upload path and resolves it to a full URL via `resolveApiUrl`.

### `utils/geo.js`

```js
function toRad(deg) {
    return (deg * Math.PI) / 180;
}

export function getDistanceKm(from, to) {
    const R = 6371;
    const dLat = toRad(to.latitude - from.latitude);
    const dLon = toRad(to.longitude - from.longitude);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)} m away`;
    }
    return `${km.toFixed(1)} km away`;
}
```

`getDistanceKm` is the standard [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula) for great-circle distance between two lat/long points on a sphere — straight-line "as the crow flies" distance, not walking/driving distance, but plenty good enough for sorting a list by "roughly how far away is this." `R = 6371` is Earth's mean radius in kilometers, which is why the function's output unit is kilometers. `formatDistance` just picks a friendlier unit/precision depending on magnitude (meters under 1km, one decimal of km otherwise).

### `utils/avatar.js`

```js
export function getAvatarUri(seed) {
    const imageId = (Math.abs(seed) % 70) + 1;
    return `https://i.pravatar.cc/150?img=${imageId}`;
}
```

[pravatar.cc](https://pravatar.cc) is a free service that serves stable placeholder headshot photos by numeric ID (1 through 70). `Math.abs(seed) % 70 + 1` deterministically maps any review ID onto one of those 70 images — the same review always gets the same fake avatar, without needing real user photos or any backend support for avatars at all.

### `utils/crowdChartMath.js`

```js
export const levelOrder = ['empty', 'slightly_crowded', 'medium_full', 'very_crowded'];

export const CHART_HEIGHT = 100;
export const TOP_PADDING = 10;

function levelY(level) {
    const value = levelOrder.indexOf(level) / (levelOrder.length - 1);
    return TOP_PADDING + (1 - value) * (CHART_HEIGHT - TOP_PADDING);
}

export function linePath(levels, width, totalHours) {
    return levels
        .map((level, hour) => {
            const x = (hour / (totalHours - 1)) * width;
            const y = levelY(level);
            return `${hour === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
}

export function areaPath(levels, width, totalHours) {
    return `${linePath(levels, width, totalHours)} L ${width} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;
}
```

This is what turns an array of 24 crowd-level strings (like `["empty", "empty", ..., "very_crowded", ...]`, one per hour) into an SVG path string for `components/CrowdChart.jsx` — there's no charting library involved, it's hand-rolled SVG.

`levelY` maps a discrete category (`'empty'` through `'very_crowded'`) onto a Y pixel coordinate: find its index in the ordered list, normalize to a 0–1 fraction, then flip it (`1 - value`) because SVG's Y axis grows *downward* while "more crowded" should plot *higher* on the chart, and finally scale into the actual pixel height of the chart.

`linePath` builds an [SVG path `d` attribute](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths) by hand: `M x y` ("move to", starts the path) for the first hour, then `L x y` ("line to") for every subsequent hour, spacing them evenly across the given pixel `width`. `areaPath` reuses that same line, then adds two more points to close the shape down to the bottom corners and back — turning an open line into a filled region (used for the softly-shaded "average" band under the line in the chart).

---

## 1.9 Small reusable components

These are worth a quick pass since several other files reference them:

- **`components/IconButton.jsx`** — the simplest possible wrapper: a `<Pressable>` around whatever icon element you pass in, plus a click handler. Used for header buttons (the "+" and filter icons in the tab bar) and the back button on the detail screen.
- **`components/PrimaryButton.tsx`** / **`components/TextButton.jsx`** — the two button "levels" used everywhere: `PrimaryButton` is the solid filled call-to-action button (Log In, Create Account, Submit Review, Add); `TextButton` is a plain tappable text link with no background (Forgot password?).
- **`components/InputField.jsx`** — a styled wrapper around React Native's `<TextInput>`, always `autoCapitalize="none" autoCorrect={false}` (sensible defaults for emails/passwords, less so for free-text names/descriptions, but kept uniform for simplicity).
- **`components/SelectionChip.jsx`** — the pill-shaped toggle button used for utility selection in both the filter popup and the create-workspace form; purely presentational, `selected` and `onPress` are owned by whoever renders it.
- **`components/ImageCarousel.jsx`** — a horizontally-paging `FlatList` of images with little dots underneath tracking the current page (`onScroll` computes which "page" you've scrolled to by dividing the scroll offset by the carousel's width).
- **`components/StarRating.tsx`** — five tappable star icons; can work read-only (just pass `rating`) or interactive (pass `onRatingChange`, used by the review-submission screen).
- **`components/ReviewCard.jsx`** — a single review's display card: avatar (via `getAvatarUri`), star rating, author, date, comment text.
- **`components/CrowdChart.jsx`** — renders the SVG built by `crowdChartMath.js` (see 1.8), plus an invisible row of tappable per-hour zones overlaid on top (`touchRow`/`touchCell`) so tapping anywhere along the chart shows that specific hour's crowd level as text underneath.
- **`components/ProfilePicture.jsx`** — a small avatar that expands into a full-screen zoomed view on tap, animated with `react-native-reanimated`'s `useSharedValue`/`withTiming`.
- **`components/FilterPopup.jsx`** — the full-screen slide-up filter sheet (noise level, search radius with a live map preview, solo/group toggle, utility chips). Worth noting: **none of these filters are actually wired up to the workplace list yet** — `handleApply` just closes the sheet and shows a "Filter applied" toast; the `noiseLevel`/`radius`/`workMode`/`selectedUtilities` state it collects isn't read by `explore.tsx` or `ListView` at all. It's UI scaffolding for a feature that isn't finished.
- **`components/filterComponents.tsx`** (`FeaturesFilter`) — an alternate/earlier utilities-chip-grid component reading from `constants/filters.ts`'s `FEATURE_LIST`. It isn't imported anywhere currently (`FilterPopup` builds its own utility grid inline instead, reading from `constants/utilityIcons.ts`) — leftover from an earlier iteration of the filter UI.

## 1.10 Constants and hooks

- **`constants/Colors.ts`** — the single palette every styled component pulls from (`Colors.primary`, `Colors.textMuted`, crowd-level colors, etc.) — change a color here, it updates everywhere.
- **`constants/Typography.ts`** — named text style presets (`screenTitle`, `body`, `caption`, `button`, ...) spread into component styles with `...Typography.body` — keeps font sizes/weights consistent without repeating raw numbers everywhere.
- **`constants/authStyles.ts`** — the shared layout styles for the login/register screens specifically (both screens are visually identical apart from their form fields, so they share one stylesheet).
- **`constants/crowdLevels.ts`** — maps the four raw crowd-level strings from the data (`empty`, `slightly_crowded`, `medium_full`, `very_crowded`) to a human label, an icon, and a color — the one place that mapping is defined.
- **`constants/utilityIcons.ts`** — maps utility name strings (`"wifi"`, `"power outlets"`, ...) to an Ionicons icon name, with `getUtilityIcon()` falling back to a generic checkmark icon for any utility string it doesn't recognize (so a newly-invented utility name never breaks rendering, it just gets a plain icon).
- **`constants/workplaceMetaStyles.ts`** — small reusable style fragments (`metaItem`, `chip`, `liveBox`) shared between `WorplaceCard` and `detail.tsx` so their "meta row" of stats/chips looks identical in both places.
- **`constants/filters.ts`** — just the `FEATURE_LIST` array used by the currently-unused `filterComponents.tsx` mentioned above.
- **`hooks/useCurrentLocation.js`**:

  ```js
  export default function useCurrentLocation() {
      const [location, setLocation] = useState(null);
      const [permissionGranted, setPermissionGranted] = useState(false);

      useEffect(() => {
          (async () => {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') return;

              setPermissionGranted(true);

              const position = await Location.getCurrentPositionAsync({});
              setLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
              });
          })();
      }, []);

      return { location, permissionGranted };
  }
  ```

  A small custom hook wrapping `expo-location`: on mount, ask for foreground location permission, and if granted, fetch the device's current coordinates once. Every screen that needs the user's location (`explore.tsx`, `FilterPopup`, `create_workspace.tsx`) calls this same hook rather than duplicating the permission-request/fetch dance — each call is independent (it doesn't share a single location across the app, it just shares the *logic* for getting one).

---

# Part 2 — Backend (Go)

The backend is a small REST API written in plain Go — no web framework beyond a lightweight router, no ORM, just the standard library's `net/http` plus a Postgres driver and hand-written SQL. That was a deliberate choice: with a schema this size, an ORM's abstraction saves very little typing and costs a real "what SQL is this actually running" opacity tax. Every query in this backend is something you can read top to bottom and know exactly what it does to the database.

## 2.1 Project layout

```
backend/
  go.mod / go.sum       — Go module definition + dependency lockfile
  cmd/
    api/main.go          — the actual server entrypoint
    seed/main.go         — a standalone command to (re)populate demo data
  internal/
    config/config.go     — reads configuration from environment variables
    database/
      database.go        — Postgres connection pool + migration runner
      seed.go             — loads data/worplaces.json into the database
      migrations/          — SQL schema files
    auth/auth.go          — password hashing + JWT issuing/verification
    models/models.go      — the Go structs that mirror API JSON shapes
    handlers/             — one file per group of HTTP endpoints
  Dockerfile
```

`cmd/` vs `internal/` is a standard Go convention, not just a style preference: anything under `internal/` is only importable from within this module (enforced by the Go compiler itself) — it's how Go expresses "this is a private implementation detail, not a public library" without needing a separate package manager concept for it. `cmd/` holds the actual `main` packages — the things you can `go build` into a runnable binary; there are two here, the real API server and a one-off seeding tool, because they need to do different things at startup but share all the same internal packages underneath.

## 2.2 `go.mod` — the module and its dependencies

```
module arp-backend

go 1.26

require (
    github.com/go-chi/chi/v5 v5.3.0
    github.com/go-chi/cors v1.2.2
    github.com/golang-jwt/jwt/v5 v5.3.1
    github.com/golang-migrate/migrate/v4 v4.19.1
    github.com/jackc/pgx/v5 v5.10.0
    golang.org/x/crypto v0.53.0
)
```

Five real dependencies, each doing one narrow job: **chi** is a minimal HTTP router (adds URL path parameters like `/workplaces/{id}` and route grouping on top of the standard library's router, nothing more); **cors** handles the browser cross-origin headers (mostly future-proofing, since Expo can also target web); **jwt/v5** issues and verifies the login tokens; **golang-migrate** runs the SQL schema files in `migrations/` in order and tracks which have already been applied; **pgx/v5** is the actual Postgres driver/connection pool; **x/crypto** supplies `bcrypt` for password hashing. Nothing here is a "framework" in the Rails/Django sense — there's no code generation, no magic reflection-based routing, no ORM translating structs into SQL behind your back.

## 2.3 Configuration: `internal/config/config.go`

```go
package config

import "os"

type Config struct {
    Port        string
    DatabaseURL string
    JWTSecret   string
    UploadDir   string
    SeedFile    string
}

func Load() Config {
    return Config{
        Port:        getEnv("PORT", "8080"),
        DatabaseURL: getEnv("DATABASE_URL", "postgres://arp:arp@localhost:5432/arp?sslmode=disable"),
        JWTSecret:   getEnv("JWT_SECRET", "dev-secret-change-me"),
        UploadDir:   getEnv("UPLOAD_DIR", "./uploads"),
        SeedFile:    getEnv("SEED_FILE", "./data/worplaces.json"),
    }
}

func getEnv(key, fallback string) string {
    if v, ok := os.LookupEnv(key); ok && v != "" {
        return v
    }
    return fallback
}
```

This is the [twelve-factor app](https://12factor.net/config) pattern: all configuration that differs between environments (dev laptop vs. the production server) comes from environment variables, with sensible local-dev fallbacks baked in so you can just `go run ./cmd/api` with zero setup and it'll try to talk to a Postgres on `localhost:5432`. In production (see Part 3), `docker-compose.yml` sets real values for `DATABASE_URL` and `JWT_SECRET` — notably a randomly generated `JWT_SECRET`, since the fallback `"dev-secret-change-me"` would let anyone forge valid login tokens if it were ever used for real.

## 2.4 Data model: `internal/models/models.go`

```go
type User struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"createdAt"`
}

type Review struct {
    ID      int    `json:"id"`
    Author  string `json:"author"`
    Rating  int    `json:"rating"`
    Comment string `json:"comment"`
    Date    string `json:"date"`
}

type Workplace struct {
    ID                 int      `json:"id"`
    Title              string   `json:"title"`
    Description        string   `json:"description"`
    Latitude           float64  `json:"latitude"`
    Longitude          float64  `json:"longitude"`
    Utilities          []string `json:"utilities"`
    Noise              int      `json:"noise"`
    Images             []string `json:"images"`
    Rating             float64  `json:"rating"`
    Crowdedness        string   `json:"crowdedness"`
    CrowdByHourAverage []string `json:"crowdByHourAverage"`
    CrowdByHourToday   []string `json:"crowdByHourToday"`
    PhoneNumber        string   `json:"phoneNumber"`
    Email              string   `json:"email"`
    OwnerUserID        *int     `json:"ownerUserId,omitempty"`
    Reviews            []Review `json:"reviews"`
}
```

The backtick-quoted `` `json:"..."` `` text after each field is a **struct tag** — Go's `encoding/json` package reads these via reflection to decide what key name to use when marshalling this struct to JSON (or parsing JSON into it). Without them, Go's default behavior is to use the exact Go field name (`Title`, capitalized) as the JSON key — the tags are what make the API's JSON output use the same `camelCase` field names (`crowdByHourAverage`, `phoneNumber`) that the frontend's TypeScript types (in `utils/api.ts`) expect, so the two sides agree on a wire format without either one having to transform field names at runtime.

`OwnerUserID *int` — a **pointer** to an int, not a plain `int` — is how Go represents "this value might be entirely absent," since a plain `int` has no way to distinguish "zero" from "not set." The five original seeded workplaces have no owner (`nil`/`NULL`); a workplace created through the app via `POST /api/workplaces` gets the creating user's ID here. `json:"ownerUserId,omitempty"` means when this is `nil`, the key is left out of the JSON entirely rather than serialized as `null`.

Notice there's no `PasswordHash` field on `User` here — the password hash is only ever handled inside the auth handler functions directly (see 2.7), it never flows through a struct that could accidentally get serialized back out to a client.

## 2.5 The database layer

### `internal/database/migrations/0001_init.up.sql` — the schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workplaces (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    utilities TEXT[] NOT NULL DEFAULT '{}',
    noise SMALLINT NOT NULL DEFAULT 0,
    images TEXT[] NOT NULL DEFAULT '{}',
    crowdedness TEXT NOT NULL DEFAULT 'empty',
    crowd_by_hour_average TEXT[] NOT NULL DEFAULT '{}',
    crowd_by_hour_today TEXT[] NOT NULL DEFAULT '{}',
    phone_number TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    owner_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    workplace_id INTEGER NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reviews_workplace_id_idx ON reviews(workplace_id);

CREATE TABLE favourites (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workplace_id INTEGER NOT NULL REFERENCES workplaces(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, workplace_id)
);
```

Four tables, and the foreign keys between them encode real rules the database itself enforces, not just application logic:

- `reviews.workplace_id REFERENCES workplaces(id) ON DELETE CASCADE` — a review cannot exist pointing at a workplace that doesn't exist, and if a workplace is ever deleted, all its reviews vanish automatically rather than becoming orphaned rows.
- `reviews.user_id REFERENCES users(id) ON DELETE SET NULL` — a review does track which user wrote it, but if that user's account is ever deleted, the review itself survives (just with `user_id` cleared) rather than being deleted along with the account — the review content is treated as independently worth keeping.
- `workplaces.owner_user_id ... ON DELETE SET NULL` — same idea: deleting a user shouldn't delete every workplace they ever created, it should just orphan the ownership.
- `favourites` has **no own `id` column** — its primary key is the *combination* `(user_id, workplace_id)`. That's exactly the shape of the real-world constraint: a given user can favourite a given workplace at most once, and the database enforces that uniqueness natively instead of the application having to check-then-insert and hope nothing races in between.
- `rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5)` — a `CHECK` constraint means the database itself refuses to store a review with, say, a rating of `0` or `11`, even if a bug in the Go code somehow tried to insert one.
- `utilities TEXT[]`, `crowd_by_hour_average TEXT[]` — Postgres natively supports array columns, which is what lets "list of utility strings" and "24 hourly crowd-level strings" be stored as plain columns instead of needing a separate join table for each.

There's also a matching `0001_init.down.sql`, which just drops all four tables in reverse dependency order — the "undo" half of this migration, for `golang-migrate` to run if a migration ever needs to be rolled back.

### `internal/database/database.go` — connecting and migrating

```go
//go:embed migrations/*.sql
var embeddedMigrations embed.FS

func Connect(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
    pool, err := pgxpool.New(ctx, databaseURL)
    if err != nil {
        return nil, fmt.Errorf("create pool: %w", err)
    }
    if err := pool.Ping(ctx); err != nil {
        pool.Close()
        return nil, fmt.Errorf("ping database: %w", err)
    }
    return pool, nil
}

func Migrate(databaseURL string) error {
    source, err := iofs.New(embeddedMigrations, "migrations")
    if err != nil {
        return fmt.Errorf("load embedded migrations: %w", err)
    }

    m, err := migrate.NewWithSourceInstance("iofs", source, databaseURL)
    if err != nil {
        return fmt.Errorf("init migrator: %w", err)
    }
    defer m.Close()

    if err := m.Up(); err != nil && err != migrate.ErrNoChange {
        return fmt.Errorf("run migrations: %w", err)
    }
    return nil
}
```

`//go:embed migrations/*.sql` is a Go compiler directive: it bakes the actual contents of every `.sql` file in that folder directly into the compiled binary at build time, accessible at runtime through the `embeddedMigrations` variable. That's *why* the migrations had to physically live inside `internal/database/migrations/` rather than a top-level `backend/migrations/` — `//go:embed` can only reach files in or below the directory of the `.go` file using it. The upshot: the deployed binary carries its own schema with it — there's no separate step of "remember to copy the migrations folder onto the server," it's already inside the executable.

`Migrate()` runs on **every single server startup** (see `main.go` below), not just once during deployment. `golang-migrate` tracks which migrations have already been applied (in a bookkeeping table it creates in the same database), so re-running `m.Up()` against an already-up-to-date database is a fast no-op (`migrate.ErrNoChange`, explicitly not treated as a real error) — this makes adding a new migration file later as simple as: write the SQL, redeploy, and the schema change applies itself automatically the next time the server boots, with no separate manual migration step to remember.

`pgxpool.New` doesn't actually open a connection by itself — connections are opened lazily, on first use, and pooled/reused after that. `pool.Ping(ctx)` is what actually forces one connection attempt immediately at startup, so a misconfigured `DATABASE_URL` or unreachable database fails loudly and immediately (`log.Fatalf` in `main.go`) instead of the server appearing to start fine and only failing mysteriously on the first real request.

### `internal/database/seed.go` — populating demo data

```go
func SeedIfEmpty(ctx context.Context, pool *pgxpool.Pool, seedFilePath string) error {
    return Seed(ctx, pool, seedFilePath, false)
}

func Seed(ctx context.Context, pool *pgxpool.Pool, seedFilePath string, force bool) error {
    var count int
    if err := pool.QueryRow(ctx, `SELECT count(*) FROM workplaces`).Scan(&count); err != nil {
        return fmt.Errorf("check existing workplaces: %w", err)
    }
    if count > 0 {
        if !force {
            return nil
        }
        if _, err := pool.Exec(ctx, `TRUNCATE workplaces RESTART IDENTITY CASCADE`); err != nil {
            return fmt.Errorf("truncate workplaces: %w", err)
        }
    }

    raw, err := os.ReadFile(seedFilePath)
    ...
    var data seedFile
    if err := json.Unmarshal(raw, &data); err != nil { ... }

    tx, err := pool.Begin(ctx)
    ...
    defer tx.Rollback(ctx)

    for _, wp := range data.Workplaces {
        ...
        _, err := tx.Exec(ctx, `
            INSERT INTO workplaces (id, title, description, latitude, longitude, utilities, noise, images,
                                    crowdedness, crowd_by_hour_average, crowd_by_hour_today, phone_number, email)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            wp.ID, wp.Title, wp.Description, wp.Latitude, wp.Longitude, wp.Utilities, wp.Noise, wp.Images,
            wp.Crowdedness, wp.CrowdByHourAverage, wp.CrowdByHourToday, wp.PhoneNumber, wp.Email,
        )
        ...
        for _, review := range wp.Reviews {
            // Source review IDs only need to be unique per-workplace, so let the DB assign
            // its own globally-unique id rather than reusing the JSON one.
            _, err := tx.Exec(ctx, `
                INSERT INTO reviews (workplace_id, author, rating, comment, created_at)
                VALUES ($1, $2, $3, $4, $5::date)`,
                wp.ID, review.Author, review.Rating, review.Comment, review.Date,
            )
            ...
        }
    }

    if _, err := tx.Exec(ctx, `SELECT setval('workplaces_id_seq', (SELECT COALESCE(MAX(id), 0) FROM workplaces))`); err != nil { ... }

    if err := tx.Commit(ctx); err != nil { ... }
    ...
}
```

This reads `data/worplaces.json` — the exact same demo dataset the frontend used to import directly and render entirely client-side — and turns it into real rows. The `count(*)` check up front means `SeedIfEmpty` (called automatically every time the server starts, in `main.go`) is safe to run over and over: it only actually inserts anything the very first time, when the `workplaces` table is empty; every subsequent boot it's a single cheap `SELECT count(*)` and nothing else. `Seed(..., force=true)` is the escape hatch for deliberately wiping and reloading — that's what `cmd/seed`'s `--force` flag calls into (2.9), used a few times over the course of building this to reset the database back to a clean demo state after manual testing.

Everything happens inside one `pool.Begin(ctx)` / `tx.Commit(ctx)` **transaction**, with `defer tx.Rollback(ctx)` immediately after starting it. That `defer` looks backwards (rolling back right after beginning?) but it's a standard Go idiom: `defer` only actually *runs* when the function returns, and calling `Rollback` on a transaction that was already successfully `Commit`-ed is documented to be a safe no-op. So the real effect is "if this function returns early for *any* reason — any of those `err != nil` checks — before reaching `tx.Commit(ctx)`, undo every insert that happened so far in this call." Without the transaction, a failure partway through (say, on workplace #4 of 5) would leave the database in a half-seeded state; with it, seeding is all-or-nothing.

The code comment above the review insert marks a real bug that got hit and fixed during development: the source JSON's review `id` fields **restart at 1 for every workplace** (workplace 1's reviews are numbered 1, 2, 3; workplace 2's reviews are *also* numbered 1, 2, 3, ...) — they were only ever meant to be unique *within* one workplace's review list. But the `reviews` table has one single global `id SERIAL PRIMARY KEY` shared by every review regardless of which workplace it belongs to. Trying to `INSERT ... (id, workplace_id, ...) VALUES (1, 2, ...)` right after already inserting `(1, 1, ...)` for workplace 1 collided on that shared primary key and failed with a Postgres `unique constraint` violation. The fix: stop passing an explicit `id` for reviews at all, and let Postgres's `SERIAL` auto-assign a fresh globally-unique one — the JSON's own review `id` values are simply discarded during seeding, since they were never meant to mean anything outside their own workplace's list anyway.

`setval('workplaces_id_seq', ...)` at the end is necessary *because* workplace rows **are** inserted with an explicit `id` (`wp.ID`, taken straight from the JSON, so a workplace stays "workplace #1" consistently) rather than letting `SERIAL` assign one. Postgres's autoincrement counter (the "sequence") for that column has no idea those explicit IDs were used — left alone, it would still think the next available ID is `1`, and the very next real `POST /api/workplaces` from the app would collide with a seeded workplace's ID. This line manually fast-forwards the sequence to one past the highest ID actually seeded, so the first workplace created through the app gets `id = 6` (there are 5 seeded workplaces), not a collision.

## 2.6 Authentication: `internal/auth/auth.go`

```go
func HashPassword(password string) (string, error) {
    hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    ...
    return string(hash), nil
}

func CheckPassword(hash, password string) bool {
    return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
```

Passwords are never stored — only a `bcrypt` hash of them is. `bcrypt` is deliberately *slow* (it's designed to be computationally expensive, and that cost is tunable via `bcrypt.DefaultCost`), which is exactly the property you want for password storage: if the database were ever leaked, an attacker trying to brute-force guess passwords from the hashes would be limited to a slow number of guesses per second, unlike a plain fast hash like SHA-256 which can be brute-forced at billions of guesses per second on modern hardware. `CheckPassword` never decrypts anything (bcrypt hashing isn't reversible) — it re-hashes the *candidate* password the same way and lets bcrypt's own comparison function tell you whether the result matches, in a way that's also resistant to timing attacks.

```go
type Manager struct {
    secret []byte
}

func NewManager(secret string) *Manager {
    return &Manager{secret: []byte(secret)}
}

func (m *Manager) IssueToken(userID int) (string, error) {
    claims := jwt.MapClaims{
        "sub": userID,
        "exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
        "iat": time.Now().Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(m.secret)
}

func (m *Manager) VerifyToken(tokenString string) (int, error) {
    token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, ErrInvalidToken
        }
        return m.secret, nil
    })
    if err != nil || !token.Valid {
        return 0, ErrInvalidToken
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    ...
    sub, ok := claims["sub"].(float64)
    ...
    return int(sub), nil
}
```

A JWT ("JSON Web Token") is a compact, self-contained, tamper-evident token: it's a base64-encoded JSON payload (the "claims" — here, `sub` for subject/user-ID, `exp` for expiry, `iat` for issued-at) plus a cryptographic signature over that payload, all three concatenated into the one string the app stores and sends as `Authorization: Bearer <token>`. "Self-contained" is the important property: the server doesn't need to look anything up in a database or in-memory session store to check who's making a request — it just needs to verify the signature was produced by *this server's* secret key, which proves the token wasn't forged or altered since it was issued, entirely offline.

`jwt.SigningMethodHS256` is HMAC-SHA256 — a *symmetric* signing scheme, meaning the exact same secret key both signs new tokens and verifies existing ones. That's why `JWTSecret` (from `config.go`) matters so much: anyone who obtains that secret string could forge a valid-looking token claiming to be any user ID they like — which is precisely why production uses a long randomly-generated secret (Part 3) rather than the `"dev-secret-change-me"` fallback.

The type-check inside `VerifyToken`'s callback (`if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok { return nil, ErrInvalidToken }`) guards against a real, historically-exploited class of JWT vulnerability: some JWT libraries let the *token itself* specify which algorithm was used to sign it, and if you naively trust that, an attacker can hand you a token claiming `"alg": "none"` (no signature at all) or swap to a different algorithm your code wasn't expecting, and some implementations would wrongly accept it. Explicitly checking that the parsed token's method actually *is* HMAC before proceeding closes that door — regardless of what the incoming token's header claims, this code only ever verifies it using HMAC with the server's own secret.

`claims["sub"].(float64)` — the type assertion to `float64` rather than `int` looks odd but is required: this library parses the JSON claims into a generic `map[string]interface{}`, and Go's standard JSON decoder always decodes JSON numbers into `float64` when the target type isn't already known ahead of time. `int(sub)` at the end converts it back to the actual user ID.

```go
func (m *Manager) Middleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        header := r.Header.Get("Authorization")
        if !strings.HasPrefix(header, "Bearer ") {
            http.Error(w, `{"error":"missing bearer token"}`, http.StatusUnauthorized)
            return
        }

        userID, err := m.VerifyToken(strings.TrimPrefix(header, "Bearer "))
        if err != nil {
            http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
            return
        }

        ctx := context.WithValue(r.Context(), userIDContextKey, userID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

func UserIDFromContext(ctx context.Context) (int, bool) {
    userID, ok := ctx.Value(userIDContextKey).(int)
    return userID, ok
}
```

This is Go's **middleware** pattern: `Middleware` takes one `http.Handler` (whatever comes "next" in the chain — the actual endpoint logic) and returns a *new* `http.Handler` that wraps it — check the `Authorization` header, reject the request early with `401` if it's missing/invalid, and only if it's valid, call the real handler. Any route that needs a logged-in user gets wrapped in this (see the router in 2.8); routes that don't (like listing workplaces publicly) simply aren't.

`context.WithValue` is how the verified user ID gets from this middleware down into the actual handler function without needing a shared mutable variable or global state — it attaches the value to that one request's `context.Context`, which every handler function already receives as part of `*http.Request`, and `auth.UserIDFromContext(r.Context())` (called at the top of every authenticated handler, e.g. in `handlers/reviews.go`) reads it back out. `userIDContextKey` is a custom unexported type (not a plain string) specifically to avoid key collisions with anything else that might store values on the same context under a similarly-named key — a well-known Go `context` gotcha the standard library docs explicitly warn about.

## 2.7 HTTP handlers

Handlers are grouped into one file per resource, all sharing one small struct:

### `internal/handlers/handlers.go` — shared plumbing

```go
type Server struct {
    DB        *pgxpool.Pool
    Auth      *auth.Manager
    UploadDir string
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
    writeJSON(w, status, map[string]string{"error": message})
}
```

`Server` bundles the two things nearly every handler needs (a database connection pool, and the JWT manager for anything auth-related) into one struct, and every handler is defined as a **method** on `*Server` (`func (s *Server) ListWorkplaces(w, r) {...}`) rather than a free function — that's how they get access to `s.DB` without needing global variables. `writeJSON`/`writeError` are tiny shared helpers so every single handler doesn't repeat "set the content-type header, set the status code, encode this as JSON" by hand — and so every error response has one consistent shape (`{"error": "..."}`), which is exactly what `utils/api.ts`'s `request()` function on the frontend expects to parse out of a failed response.

### `internal/handlers/auth.go` — register, login, me

```go
func (s *Server) Register(w http.ResponseWriter, r *http.Request) {
    var req registerRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, http.StatusBadRequest, "invalid request body")
        return
    }
    req.Name = strings.TrimSpace(req.Name)
    req.Email = strings.TrimSpace(strings.ToLower(req.Email))

    if req.Name == "" || req.Email == "" || len(req.Password) < 8 {
        writeError(w, http.StatusBadRequest, "name, email and a password of at least 8 characters are required")
        return
    }

    passwordHash, err := auth.HashPassword(req.Password)
    ...

    var user models.User
    err = s.DB.QueryRow(r.Context(),
        `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at`,
        req.Name, req.Email, passwordHash,
    ).Scan(&user.ID, &user.Name, &user.Email, &user.CreatedAt)
    if err != nil {
        if isUniqueViolation(err) {
            writeError(w, http.StatusConflict, "an account with this email already exists")
            return
        }
        writeError(w, http.StatusInternalServerError, "could not create account")
        return
    }

    token, err := s.Auth.IssueToken(user.ID)
    ...
    writeJSON(w, http.StatusCreated, authResponse{Token: token, User: user})
}
```

`strings.ToLower(req.Email)` on the way in means `Test@Example.com` and `test@example.com` are treated as the same account — email addresses are conventionally case-insensitive on the domain and typically treated as such on the local part too, and this avoids "wait, is that a different account?" confusion. The password-length check (`< 8`) is the *only* password strength rule enforced — deliberately minimal.

`INSERT ... RETURNING id, name, email, created_at` — Postgres's `RETURNING` clause hands back the row exactly as the database actually stored it (including the auto-generated `id` and `created_at` timestamp) in the same round-trip as the insert, rather than needing a second `SELECT` query afterward to find out what ID got assigned.

`isUniqueViolation(err)` (a small `strings.Contains(err.Error(), "unique constraint")` helper) is how a duplicate-email registration attempt gets turned into a clean `409 Conflict` "an account with this email already exists" instead of a generic `500` — the `email TEXT NOT NULL UNIQUE` constraint from the migration is what actually rejects the insert at the database level; this just recognizes that specific failure and reports it usefully. Every other insert failure falls through to a generic `500`.

`Login` is the mirror image: look up the user by email, and if found, call `auth.CheckPassword(passwordHash, req.Password)` — deliberately returning the *exact same* `401 invalid email or password` message whether the email wasn't found at all or the password was wrong for an email that does exist. That's intentional: distinguishing the two ("no such account" vs "wrong password") would let an attacker use the login endpoint to discover which email addresses have accounts on the system at all, just by watching which error message comes back.

### `internal/handlers/workplaces.go` — listing, fetching, creating

```go
func (s *Server) ListWorkplaces(w http.ResponseWriter, r *http.Request) {
    rows, err := s.DB.Query(r.Context(), `
        SELECT id, title, description, latitude, longitude, utilities, noise, images,
               crowdedness, crowd_by_hour_average, crowd_by_hour_today, phone_number, email, owner_user_id
        FROM workplaces
        ORDER BY id`)
    ...
    var workplaces []models.Workplace
    for rows.Next() {
        wp, err := scanWorkplace(rows)
        ...
        workplaces = append(workplaces, wp)
    }

    if err := attachReviews(r.Context(), s.DB, workplaces); err != nil { ... }

    writeJSON(w, http.StatusOK, workplaces)
}
```

This is the endpoint `WorkplacesContext.refresh()` on the frontend calls. Notice it's a **public** endpoint (no auth middleware wraps it — see the router in 2.8): anyone can list workplaces without logging in, which matches the product intent of a place-discovery app.

```go
func attachReviews(ctx context.Context, db pgxQuerier, workplaces []models.Workplace) error {
    ...
    rows, err := db.Query(ctx, `
        SELECT id, workplace_id, author, rating, comment, to_char(created_at, 'YYYY-MM-DD')
        FROM reviews
        WHERE workplace_id = ANY($1)
        ORDER BY created_at`, ids)
    ...
    ratingSums := make(map[int]int)
    ratingCounts := make(map[int]int)

    for rows.Next() {
        var review models.Review
        var workplaceID int
        rows.Scan(&review.ID, &workplaceID, &review.Author, &review.Rating, &review.Comment, &review.Date)
        if wp, ok := byID[workplaceID]; ok {
            wp.Reviews = append(wp.Reviews, review)
            ratingSums[workplaceID] += review.Rating
            ratingCounts[workplaceID]++
        }
    }

    for id, wp := range byID {
        if count := ratingCounts[id]; count > 0 {
            avg := float64(ratingSums[id]) / float64(count)
            wp.Rating = float64(int(avg*10+0.5)) / 10
        }
    }

    return nil
}
```

This is worth dwelling on because it's the single most important behavioral decision in the whole backend: **`rating` is never stored anywhere in the `workplaces` table.** It's computed fresh, every single time, as the mean of that workplace's actual reviews, right here in Go after fetching them. When the frontend used to compute this client-side (the old `review.tsx`), the average could only ever be as correct as whatever reviews happened to already be loaded on that one device — now there is exactly one place average ratings get calculated, and every client sees the same number because they're all asking the same server to compute it the same way.

`WHERE workplace_id = ANY($1)` with `ids` being a Go slice of every workplace ID on this page — this fetches reviews for *every* workplace in **one single SQL query**, instead of running a separate `SELECT ... WHERE workplace_id = ?` once per workplace in a loop (which would be `N` extra round-trips to the database for `N` workplaces — a classic performance mistake sometimes called the "N+1 query problem"). `pgx` maps a Go slice directly onto Postgres's `ANY(array)` syntax.

`avg*10+0.5) / 10` (with the outer conversion through `int(...)`) is manual "round to one decimal place" arithmetic: multiply by 10, add 0.5 (which pushes any `.5`-or-above fractional part over the next whole number), truncate to an integer via the `int(...)` conversion (which always rounds *toward zero*, i.e. truncates), then divide back down by 10. So `4.26` becomes `42.6 + 0.5 = 43.1`, truncated to `43`, divided back to `4.3` — this exact rounding behavior was chosen to match what the frontend's old client-side code used to do (`Math.round(avg * 10) / 10`), so switching from client-computed to server-computed ratings didn't change what number anyone actually saw.

```go
func (s *Server) CreateWorkplace(w http.ResponseWriter, r *http.Request) {
    userID, _ := auth.UserIDFromContext(r.Context())
    ...
    row := s.DB.QueryRow(r.Context(), `
        INSERT INTO workplaces (title, description, latitude, longitude, utilities, images, crowdedness,
                                 crowd_by_hour_average, crowd_by_hour_today, owner_user_id)
        VALUES ($1, $2, $3, $4, $5, $6, 'empty', $7, $7, $8)
        RETURNING id, title, description, latitude, longitude, utilities, noise, images,
                  crowdedness, crowd_by_hour_average, crowd_by_hour_today, phone_number, email, owner_user_id`,
        req.Title, req.Description, req.Latitude, req.Longitude, req.Utilities, req.Images, emptyHours, userID,
    )
    ...
```

This is the endpoint behind the app's "Add" button in Create Workspace. Note it's a member of the `r.Route("/api/workplaces", ...)` group wrapped `.With(s.Auth.Middleware)` in the router (2.8) — you cannot create a workplace without a valid token, and `userID` comes straight from that verified token, not from anything the client sent in the request body, so there's no way for a client to lie about who's creating a workplace. Every new workplace starts with `crowdedness = 'empty'` and 24 hours of `'empty'` in both crowd-history arrays (`$7` is reused for both `crowd_by_hour_average` and `crowd_by_hour_today` — there's no real crowd-sensing hardware behind this app, so a brand-new workplace just starts with no data rather than fake data) and `noise = 0` (the column default, since the create form doesn't collect a noise rating).

### `internal/handlers/reviews.go`

```go
func (s *Server) CreateReview(w http.ResponseWriter, r *http.Request) {
    userID, _ := auth.UserIDFromContext(r.Context())
    workplaceID, err := strconv.Atoi(chi.URLParam(r, "id"))
    ...
    var authorName string
    if err := s.DB.QueryRow(r.Context(), `SELECT name FROM users WHERE id = $1`, userID).Scan(&authorName); err != nil {
        writeError(w, http.StatusUnauthorized, "user not found")
        return
    }

    var review models.Review
    err = s.DB.QueryRow(r.Context(), `
        INSERT INTO reviews (workplace_id, user_id, author, rating, comment)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, author, rating, comment, to_char(created_at, 'YYYY-MM-DD')`,
        workplaceID, userID, authorName, req.Rating, req.Comment,
    ).Scan(&review.ID, &review.Author, &review.Rating, &review.Comment, &review.Date)
    ...
```

`chi.URLParam(r, "id")` reads the `{id}` segment out of the route pattern `/workplaces/{id}/reviews` (defined in the router, 2.8) — this is the actual value chi's router adds on top of Go's plain standard-library router, which has no built-in concept of URL path parameters. The author's display name is looked up fresh from the `users` table by the authenticated `userID` rather than trusted from the request body — a client can't submit a review pretending to be authored by someone else's name.

### `internal/handlers/favourites.go`

```go
func (s *Server) AddFavourite(w http.ResponseWriter, r *http.Request) {
    userID, _ := auth.UserIDFromContext(r.Context())
    workplaceID, err := strconv.Atoi(chi.URLParam(r, "id"))
    ...
    _, err = s.DB.Exec(r.Context(), `
        INSERT INTO favourites (user_id, workplace_id) VALUES ($1, $2)
        ON CONFLICT (user_id, workplace_id) DO NOTHING`, userID, workplaceID)
    ...
    w.WriteHeader(http.StatusNoContent)
}
```

`ON CONFLICT (user_id, workplace_id) DO NOTHING` leans directly on the `favourites` table's composite primary key from the migration: if this exact `(user_id, workplace_id)` pair is already favourited, Postgres would normally reject the insert as a primary-key violation — this clause tells it to silently do nothing instead. That's what makes `AddFavourite` **idempotent**: calling it twice in a row for the same workplace has the exact same end result as calling it once, which matters because the frontend's optimistic-update logic (section 1.7) could plausibly fire a duplicate request if a user double-tapped the heart icon before the first request finished. `204 No Content` is the conventional HTTP status for "the action succeeded, there's genuinely nothing to send back" — which is exactly why `utils/api.ts`'s shared `request()` function has that explicit `if (res.status === 204) return undefined` branch.

### `internal/handlers/uploads.go`

```go
const maxUploadSize = 10 << 20 // 10 MB

var allowedImageExts = map[string]bool{
    ".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".heic": true,
}

func (s *Server) UploadImage(w http.ResponseWriter, r *http.Request) {
    r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
    if err := r.ParseMultipartForm(maxUploadSize); err != nil {
        writeError(w, http.StatusBadRequest, "file too large or invalid form")
        return
    }

    file, header, err := r.FormFile("image")
    ...
    ext := strings.ToLower(filepath.Ext(header.Filename))
    if !allowedImageExts[ext] {
        writeError(w, http.StatusBadRequest, "unsupported image type")
        return
    }

    if err := os.MkdirAll(s.UploadDir, 0o755); err != nil { ... }

    filename := randomFilename() + ext
    destPath := filepath.Join(s.UploadDir, filename)

    dest, err := os.Create(destPath)
    ...
    io.Copy(dest, file)

    writeJSON(w, http.StatusCreated, map[string]string{"url": "/uploads/" + filename})
}

func randomFilename() string {
    buf := make([]byte, 16)
    _, _ = rand.Read(buf)
    return fmt.Sprintf("%x", buf)
}
```

`10 << 20` is a bit-shift — `10 * 2^20`, i.e. 10 megabytes — a fairly idiomatic Go way to write byte-size constants. `http.MaxBytesReader` enforces that limit *while reading the request body*, rejecting an oversized upload early rather than letting a client stream gigabytes at the server and only checking after the fact.

`ext := strings.ToLower(filepath.Ext(header.Filename))` plus the `allowedImageExts` allow-list is a real security control, not just validation: it's what stops someone from uploading, say, a `.php` or `.sh` file disguised with an image form field — only a small fixed set of image extensions are ever accepted, and the file is always saved with a name *this server generated* (`randomFilename()`), never the client-supplied filename, which also closes off directory-traversal tricks like a filename containing `../../etc/passwd`.

`randomFilename()` uses `crypto/rand` (a cryptographically secure random source, not the weaker `math/rand`) to generate 16 random bytes, then formats them as a 32-character hex string — this is what guarantees two different uploads never collide on the same filename, without needing to check "does this filename already exist" at all.

The returned `"url": "/uploads/" + filename` is a **relative** path, not a full URL with a domain — deliberately, since the backend doesn't necessarily know what public hostname it's being served under (this is exactly the value `resolveApiUrl()` on the frontend turns into a real absolute URL, section 1.8).

### `internal/handlers/health.go`

```go
func (s *Server) Health(w http.ResponseWriter, r *http.Request) {
    if err := s.DB.Ping(r.Context()); err != nil {
        writeError(w, http.StatusServiceUnavailable, "database unreachable")
        return
    }
    writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
```

A trivial endpoint, but an intentionally useful one: it doesn't just say "the Go process is running" (which `curl`-ing any endpoint would already tell you) — it actively pings the database too, so `GET /api/health` genuinely answers "is this deployment fully working end to end," which is what was used repeatedly throughout deployment (Part 3) to confirm the server was actually up after every change.

## 2.8 Routing: `internal/handlers/router.go`

```go
func (s *Server) Router() http.Handler {
    r := chi.NewRouter()

    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(cors.Handler(cors.Options{
        AllowedOrigins:   []string{"*"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Authorization", "Content-Type"},
        AllowCredentials: false,
    }))

    r.Get("/api/health", s.Health)

    r.Route("/api/auth", func(r chi.Router) {
        r.Post("/register", s.Register)
        r.Post("/login", s.Login)
        r.With(s.Auth.Middleware).Get("/me", s.Me)
    })

    r.Route("/api/workplaces", func(r chi.Router) {
        r.Get("/", s.ListWorkplaces)
        r.Get("/{id}", s.GetWorkplace)
        r.With(s.Auth.Middleware).Post("/", s.CreateWorkplace)
        r.With(s.Auth.Middleware).Post("/{id}/reviews", s.CreateReview)
    })

    r.Route("/api/favourites", func(r chi.Router) {
        r.Use(s.Auth.Middleware)
        r.Get("/", s.ListFavourites)
        r.Post("/{id}", s.AddFavourite)
        r.Delete("/{id}", s.RemoveFavourite)
    })

    r.With(s.Auth.Middleware).Post("/api/uploads", s.UploadImage)

    fileServer := http.FileServer(http.Dir(s.UploadDir))
    r.Handle("/uploads/*", http.StripPrefix("/uploads/", fileServer))

    return r
}
```

This single function is the entire map of every URL the API responds to — reading it top to bottom tells you the whole surface area of the backend. `r.Use(...)` applies middleware to *every* route below it in scope: `middleware.Logger` (from chi itself) logs every request/response (that's the `"GET http://... 200 ... in ...µs"` log lines seen throughout deployment/debugging), and `middleware.Recoverer` catches any Go panic inside a handler and turns it into a clean `500` response instead of crashing the entire server process for every connected client.

Within `r.Route("/api/auth", ...)`, notice `register`/`login` have no `.With(s.Auth.Middleware)` — they *can't*, since you don't have a token yet before you've logged in — while `/me` does, since it needs to know who's asking. Same pattern in `/api/workplaces`: reading (`GET /`, `GET /{id}`) is public, writing (`POST /`, `POST /{id}/reviews`) requires auth. `/api/favourites` applies `r.Use(s.Auth.Middleware)` once for the whole group instead of repeating `.With(...)` on each line, since *every* favourites operation requires knowing which user's favourites you mean.

The very last two lines are what actually serve uploaded photos back out: `http.FileServer(http.Dir(s.UploadDir))` is the Go standard library's built-in "serve files from this directory" handler, and `http.StripPrefix("/uploads/", ...)` removes that prefix from the incoming request path before handing it to the file server — so a request for `/uploads/abc123.jpg` gets mapped to looking for a file literally named `abc123.jpg` inside `UploadDir` on disk (which is the same directory `uploads.go`'s `UploadImage` handler just wrote it into).

The `cors.Handler` config (`AllowedOrigins: []string{"*"}`) permits requests from any origin — necessary because Expo can also build for web, where the browser's CORS rules would otherwise block the frontend's JavaScript from calling a different-origin API at all. It's wide open (`*`) rather than locked to one specific domain because this API has no browser-cookie-based session to protect (auth is a bearer token in a header, not a cookie) — the usual security reason to restrict CORS origins doesn't really apply here.

## 2.9 Tying it together: `cmd/api/main.go` and `cmd/seed/main.go`

```go
func main() {
    cfg := config.Load()
    ctx := context.Background()

    if err := database.Migrate(cfg.DatabaseURL); err != nil {
        log.Fatalf("migration failed: %v", err)
    }
    log.Println("migrations applied")

    pool, err := database.Connect(ctx, cfg.DatabaseURL)
    if err != nil {
        log.Fatalf("could not connect to database: %v", err)
    }
    defer pool.Close()

    authManager := auth.NewManager(cfg.JWTSecret)
    server := handlers.New(pool, authManager, cfg.UploadDir)

    if err := database.SeedIfEmpty(ctx, pool, cfg.SeedFile); err != nil {
        log.Printf("seed skipped: %v", err)
    }

    log.Printf("listening on :%s", cfg.Port)
    if err := http.ListenAndServe(":"+cfg.Port, server.Router()); err != nil {
        log.Fatalf("server error: %v", err)
    }
}
```

This is the exact sequence that runs every time the API container starts: load config from environment → apply any pending schema migrations → open the connection pool → build the auth manager and the handlers `Server` → seed demo data if the `workplaces` table is empty → start listening for HTTP requests. Each of the first two steps uses `log.Fatalf` on failure, which both logs the error *and* immediately exits the process (`os.Exit(1)`) — deliberately, since a server that couldn't migrate its schema or reach its database has no business pretending to accept requests; better to fail loudly at startup (which Docker will visibly report as a crashed container) than run in a broken half-working state.

`cmd/seed/main.go` reuses these exact same `config`/`database` packages, just with a different `main`:

```go
func main() {
    force := flag.Bool("force", false, "wipe existing workplaces before seeding")
    flag.Parse()

    cfg := config.Load()
    ctx := context.Background()

    database.Migrate(cfg.DatabaseURL)
    pool, _ := database.Connect(ctx, cfg.DatabaseURL)
    defer pool.Close()

    if err := database.Seed(ctx, pool, cfg.SeedFile, *force); err != nil {
        log.Fatalf("seed failed: %v", err)
    }
    log.Println("seed complete")
}
```

`flag.Bool("force", false, ...)` is the standard library's command-line flag parser — this is what lets you run `./seed --force` on the server to deliberately wipe and reload demo data (used a few times during this project specifically to clear out test accounts/workplaces created while verifying the deployment worked). Being a completely separate compiled binary (see the Dockerfile below) rather than, say, a hidden HTTP endpoint on the main API, means there's no way to accidentally trigger a full data wipe over the network — it can only be run as a deliberate command on the server itself.

---

# Part 3 — Deployment

## 3.1 `backend/Dockerfile` — building the container image

```dockerfile
FROM golang:1.26-alpine AS build
WORKDIR /src

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 go build -o /out/api ./cmd/api
RUN CGO_ENABLED=0 go build -o /out/seed ./cmd/seed

FROM alpine:3.20
WORKDIR /app

COPY --from=build /out/api ./api
COPY --from=build /out/seed ./seed
COPY data/worplaces.json ./data/worplaces.json

ENV PORT=8080
ENV UPLOAD_DIR=/app/uploads
ENV SEED_FILE=/app/data/worplaces.json

EXPOSE 8080
CMD ["./api"]
```

This is a **multi-stage build** — two separate `FROM` lines define two images, and only the *second* one is what actually gets shipped/run. The first stage (`FROM golang:1.26-alpine AS build`) has the full Go toolchain (compiler, standard library source, etc.) needed to *compile* the two binaries, but that entire toolchain — hundreds of megabytes — never makes it into the final image; only the two already-compiled binaries get copied out of it (`COPY --from=build /out/api ./api`) into a fresh, minimal `alpine:3.20` base. The end result is a final image that's just Alpine Linux (a genuinely tiny Linux distribution) plus two small statically-linked executables plus the seed JSON data — nowhere near the size it would be if the Go compiler itself shipped in the production image.

`COPY backend/go.mod backend/go.sum ./` followed by `RUN go mod download`, *before* `COPY backend/ ./` (the actual source code), is a deliberate ordering for Docker's build cache: Docker caches each layer, and only re-runs a layer (and everything after it) if the files that layer depends on changed. Dependencies (`go.mod`/`go.sum`) change far less often than the actual application source code does — so structuring it this way means editing a handler function and rebuilding doesn't force Docker to re-download every Go module from scratch; the `go mod download` layer stays cached and only the final `go build` steps re-run.

`CGO_ENABLED=0` disables Cgo (Go's mechanism for calling into C libraries), which forces a fully **static** binary with no dynamic library dependencies at all — this is what lets a binary built in one environment run correctly on Alpine's minimal base without missing shared library errors, since it isn't linked against anything from the build environment's C library.

`data/worplaces.json` gets copied in from the repository root (not from inside `backend/`) — which is only possible because the Docker *build context* for this image is the whole repo root, not the `backend/` folder (set in `docker-compose.yml` below), specifically so this one Dockerfile can reach both `backend/` and the top-level `data/` folder.

## 3.2 `docker-compose.yml` — running the whole stack together

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-arp}
      POSTGRES_USER: ${POSTGRES_USER:-arp}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-arp}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-arp} -d ${POSTGRES_DB:-arp}"]
      interval: 5s
      timeout: 5s
      retries: 10

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER:-arp}:${POSTGRES_PASSWORD:-arp}@db:5432/${POSTGRES_DB:-arp}?sslmode=disable
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-me}
      PORT: 8080
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - uploads:/app/uploads

volumes:
  pgdata:
  uploads:
```

One file, two containers, wired together. `${POSTGRES_PASSWORD:-arp}` is shell-style variable substitution with a fallback — Docker Compose reads a `.env` file sitting next to this `docker-compose.yml` and substitutes matching variable names in; if `.env` doesn't define `POSTGRES_PASSWORD`, it falls back to the literal `arp` (fine for quick local testing, deliberately *not* what production actually uses — see 3.4).

`db`'s `healthcheck` (`pg_isready`, Postgres's own built-in readiness-check command) combined with `backend`'s `depends_on: db: condition: service_healthy` is what guarantees correct startup ordering: the `backend` container won't even start until Postgres has reported itself as actually ready to accept connections, not merely "the container process has started" (which for Postgres can be several seconds before it's genuinely ready) — without this, the backend's very first migration attempt could race against Postgres still initializing and fail.

`pgdata` and `uploads` are **named volumes** — Docker-managed persistent storage that lives independently of the containers themselves. This is what makes the data actually durable: `docker compose down` (stopping and removing the containers) and `docker compose up` (recreating them) leaves both volumes completely untouched, so the database contents and every uploaded photo survive a redeploy. The two of them are only ever destroyed together via the explicit `docker compose down -v` (`-v` for "also remove volumes") — which is exactly the destructive command used a few times during development specifically to reset to a clean seeded state, and never used against the actual production deployment.

`ports: - "127.0.0.1:8080:8080"` on the `backend` service is a deliberate security choice: binding to `127.0.0.1` specifically (rather than the default, which would be every network interface, `0.0.0.0`) means port 8080 is only reachable from *inside* the server itself, never from the public internet directly. The only way in from outside is through Caddy (3.3), which is what actually listens on the public-facing ports 80/443 and forwards to `127.0.0.1:8080` internally. `db` has **no `ports:` entry at all** — it's reachable only from other containers on the same Docker-created network (by its service name, `db`, which is what `DATABASE_URL` above uses as the hostname), not even from the host machine itself.

## 3.3 The server: Caddy, DNS, and getting to `https://arp.syntraq.de`

The app is deployed on an existing Ubuntu 24.04 server (a personal VPS, referred to as `syntraq` throughout this project) that was already running Docker for other things.

**Clearing the way.** Before deploying anything, the server turned out to have an old, no-longer-needed GitLab instance still running, bound directly to ports 80 and 443 — and a single 7GB runaway container log file for that same GitLab container had filled the disk to 100% (only 33MB free). Both had to be dealt with first: the GitLab container, its image, and its data directory were removed entirely (with explicit confirmation, since deleting data isn't reversible), which dropped disk usage back down to 38% and freed ports 80/443 for actual use.

**Caddy.** [Caddy](https://caddyserver.com/) is a web server whose standout feature is fully automatic HTTPS: point it at a domain name, and it obtains and renews a real [Let's Encrypt](https://letsencrypt.org/) TLS certificate for you with essentially zero configuration, then keeps it renewed indefinitely without any intervention. It was installed via Caddy's official APT repository (rather than as another Docker container) so it could bind directly to the host's ports 80/443 and manage its own systemd service, sitting in front of everything else on the server. Its entire configuration for this project is this one file, `/etc/caddy/Caddyfile`:

```
arp.syntraq.de {
    reverse_proxy 127.0.0.1:8080
}
```

That's the whole thing: any request arriving for the hostname `arp.syntraq.de` gets forwarded to whatever's listening on `127.0.0.1:8080` — the `backend` container from `docker-compose.yml` above. The very first time this config was loaded (`systemctl reload caddy`), Caddy automatically negotiated a certificate with Let's Encrypt via the `tls-alpn-01` challenge (a challenge type that proves domain ownership by briefly presenting a special certificate over the TLS handshake itself, on port 443 — no separate file needs to be hosted anywhere for it), entirely without any certificate-specific configuration having been written by hand.

**DNS.** The domain `syntraq.de` is managed through Cloudflare. A single DNS `A` record was added: `arp` → the server's public IP address, set to **"DNS only"** (Cloudflare's grey-cloud mode) rather than proxied (orange cloud). That choice was specifically to keep Caddy's automatic certificate issuance simple and reliable on the first attempt — with Cloudflare's proxy sitting in between, the TLS challenge and the actual TLS termination get more complicated to reason about (you'd typically want Cloudflare's "Full (strict)" SSL mode plus care about which challenge type still works through the proxy); going DNS-only means clients connect straight through to Caddy on the origin server with nothing in between. The domain can always be switched to Cloudflare's proxy later, if e.g. its DDoS protection or caching becomes useful, since Caddy already has a valid independently-issued certificate regardless.

**A debugging story worth remembering:** right after adding that DNS record, everything worked when tested from this development machine via `curl` — but registering an account from the actual app on a different network initially failed with "Network request failed." The cause turned out to be entirely local: the home router being used for development (a Fritz!Box) had already cached a *negative* DNS answer (`NXDOMAIN`, "this domain doesn't exist") for `arp.syntraq.de` from an earlier lookup attempt made *before* the DNS record existed yet — and it was holding onto that wrong answer for up to 30 minutes (the negative-caching TTL from the domain's `SOA` record), regardless of the fact that the real record now existed and every public DNS resolver (like `1.1.1.1`) already returned it correctly. Since the iOS Simulator shares its host Mac's network configuration, it inherited that same stale, wrong answer. The fix was a temporary `/etc/hosts` entry (`193.203.238.57 arp.syntraq.de`) to bypass the router's DNS resolution entirely for that one hostname until the real record was confirmed working — then removed again once it was, so the machine wasn't left permanently pinned to one hardcoded IP address.

## 3.4 Production secrets

Two values must never be the docker-compose defaults in a real deployment: `POSTGRES_PASSWORD` and `JWT_SECRET` (recall from 2.6 that anyone holding the JWT secret can forge valid login tokens for any user). Both were generated on the server itself with `openssl rand`:

```bash
JWT_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)
```

and written into a `.env` file living next to `docker-compose.yml` on the server (`chmod 600`, so only the owning user can even read it) — never committed to git (the repository's `.gitignore` explicitly excludes `.env`), and different from the placeholder `.env.example` template that *is* committed, which only documents which variables need to be set.

## 3.5 Data persistence and backups

Beyond the two named Docker volumes already covered in 3.2 (which handle "surviving a normal redeploy"), there's a second, independent layer of protection against actual data loss: a small backup script,

```bash
#!/bin/bash
set -euo pipefail
cd /opt/arp
BACKUP_DIR=/opt/arp/backups
STAMP=$(date +%Y-%m-%d_%H%M)
docker compose exec -T db pg_dump -U arp arp | gzip > "$BACKUP_DIR/arp_${STAMP}.sql.gz"
find "$BACKUP_DIR" -name "arp_*.sql.gz" -mtime +14 -delete
```

scheduled via a nightly cron job (`17 3 * * *`, i.e. 3:17 AM every day — an arbitrary off-peak time). `pg_dump` produces a complete logical SQL dump of the database (every table's schema and data as plain `INSERT` statements) which is piped straight through `gzip` to keep the stored file small, timestamped, and written into `/opt/arp/backups/`. The `find ... -mtime +14 -delete` line is simple retention: any backup file older than 14 days gets deleted automatically, so this can run forever without slowly filling the disk. `set -euo pipefail` at the top is a standard "fail loudly" safety habit for shell scripts — exit immediately on any command failure, on any use of an undefined variable, or if any command in a pipe fails (not just the last one) — so a broken backup fails visibly (in the cron log) rather than silently producing an empty or corrupt file that nobody notices until it's needed.

## 3.6 One command to see it all running

Putting the whole deployment together, this is genuinely everything needed to stand this project up on a fresh server, in order:

```bash
git clone <repo>                 # or rsync the backend/, data/, docker-compose.yml over
cp .env.example .env              # then edit in real POSTGRES_PASSWORD / JWT_SECRET
docker compose up -d --build      # builds the Go binary inside Docker, starts Postgres + the API
# separately, once: install + configure Caddy, add the DNS record
```

From that point on, `docker compose logs backend -f` tails live request logs, `docker compose exec db psql -U arp -d arp` opens a direct SQL shell into the live database, and `docker compose restart backend` picks up a fresh image after a `git pull` + rebuild — the entire operational surface of this project, end to end.
