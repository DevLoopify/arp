import Colors from '@/constants/Colors';
import crowdLevels from '@/constants/crowdLevels';
import Typography from '@/constants/Typography';
import { areaPath, CHART_HEIGHT, linePath } from '@/utils/crowdChartMath';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function CrowdChart({ average, today, currentHour = new Date().getHours() }) {
    const [selectedHour, setSelectedHour] = useState(null);
    const [width, setWidth] = useState(0);
    const visibleToday = today.slice(0, currentHour + 1);

    return (
        <View>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={styles.legendSwatchAverage} />
                    <Text style={styles.legendText}>Average</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={styles.legendSwatchToday} />
                    <Text style={styles.legendText}>Today</Text>
                </View>
            </View>

            <View style={styles.chart} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
                {width > 0 && (
                    <Svg width={width} height={CHART_HEIGHT}>
                        <Path d={areaPath(average, width, average.length)} fill={Colors.primary} fillOpacity={0.15} />
                        <Path
                            d={linePath(average, width, average.length)}
                            stroke={Colors.primary}
                            strokeWidth={2}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <Path
                            d={linePath(visibleToday, width, today.length)}
                            stroke={Colors.backgroundWhite}
                            strokeWidth={4}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <Path
                            d={linePath(visibleToday, width, today.length)}
                            stroke={Colors.live}
                            strokeWidth={2}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                )}

                <View style={styles.touchRow}>
                    {average.map((_, hour) => (
                        <Pressable key={hour} style={styles.touchCell} onPress={() => setSelectedHour(hour)} />
                    ))}
                </View>
            </View>

            <View style={styles.hourLabels}>
                {average.map((_, hour) => (
                    <Text key={hour} style={styles.hourLabel}>
                        {hour % 4 === 0 ? hour : ''}
                    </Text>
                ))}
            </View>

            <Text style={styles.detail}>
                {selectedHour !== null
                    ? `${selectedHour}:00 — Today: ${selectedHour <= currentHour ? crowdLevels[today[selectedHour]].label : 'not yet recorded'}, Average: ${crowdLevels[average[selectedHour]].label}`
                    : 'Tap an hour to see details'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendSwatchToday: {
        width: 10,
        height: 2,
        borderRadius: 1,
        backgroundColor: Colors.live,
    },
    legendSwatchAverage: {
        width: 10,
        height: 2,
        borderRadius: 1,
        backgroundColor: Colors.primary,
    },
    legendText: {
        ...Typography.caption,
        fontSize: 12,
        color: Colors.textMuted,
    },
    chart: {
        height: CHART_HEIGHT,
    },
    touchRow: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
    },
    touchCell: {
        flex: 1,
    },
    hourLabels: {
        flexDirection: 'row',
        marginTop: 4,
    },
    hourLabel: {
        ...Typography.caption,
        flex: 1,
        fontSize: 10,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    detail: {
        ...Typography.caption,
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: 4,
    },
});
