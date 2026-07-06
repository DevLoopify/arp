import { useAuth } from '@/context/AuthContext';
import { api, Review, Workplace } from '@/utils/api';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type NewWorkplaceEntry = {
    name: string;
    description: string;
    utilities: string[];
    location: { latitude: number; longitude: number };
    photoUris: string[];
};

type WorkplacesContextValue = {
    workplaces: Workplace[];
    isLoading: boolean;
    refresh: () => Promise<void>;
    addWorkplace: (entry: NewWorkplaceEntry) => Promise<Workplace>;
    addReview: (workplaceId: number, payload: { rating: number; comment: string }) => Promise<Review>;
};

const WorkplacesContext = createContext<WorkplacesContextValue | undefined>(undefined);

export function WorkplacesProvider({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        const list = await api.workplaces.list();
        setWorkplaces(list);
    }, []);

    useEffect(() => {
        refresh().finally(() => setIsLoading(false));
    }, [refresh]);

    const addWorkplace = useCallback(
        async (entry: NewWorkplaceEntry) => {
            if (!token) throw new Error('You must be logged in to add a workplace.');

            const uploaded = await Promise.all(entry.photoUris.map((uri) => api.uploads.upload(token, uri)));

            const workplace = await api.workplaces.create(token, {
                title: entry.name,
                description: entry.description,
                latitude: entry.location.latitude,
                longitude: entry.location.longitude,
                utilities: entry.utilities,
                images: uploaded.map((u) => u.url),
            });

            await refresh();
            return workplace;
        },
        [token, refresh]
    );

    const addReview = useCallback(
        async (workplaceId: number, payload: { rating: number; comment: string }) => {
            if (!token) throw new Error('You must be logged in to add a review.');
            const review = await api.reviews.create(token, workplaceId, payload);
            await refresh();
            return review;
        },
        [token, refresh]
    );

    const value = useMemo(
        () => ({ workplaces, isLoading, refresh, addWorkplace, addReview }),
        [workplaces, isLoading, refresh, addWorkplace, addReview]
    );

    return <WorkplacesContext.Provider value={value}>{children}</WorkplacesContext.Provider>;
}

export function useWorkplaces() {
    const context = useContext(WorkplacesContext);
    if (!context) {
        throw new Error('useWorkplaces must be used within a WorkplacesProvider');
    }
    return context;
}
