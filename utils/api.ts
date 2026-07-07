import Constants from 'expo-constants';

export const API_URL: string = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:8080/api';

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function request<T>(path: string, options: RequestInit & { token?: string } = {}): Promise<T> {
    const { token, headers, ...rest } = options;

    const res = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: {
            ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    });

    if (!res.ok) {
        let message = res.statusText;
        try {
            const body = await res.json();
            message = body.error ?? message;
        } catch {
        }
        throw new ApiError(res.status, message);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

export function resolveApiUrl(path: string): string {
    if (/^https?:\/\//.test(path)) return path;
    return `${API_URL.replace(/\/api\/?$/, '')}${path}`;
}

export type User = { id: number; name: string; email: string; createdAt: string };
export type AuthResponse = { token: string; user: User };
export type Review = { id: number; author: string; rating: number; comment: string; date: string };
export type Workplace = {
    id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    utilities: string[];
    noise: number;
    images: string[];
    rating: number;
    crowdedness: string;
    crowdByHourAverage: string[];
    crowdByHourToday: string[];
    phoneNumber: string;
    email: string;
    ownerUserId?: number;
    reviews: Review[];
};

export const api = {
    auth: {
        register: (name: string, email: string, password: string) =>
            request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
        login: (email: string, password: string) =>
            request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
        me: (token: string) => request<User>('/auth/me', { token }),
    },
    workplaces: {
        list: () => request<Workplace[]>('/workplaces'),
        get: (id: number) => request<Workplace>(`/workplaces/${id}`),
        create: (
            token: string,
            payload: { title: string; description: string; latitude: number; longitude: number; utilities: string[]; images: string[] }
        ) => request<Workplace>('/workplaces', { method: 'POST', token, body: JSON.stringify(payload) }),
    },
    reviews: {
        create: (token: string, workplaceId: number, payload: { rating: number; comment: string }) =>
            request<Review>(`/workplaces/${workplaceId}/reviews`, { method: 'POST', token, body: JSON.stringify(payload) }),
    },
    favourites: {
        list: (token: string) => request<number[]>('/favourites', { token }),
        add: (token: string, workplaceId: number) => request<void>(`/favourites/${workplaceId}`, { method: 'POST', token }),
        remove: (token: string, workplaceId: number) => request<void>(`/favourites/${workplaceId}`, { method: 'DELETE', token }),
    },
    uploads: {
        upload: async (token: string, fileUri: string): Promise<{ url: string }> => {
            const filename = fileUri.split('/').pop() ?? 'photo.jpg';
            const ext = (/\.(\w+)$/.exec(filename)?.[1] ?? 'jpg').toLowerCase();
            const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

            const form = new FormData();
            form.append('image', { uri: fileUri, name: filename, type: mimeType } as unknown as Blob);

            const res = await fetch(`${API_URL}/uploads`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
            if (!res.ok) throw new ApiError(res.status, 'upload failed');
            return res.json();
        },
    },
};
