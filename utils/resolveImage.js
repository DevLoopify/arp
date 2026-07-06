const imageMap = {
    'Unknown.jpg': require('../assets/images/Unknown.jpg'),
    'Unknown-2.jpg': require('../assets/images/Unknown-2.jpg'),
    'Unknown-3.jpg': require('../assets/images/Unknown-3.jpg'),
    'Unknown-4.jpg': require('../assets/images/Unknown-4.jpg'),
    'Unknown-5.jpg': require('../assets/images/Unknown-5.jpg'),
    'Unknown-6.jpg': require('../assets/images/Unknown-6.jpg'),
    'Unknown-7.jpg': require('../assets/images/Unknown-7.jpg'),
    'Unknown-8.jpg': require('../assets/images/Unknown-8.jpg'),
    'Unknown-9.jpg': require('../assets/images/Unknown-9.jpg'),
    'unnamed.jpg': require('../assets/images/unnamed.jpg'),
    'Luisenplatz Darmstadt Innenstadt Entwicklungskonzept 09062023.webp': require('../assets/images/Luisenplatz Darmstadt Innenstadt Entwicklungskonzept 09062023.webp'),
};

import { resolveApiUrl } from './api';

export function resolveImage(path) {
    const filename = path.split('/').pop();
    if (imageMap[filename]) return imageMap[filename];
    return { uri: resolveApiUrl(path) };
}
