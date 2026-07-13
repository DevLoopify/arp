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

        const currentToken = token;

        async function loadFavourites() {
            const ids = await api.favourites.list(currentToken);
            setFavouriteIds(new Set(ids));
        }

        loadFavourites();
    }, [token]);

    const toggleFavourite = useCallback(
        (id: number) => {
            if (!token) return;

            const currentToken = token;

            function revertRemoval() {
                setFavouriteIds((current) => new Set(current).add(id));
            }

            function revertAddition() {
                setFavouriteIds((current) => {
                    const reverted = new Set(current);
                    reverted.delete(id);
                    return reverted;
                });
            }

            setFavouriteIds((previous) => {
                const next = new Set(previous);
                const isCurrentlyFavourite = next.has(id);

                if (isCurrentlyFavourite) {
                    next.delete(id);
                    api.favourites.remove(currentToken, id).catch(revertRemoval);
                } else {
                    next.add(id);
                    api.favourites.add(currentToken, id).catch(revertAddition);
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
