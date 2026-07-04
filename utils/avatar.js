export function getAvatarUri(seed) {
    const imageId = (Math.abs(seed) % 70) + 1;
    return `https://i.pravatar.cc/150?img=${imageId}`;
}
