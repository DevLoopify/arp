export const levelOrder = ['empty', 'slightly_crowded', 'medium_full', 'very_crowded'];

export const CHART_HEIGHT = 100;
export const TOP_PADDING = 10;

function levelY(level) {
    const value = levelOrder.indexOf(level) / (levelOrder.length - 1);
    return TOP_PADDING + (1 - value) * (CHART_HEIGHT - TOP_PADDING);
}

export function linePath(levels, width, totalHours) {
    return levels
        .map((level, hour) => {
            const x = (hour / (totalHours - 1)) * width;
            const y = levelY(level);
            return `${hour === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
}

export function areaPath(levels, width, totalHours) {
    return `${linePath(levels, width, totalHours)} L ${width} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;
}
