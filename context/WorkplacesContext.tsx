import { useAuth } from '@/context/AuthContext';
import { api, Review, Workplace } from '@/utils/api';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type NewWorkplaceEntry = {
    name: string;
    description: string;
    utilities: string[];
    workMode: string;
    location: { latitude: number; longitude: number };
    photoUris: string[];
};

export type WorkplaceEdit = {
    name: string;
    description: string;
    utilities: string[];
    workMode: string;
    location: { latitude: number; longitude: number };
    existingImages: string[];
    newPhotoUris: string[];
};

type WorkplacesContextValue = {
    workplaces: Workplace[];
    isLoading: boolean;
    refresh: () => Promise<void>;
    addWorkplace: (entry: NewWorkplaceEntry) => Promise<Workplace>;
    updateWorkplace: (id: number, entry: WorkplaceEdit) => Promise<Workplace>;
    deleteWorkplace: (id: number) => Promise<void>;
    addReview: (workplaceId: number, payload: { rating: number; comment: string }) => Promise<Review>;
    updateReview: (reviewId: number, payload: { rating: number; comment: string }) => Promise<Review>;
    deleteReview: (reviewId: number) => Promise<void>;
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
                workMode: entry.workMode,
                images: uploaded.map((u) => u.url),
            });

            await refresh();
            return workplace;
        },
        [token, refresh]
    );

    const updateWorkplace = useCallback(
        async (id: number, entry: WorkplaceEdit) => {
            if (!token) throw new Error('You must be logged in to edit a workplace.');

            const uploaded = await Promise.all(entry.newPhotoUris.map((uri) => api.uploads.upload(token, uri)));

            const workplace = await api.workplaces.update(token, id, {
                title: entry.name,
                description: entry.description,
                latitude: entry.location.latitude,
                longitude: entry.location.longitude,
                utilities: entry.utilities,
                workMode: entry.workMode,
                images: [...entry.existingImages, ...uploaded.map((u) => u.url)],
            });

            await refresh();
            return workplace;
        },
        [token, refresh]
    );

    const deleteWorkplace = useCallback(
        async (id: number) => {
            if (!token) throw new Error('You must be logged in to delete a workplace.');
            await api.workplaces.remove(token, id);
            await refresh();
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

    const updateReview = useCallback(
        async (reviewId: number, payload: { rating: number; comment: string }) => {
            if (!token) throw new Error('You must be logged in to edit a review.');
            const review = await api.reviews.update(token, reviewId, payload);
            await refresh();
            return review;
        },
        [token, refresh]
    );

    const deleteReview = useCallback(
        async (reviewId: number) => {
            if (!token) throw new Error('You must be logged in to delete a review.');
            await api.reviews.remove(token, reviewId);
            await refresh();
        },
        [token, refresh]
    );

    const value = useMemo(
        () => ({
            workplaces,
            isLoading,
            refresh,
            addWorkplace,
            updateWorkplace,
            deleteWorkplace,
            addReview,
            updateReview,
            deleteReview,
        }),
        [workplaces, isLoading, refresh, addWorkplace, updateWorkplace, deleteWorkplace, addReview, updateReview, deleteReview]
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
