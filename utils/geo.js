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
