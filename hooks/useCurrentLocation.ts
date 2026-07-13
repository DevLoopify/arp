import { Coordinate } from '@/utils/geo';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export default function useCurrentLocation() {
    const [location, setLocation] = useState<Coordinate | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        async function loadCurrentLocation() {
            const { status } = await Location.requestForegroundPermissionsAsync();
            const permissionWasGranted = status === 'granted';

            if (!permissionWasGranted) {
                return;
            }

            setPermissionGranted(true);

            const position = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        }

        loadCurrentLocation();
    }, []);

    return { location, permissionGranted };
}
