import { Linking, Platform } from 'react-native';

const googleMapsWebUrl = (latitude: number, longitude: number) =>
    `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

export async function openDirections(latitude: number, longitude: number, label?: string) {
    const encodedLabel = encodeURIComponent(label ?? '');
    const url = Platform.select({
        ios: `maps://app?daddr=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
        default: googleMapsWebUrl(latitude, longitude),
    });

    try {
        await Linking.openURL(url);
    } catch {
        await Linking.openURL(googleMapsWebUrl(latitude, longitude));
    }
}
