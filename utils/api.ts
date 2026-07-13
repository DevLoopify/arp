import Constants from 'expo-constants';

export const API_URL: string = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:8080/api';

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

function buildRequestHeaders(
    hasBody: boolean,
    token: string | undefined,
    extraHeaders: HeadersInit | undefined
): HeadersInit {
    const headers: Record<string, string> = {};

    if (hasBody) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return { ...headers, ...extraHeaders };
}

async function readErrorMessage(res: Response): Promise<string> {
    try {
        const body = await res.json();
        return body.error ?? res.statusText;
    } catch {
        return res.statusText;
    }
}

async function request<T>(path: string, options: RequestInit & { token?: string } = {}): Promise<T> {
    const { token, headers, ...rest } = options;
    const hasBody = Boolean(rest.body);

    const res = await fetch(`${API_URL}${path}`, {
        ...rest,
        headers: buildRequestHeaders(hasBody, token, headers),
    });

    if (!res.ok) {
        const message = await readErrorMessage(res);
        throw new ApiError(res.status, message);
    }

    const hasNoContent = res.status === 204;
    if (hasNoContent) {
        return undefined as T;
    }

    return res.json();
}

export function resolveApiUrl(path: string): string {
    const isAbsoluteUrl = /^https?:\/\//.test(path);
    if (isAbsoluteUrl) {
        return path;
    }

    const baseUrlWithoutApiSuffix = API_URL.replace(/\/api\/?$/, '');
    return `${baseUrlWithoutApiSuffix}${path}`;
}

function getMimeTypeForExtension(extension: string): string {
    if (extension === 'png') {
        return 'image/png';
    }

    if (extension === 'webp') {
        return 'image/webp';
    }

    return 'image/jpeg';
}

export type User = {
    id: number;
    name: string;
    email: string;
    avatarUrl: string;
    noiseLevel: number;
    radius: number;
    workMode: string;
    utilities: string[];
    unit: string;
    language: string;
    createdAt: string;
};
export type ProfileUpdatePayload = {
    name: string;
    avatarUrl: string;
    noiseLevel: number;
    radius: number;
    workMode: string;
    utilities: string[];
    unit: string;
    language: string;
};
export type AuthResponse = { token: string; user: User };
export type Review = { id: number; userId?: number; author: string; rating: number; comment: string; date: string };
export type WorkplacePayload = {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    utilities: string[];
    images: string[];
    workMode: string;
    opensAt: string | null;
    closesAt: string | null;
};
export type Workplace = {
    id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    utilities: string[];
    noise: number;
    images: string[];
    workMode: string;
    rating: number;
    crowdedness: string;
    crowdByHourAverage: string[];
    crowdByHourToday: string[];
    phoneNumber: string;
    email: string;
    opensAt?: string;
    closesAt?: string;
    ownerUserId?: number;
    reviews: Review[];
};

export type AppNotification = { message: string; action: string };

export const api = {
    auth: {
        register: (name: string, email: string, password: string) => {
            const body = JSON.stringify({ name, email, password });
            return request<AuthResponse>('/auth/register', { method: 'POST', body });
        },
        login: (email: string, password: string) => {
            const body = JSON.stringify({ email, password });
            return request<AuthResponse>('/auth/login', { method: 'POST', body });
        },
        me: (token: string) => request<User>('/auth/me', { token }),
        updateProfile: (token: string, payload: ProfileUpdatePayload) =>
            request<User>('/auth/me', { method: 'PUT', token, body: JSON.stringify(payload) }),
    },
    workplaces: {
        list: () => request<Workplace[]>('/workplaces'),
        get: (id: number) => request<Workplace>(`/workplaces/${id}`),
        create: (token: string, payload: WorkplacePayload) =>
            request<Workplace>('/workplaces', { method: 'POST', token, body: JSON.stringify(payload) }),
        update: (token: string, id: number, payload: WorkplacePayload) =>
            request<Workplace>(`/workplaces/${id}`, { method: 'PUT', token, body: JSON.stringify(payload) }),
        remove: (token: string, id: number) => request<void>(`/workplaces/${id}`, { method: 'DELETE', token }),
    },
    reviews: {
        create: (token: string, workplaceId: number, payload: { rating: number; comment: string }) =>
            request<Review>(`/workplaces/${workplaceId}/reviews`, { method: 'POST', token, body: JSON.stringify(payload) }),
        update: (token: string, reviewId: number, payload: { rating: number; comment: string }) =>
            request<Review>(`/reviews/${reviewId}`, { method: 'PUT', token, body: JSON.stringify(payload) }),
        remove: (token: string, reviewId: number) => request<void>(`/reviews/${reviewId}`, { method: 'DELETE', token }),
    },
    favourites: {
        list: (token: string) => request<number[]>('/favourites', { token }),
        add: (token: string, workplaceId: number) => request<void>(`/favourites/${workplaceId}`, { method: 'POST', token }),
        remove: (token: string, workplaceId: number) => request<void>(`/favourites/${workplaceId}`, { method: 'DELETE', token }),
    },
    notifications: {
        poll: (token: string) =>
            request<{ notification: AppNotification | null }>('/notifications/poll', { token }),
    },
    uploads: {
        upload: async (token: string, fileUri: string): Promise<{ url: string }> => {
            const filename = fileUri.split('/').pop() ?? 'photo.jpg';
            const extensionMatch = /\.(\w+)$/.exec(filename);
            const extension = (extensionMatch?.[1] ?? 'jpg').toLowerCase();
            const mimeType = getMimeTypeForExtension(extension);

            const form = new FormData();
            form.append('image', { uri: fileUri, name: filename, type: mimeType } as unknown as Blob);

            const res = await fetch(`${API_URL}/uploads`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });

            if (!res.ok) {
                throw new ApiError(res.status, 'upload failed');
            }

            return res.json();
        },
    },
};
