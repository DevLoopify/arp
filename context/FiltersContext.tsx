import { useUserProfile } from '@/context/UserProfileContext';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type NoiseLevel = 1 | 2 | 3 | 4 | 5 | null;

export type Filters = {
    noiseLevel: NoiseLevel;
    radiusMeters: number | null;
    utilities: string[];
};

export const DEFAULT_FILTERS: Filters = {
    noiseLevel: null,
    radiusMeters: null,
    utilities: [],
};

type FiltersContextValue = {
    filters: Filters;
    defaultFilters: Filters;
    setFilters: (filters: Filters) => void;
    resetFilters: () => void;
};

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
    const { settings, isLoaded } = useUserProfile();

    const defaultFilters: Filters = useMemo(
        () => ({
            noiseLevel: settings.noiseLevel,
            radiusMeters: settings.radius,
            utilities: settings.utilities,
        }),
        [settings]
    );

    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const hasAppliedProfileDefaults = useRef(false);

    useEffect(() => {
        if (!isLoaded || hasAppliedProfileDefaults.current) return;
        hasAppliedProfileDefaults.current = true;
        setFilters(defaultFilters);
    }, [isLoaded, defaultFilters]);

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
