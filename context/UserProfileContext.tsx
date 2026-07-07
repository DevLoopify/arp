import { Directory, File, Paths } from 'expo-file-system';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const profileFile = new File(Paths.document, 'user_profile_settings.json');
const avatarsDir = new Directory(Paths.document, 'profile-photos');

export type NoiseLevel = 'quiet' | 'average' | 'noisy';
export type WorkMode = 'solo' | 'group';
export type DistanceUnit = 'km' | 'mi';
export type Language = 'en' | 'de';

export type UserProfileSettings = {
    name: string;
    avatarUri: string | null;
    noiseLevel: NoiseLevel;
    radius: number;
    workMode: WorkMode;
    utilities: string[];
    unit: DistanceUnit;
    language: Language;
};

export const DEFAULT_PROFILE_SETTINGS: UserProfileSettings = {
    name: '',
    avatarUri: null,
    noiseLevel: 'average',
    radius: 500,
    workMode: 'solo',
    utilities: [],
    unit: 'km',
    language: 'en',
};

function persistAvatar(uri: string | null): string | null {
    if (!uri) return null;
    if (uri.startsWith(avatarsDir.uri)) return uri;

    if (!avatarsDir.exists) {
        avatarsDir.create();
    }
    const source = new File(uri);
    const destination = new File(avatarsDir, `${Date.now()}-${source.name}`);
    source.copy(destination);
    return destination.uri;
}

async function loadProfileSettings(): Promise<UserProfileSettings> {
    if (!profileFile.exists) return DEFAULT_PROFILE_SETTINGS;
    const raw = await profileFile.text();
    return { ...DEFAULT_PROFILE_SETTINGS, ...JSON.parse(raw) };
}

type UserProfileContextValue = {
    settings: UserProfileSettings;
    isLoaded: boolean;
    saveSettings: (settings: UserProfileSettings) => Promise<UserProfileSettings>;
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<UserProfileSettings>(DEFAULT_PROFILE_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadProfileSettings().then((loaded) => {
            setSettings(loaded);
            setIsLoaded(true);
        });
    }, []);

    const saveSettings = useCallback(async (next: UserProfileSettings) => {
        const toSave: UserProfileSettings = { ...next, avatarUri: persistAvatar(next.avatarUri) };
        profileFile.write(JSON.stringify(toSave, null, 2));
        setSettings(toSave);
        return toSave;
    }, []);

    const value = useMemo(() => ({ settings, isLoaded, saveSettings }), [settings, isLoaded, saveSettings]);

    return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
}
