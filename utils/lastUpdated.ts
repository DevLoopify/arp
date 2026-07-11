export function getLastUpdatedLabel(now: Date = new Date()): string {
    return `${now.getHours()}h`;
}
