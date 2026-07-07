import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type VirtualLocation = {
    latitude: number;
    longitude: number;
    label: string;
};

const MAX_HISTORY = 5;

type SearchLocationContextValue = {
    searchLocation: VirtualLocation | null;
    history: VirtualLocation[];
    setSearchLocation: (location: VirtualLocation) => void;
    clearSearchLocation: () => void;
};

const SearchLocationContext = createContext<SearchLocationContextValue | undefined>(undefined);

export function SearchLocationProvider({ children }: { children: ReactNode }) {
    const [searchLocation, setSearchLocationState] = useState<VirtualLocation | null>(null);
    const [history, setHistory] = useState<VirtualLocation[]>([]);

    const value = useMemo(
        () => ({
            searchLocation,
            history,
            setSearchLocation: (location: VirtualLocation) => {
                setSearchLocationState(location);
                setHistory((prev) => [
                    location,
                    ...prev.filter((entry) => entry.label !== location.label),
                ].slice(0, MAX_HISTORY));
            },
            clearSearchLocation: () => setSearchLocationState(null),
        }),
        [searchLocation, history]
    );

    return <SearchLocationContext.Provider value={value}>{children}</SearchLocationContext.Provider>;
}

export function useSearchLocation() {
    const context = useContext(SearchLocationContext);
    if (!context) {
        throw new Error('useSearchLocation must be used within a SearchLocationProvider');
    }
    return context;
}
