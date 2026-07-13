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


function minutesUntil(targetMinutes: number, fromMinutes: number): number {
    const rawDifference = targetMinutes - fromMinutes;

    if (rawDifference < 0) {
        return rawDifference + MINUTES_PER_DAY;
    }

    return rawDifference;
}

function formatRelative(minutes: number): string {
    const isUnderAnHour = minutes < 60;

    if (isUnderAnHour) {
        return `${minutes}m`;
    }

    const hours = Math.round(minutes / 60);
    return `${hours}h`;
}

function isCurrentlyOpen(nowMinutes: number, openMinutes: number, closeMinutes: number): boolean {
    const spansMidnight = closeMinutes <= openMinutes;

    if (spansMidnight) {
        return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
    }

    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

function buildStatusLabel(
    isOpen: boolean,
    isSoon: boolean,
    minutesUntilChange: number,
    opensAt: string,
    closesAt: string
): string {
    if (isOpen && isSoon) {
        return `Closes in ${formatRelative(minutesUntilChange)}`;
    }

    if (isOpen && !isSoon) {
        return `Closes at ${closesAt}`;
    }

    if (!isOpen && isSoon) {
        return `Opens in ${formatRelative(minutesUntilChange)}`;
    }

    return `Opens at ${opensAt}`;
}

export function getOpeningStatus(
    opensAt?: string | null,
    closesAt?: string | null,
    now: Date = new Date()
): OpeningStatus | null {
    const hasNoOpeningHours = !opensAt || !closesAt;
    if (hasNoOpeningHours) {
        return null;
    }

    const openMinutes = toMinutes(opensAt);
    const closeMinutes = toMinutes(closesAt);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const isOpen = isCurrentlyOpen(nowMinutes, openMinutes, closeMinutes);

    let minutesUntilChange: number;
    if (isOpen) {
        minutesUntilChange = minutesUntil(closeMinutes, nowMinutes);
    } else {
        minutesUntilChange = minutesUntil(openMinutes, nowMinutes);
    }

    const isSoon = minutesUntilChange <= SOON_THRESHOLD_MINUTES;
    const label = buildStatusLabel(isOpen, isSoon, minutesUntilChange, opensAt, closesAt);

    return { isOpen, label };
}
