import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type FavouritesContextValue = {
    favouriteIds: Set<number>;
    isFavourite: (id: number) => boolean;
    toggleFavourite: (id: number) => void;
};

const FavouritesContext = createContext<FavouritesContextValue | undefined>(undefined);

export function FavouritesProvider({ children }: { children: ReactNode }) {
    const [favouriteIds, setFavouriteIds] = useState<Set<number>>(new Set());

    const toggleFavourite = useCallback((id: number) => {
        setFavouriteIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const isFavourite = useCallback((id: number) => favouriteIds.has(id), [favouriteIds]);

    const value = useMemo(
        () => ({ favouriteIds, isFavourite, toggleFavourite }),
        [favouriteIds, isFavourite, toggleFavourite]
    );

    return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
    const context = useContext(FavouritesContext);
    if (!context) {
        throw new Error('useFavourites must be used within a FavouritesProvider');
    }
    return context;
}
