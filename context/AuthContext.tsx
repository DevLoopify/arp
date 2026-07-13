import { api, ApiError, User } from '@/utils/api';
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = 'arp_auth_token';

type AuthContextValue = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function restoreSession() {
            const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const me = await api.auth.me(storedToken);
                setToken(storedToken);
                setUser(me);
            } catch (err) {
                const isExpiredToken = err instanceof ApiError && err.status === 401;
                if (isExpiredToken) {
                    await SecureStore.deleteItemAsync(TOKEN_KEY);
                }
            } finally {
                setIsLoading(false);
            }
        }

        restoreSession();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { token: newToken, user: newUser } = await api.auth.login(email, password);
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
        setUser(newUser);
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const { token: newToken, user: newUser } = await api.auth.register(name, email, password);
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
        setUser(newUser);
    }, []);

    const logout = useCallback(async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, token, isLoading, login, register, logout, updateUser: setUser }),
        [user, token, isLoading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
