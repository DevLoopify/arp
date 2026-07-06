import { Directory, File, Paths } from 'expo-file-system';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const workplacesFile = new File(Paths.document, 'customWorkplaces.json');
const photosDir = new Directory(Paths.document, 'workplace-photos');

export type CustomWorkplace = {
    id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    utilities: string[];
    images: string[];
};

export type NewWorkplaceEntry = {
    name: string;
    description: string;
    utilities: string[];
    location: { latitude: number; longitude: number };
    photoUris: string[];
};

function copyPhoto(uri: string) {
    if (!photosDir.exists) {
        photosDir.create();
    }
    const source = new File(uri);
    const destination = new File(photosDir, source.name);
    source.copy(destination);
    return destination.uri;
}

async function loadCustomWorkplaces(): Promise<CustomWorkplace[]> {
    if (!workplacesFile.exists) return [];
    const raw = await workplacesFile.text();
    return JSON.parse(raw);
}

const EMPTY_HOURS = Array(24).fill('empty');

export function toDisplayWorkplace(workplace: CustomWorkplace) {
    return {
        ...workplace,
        rating: 0,
        noise: 0,
        crowdedness: 'empty',
        reviews: [] as never[],
        crowdByHourAverage: EMPTY_HOURS,
        crowdByHourToday: EMPTY_HOURS,
    };
}

type CustomWorkplacesContextValue = {
    customWorkplaces: CustomWorkplace[];
    addWorkplace: (entry: NewWorkplaceEntry) => Promise<void>;
};

const CustomWorkplacesContext = createContext<CustomWorkplacesContextValue | undefined>(undefined);

export function CustomWorkplacesProvider({ children }: { children: ReactNode }) {
    const [customWorkplaces, setCustomWorkplaces] = useState<CustomWorkplace[]>([]);

    useEffect(() => {
        loadCustomWorkplaces().then(setCustomWorkplaces);
    }, []);

    const addWorkplace = useCallback(async (entry: NewWorkplaceEntry) => {
        const copiedPhotoUris = entry.photoUris.map(copyPhoto);
        const newWorkplace: CustomWorkplace = {
            id: Date.now(),
            title: entry.name,
            description: entry.description,
            latitude: entry.location.latitude,
            longitude: entry.location.longitude,
            utilities: entry.utilities,
            images: copiedPhotoUris,
        };

        setCustomWorkplaces((prev) => {
            const next = [...prev, newWorkplace];
            workplacesFile.write(JSON.stringify(next, null, 2));
            return next;
        });
    }, []);

    const value = useMemo(() => ({ customWorkplaces, addWorkplace }), [customWorkplaces, addWorkplace]);

    return <CustomWorkplacesContext.Provider value={value}>{children}</CustomWorkplacesContext.Provider>;
}

export function useCustomWorkplaces() {
    const context = useContext(CustomWorkplacesContext);
    if (!context) {
        throw new Error('useCustomWorkplaces must be used within a CustomWorkplacesProvider');
    }
    return context;
}
