export type OpeningStatus = {
    isOpen: boolean;
    label: string;
};

const MINUTES_PER_DAY = 24 * 60;
const SOON_THRESHOLD_MINUTES = 60;

function toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Minutes from `fromMinutes` until the next occurrence of `targetMinutes`,
// wrapping around midnight (always in [0, MINUTES_PER_DAY)).
function minutesUntil(targetMinutes: number, fromMinutes: number): number {
    return ((targetMinutes - fromMinutes) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

function formatRelative(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.round(minutes / 60)}h`;
}

export function getOpeningStatus(
    opensAt?: string | null,
    closesAt?: string | null,
    now: Date = new Date()
): OpeningStatus | null {
    if (!opensAt || !closesAt) return null;

    const openMinutes = toMinutes(opensAt);
    const closeMinutes = toMinutes(closesAt);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // closesAt <= opensAt means the place stays open past midnight (e.g. 18:00 - 02:00).
    const spansMidnight = closeMinutes <= openMinutes;
    const isOpen = spansMidnight
        ? nowMinutes >= openMinutes || nowMinutes < closeMinutes
        : nowMinutes >= openMinutes && nowMinutes < closeMinutes;

    const minutesUntilChange = isOpen
        ? minutesUntil(closeMinutes, nowMinutes)
        : minutesUntil(openMinutes, nowMinutes);

    const isSoon = minutesUntilChange <= SOON_THRESHOLD_MINUTES;
    const label = isOpen
        ? isSoon
            ? `Closes in ${formatRelative(minutesUntilChange)}`
            : `Closes at ${closesAt}`
        : isSoon
            ? `Opens in ${formatRelative(minutesUntilChange)}`
            : `Opens at ${opensAt}`;

    return { isOpen, label };
}
