import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type FavouritesContextValue = {
    favouriteIds: Set<number>;
    isFavourite: (id: number) => boolean;
    toggleFavourite: (id: number) => void;
};

const FavouritesContext = createContext<FavouritesContextValue | undefined>(undefined);

export function FavouritesProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [favouriteIds, setFavouriteIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!token) {
            setFavouriteIds(new Set());
            return;
        }
        api.favourites.list(token).then((ids) => setFavouriteIds(new Set(ids)));
    }, [token]);

    const toggleFavourite = useCallback(
        (id: number) => {
            if (!token) return;

            setFavouriteIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) {
                    next.delete(id);
                    api.favourites.remove(token, id).catch(() => setFavouriteIds((cur) => new Set(cur).add(id)));
                } else {
                    next.add(id);
                    api.favourites.add(token, id).catch(() =>
                        setFavouriteIds((cur) => {
                            const reverted = new Set(cur);
                            reverted.delete(id);
                            return reverted;
                        })
                    );
                }
                return next;
            });
        },
        [token]
    );

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
