import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

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
    setFilters: (filters: Filters) => void;
    resetFilters: () => void;
};

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

    const value = useMemo(
        () => ({ filters, setFilters, resetFilters: () => setFilters(DEFAULT_FILTERS) }),
        [filters]
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
