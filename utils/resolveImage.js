import { resolveApiUrl } from './api';

export function resolveImage(path) {
    return { uri: resolveApiUrl(path) };
}
