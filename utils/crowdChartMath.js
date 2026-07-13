export const levelOrder = ['empty', 'slightly_crowded', 'medium_full', 'very_crowded'];

export const CHART_HEIGHT = 100;
export const TOP_PADDING = 10;

function levelToY(level) {
    const levelIndex = levelOrder.indexOf(level);
    const maxLevelIndex = levelOrder.length - 1;
    const normalizedValue = levelIndex / maxLevelIndex;

    const invertedValue = 1 - normalizedValue;
    const availableHeight = CHART_HEIGHT - TOP_PADDING;

    return TOP_PADDING + invertedValue * availableHeight;
}

export function linePath(levels, width, totalHours) {
    const points = levels.map((level, hour) => {
        const x = (hour / (totalHours - 1)) * width;
        const y = levelToY(level);

        const isFirstPoint = hour === 0;
        const command = isFirstPoint ? 'M' : 'L';

        return `${command} ${x} ${y}`;
    });

    return points.join(' ');
}

export function areaPath(levels, width, totalHours) {
    const line = linePath(levels, width, totalHours);
    return `${line} L ${width} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;
}
