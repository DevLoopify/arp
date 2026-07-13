import { useAuth } from '@/context/AuthContext';
import { UserProfileSettings, useUserProfile } from '@/context/UserProfileContext';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type NoiseLevel = 1 | 2 | 3 | 4 | 5 | null;

export type Filters = {
    noiseLevel: NoiseLevel;
    radiusMeters: number | null;
    utilities: string[];
    groupWorkOnly: boolean;
};

export const DEFAULT_FILTERS: Filters = {
    noiseLevel: null,
    radiusMeters: null,
    utilities: [],
    groupWorkOnly: false,
};

export function filtersFromProfileSettings(settings: UserProfileSettings): Filters {
    return {
        noiseLevel: settings.noiseLevel,
        radiusMeters: settings.radius,
        utilities: settings.utilities,
        groupWorkOnly: settings.workMode === 'group',
    };
}

type FiltersContextValue = {
    filters: Filters;
    defaultFilters: Filters;
    setFilters: (filters: Filters) => void;
    resetFilters: () => void;
};

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
    const { settings, isLoaded } = useUserProfile();
    const { user } = useAuth();

    const defaultFilters: Filters = useMemo(() => filtersFromProfileSettings(settings), [settings]);

    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const previousUserId = useRef<number | null>(null);

    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        const currentUserId = user?.id ?? null;
        const justLoggedIn = currentUserId !== null && previousUserId.current === null;
        previousUserId.current = currentUserId;

        if (justLoggedIn) {
            setFilters(defaultFilters);
        }
    }, [isLoaded, user, defaultFilters]);

    const resetFilters = useCallback(() => {
        setFilters(defaultFilters);
    }, [defaultFilters]);

    const value = useMemo(
        () => ({ filters, defaultFilters, setFilters, resetFilters }),
        [filters, defaultFilters, resetFilters]
    );

    return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
    const context = useContext(FiltersContext);
    if (!context) {
        throw new Error('useFilters must be used within a FiltersProvider');
    }
    return context;
}
