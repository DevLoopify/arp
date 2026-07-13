export type Coordinate = {
    latitude: number;
    longitude: number;
};

function degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

export function getDistanceKm(from: Coordinate, to: Coordinate): number {
    const earthRadiusKm = 6371;

    const latitudeDifference = degreesToRadians(to.latitude - from.latitude);
    const longitudeDifference = degreesToRadians(to.longitude - from.longitude);

    const fromLatitudeInRadians = degreesToRadians(from.latitude);
    const toLatitudeInRadians = degreesToRadians(to.latitude);

    const haversineValue =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(fromLatitudeInRadians) *
            Math.cos(toLatitudeInRadians) *
            Math.sin(longitudeDifference / 2) ** 2;

    const angularDistance =
        2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

    return earthRadiusKm * angularDistance;
}

export function formatDistance(km: number): string {
    const isLessThanOneKilometer = km < 1;

    if (isLessThanOneKilometer) {
        const meters = Math.round(km * 1000);
        return `${meters} m away`;
    }

    const roundedKm = km.toFixed(1);
    return `${roundedKm} km away`;
}
