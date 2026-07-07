import { useAuth } from '@/context/AuthContext';
import { api, resolveApiUrl } from '@/utils/api';
import { createContext, ReactNode, useCallback, useContext, useMemo } from 'react';

export type NoiseLevel = 1 | 2 | 3 | 4 | 5;
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
    noiseLevel: 3,
    radius: 500,
    workMode: 'solo',
    utilities: [],
    unit: 'km',
    language: 'en',
};

type UserProfileContextValue = {
    settings: UserProfileSettings;
    isLoaded: boolean;
    saveSettings: (settings: UserProfileSettings) => Promise<UserProfileSettings>;
};

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
    const { user, token, isLoading: authLoading, updateUser } = useAuth();

    const settings: UserProfileSettings = useMemo(() => {
        if (!user) return DEFAULT_PROFILE_SETTINGS;
        return {
            name: user.name,
            avatarUri: user.avatarUrl ? resolveApiUrl(user.avatarUrl) : null,
            noiseLevel: user.noiseLevel as NoiseLevel,
            radius: user.radius,
            workMode: user.workMode as WorkMode,
            utilities: user.utilities,
            unit: user.unit as DistanceUnit,
            language: user.language as Language,
        };
    }, [user]);

    const saveSettings = useCallback(
        async (next: UserProfileSettings) => {
            if (!token) throw new Error('You must be logged in to update your profile.');

            let avatarUrl = user?.avatarUrl ?? '';
            if (next.avatarUri && next.avatarUri !== settings.avatarUri) {
                const uploaded = await api.uploads.upload(token, next.avatarUri);
                avatarUrl = uploaded.url;
            } else if (!next.avatarUri) {
                avatarUrl = '';
            }

            const updated = await api.auth.updateProfile(token, {
                name: next.name,
                avatarUrl,
                noiseLevel: next.noiseLevel,
                radius: next.radius,
                workMode: next.workMode,
                utilities: next.utilities,
                unit: next.unit,
                language: next.language,
            });

            updateUser(updated);

            return {
                name: updated.name,
                avatarUri: updated.avatarUrl ? resolveApiUrl(updated.avatarUrl) : null,
                noiseLevel: updated.noiseLevel as NoiseLevel,
                radius: updated.radius,
                workMode: updated.workMode as WorkMode,
                utilities: updated.utilities,
                unit: updated.unit as DistanceUnit,
                language: updated.language as Language,
            };
        },
        [token, user, settings.avatarUri, updateUser]
    );

    const value = useMemo(
        () => ({ settings, isLoaded: !authLoading, saveSettings }),
        [settings, authLoading, saveSettings]
    );

    return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
}
