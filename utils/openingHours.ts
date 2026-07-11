export type OpeningStatus = {
    isOpen: boolean;
    label: string;
};

function toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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

    return {
        isOpen,
        label: isOpen ? `Closes at ${closesAt}` : `Opens at ${opensAt}`,
    };
}
