import { getDistanceKm } from './geo';

function matchesNoise(workplace, noiseLevel) {
    if (!noiseLevel) return true;
    return workplace.noise === noiseLevel;
}

function matchesUtilities(workplace, utilities) {
    if (!utilities?.length) return true;
    return utilities.every((utility) => workplace.utilities?.includes(utility));
}

function matchesRadius(workplace, userLocation, radiusMeters) {
    if (!radiusMeters || !userLocation) return true;
    return getDistanceKm(userLocation, workplace) * 1000 <= radiusMeters;
}

export function applyFilters(workplaces, filters, userLocation) {
    return workplaces.filter(
        (workplace) =>
            matchesNoise(workplace, filters.noiseLevel) &&
            matchesUtilities(workplace, filters.utilities) &&
            matchesRadius(workplace, userLocation, filters.radiusMeters)
    );
}
