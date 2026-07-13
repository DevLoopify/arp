import { getDistanceKm } from './geo';

function matchesNoise(workplace, noiseLevel) {
    const noNoiseFilterSet = !noiseLevel;
    if (noNoiseFilterSet) {
        return true;
    }

    return workplace.noise <= noiseLevel;
}

function matchesUtilities(workplace, utilities) {
    const noUtilitiesFilterSet = !utilities?.length;
    if (noUtilitiesFilterSet) {
        return true;
    }

    return utilities.every((utility) => workplace.utilities?.includes(utility));
}

function matchesRadius(workplace, userLocation, radiusMeters) {
    const noRadiusFilterSet = !radiusMeters || !userLocation;
    if (noRadiusFilterSet) {
        return true;
    }

    const distanceMeters = getDistanceKm(userLocation, workplace) * 1000;
    return distanceMeters <= radiusMeters;
}

function matchesWorkMode(workplace, groupWorkOnly) {
    const noWorkModeFilterSet = !groupWorkOnly;
    if (noWorkModeFilterSet) {
        return true;
    }

    return workplace.workMode === 'group' || workplace.workMode === 'both';
}

export function applyFilters(workplaces, filters, userLocation) {
    return workplaces.filter((workplace) => {
        const noiseMatches = matchesNoise(workplace, filters.noiseLevel);
        const utilitiesMatch = matchesUtilities(workplace, filters.utilities);
        const radiusMatches = matchesRadius(workplace, userLocation, filters.radiusMeters);
        const workModeMatches = matchesWorkMode(workplace, filters.groupWorkOnly);

        return noiseMatches && utilitiesMatch && radiusMatches && workModeMatches;
    });
}
