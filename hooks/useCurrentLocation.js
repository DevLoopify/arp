import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

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
