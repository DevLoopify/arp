import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { useRoulette } from '@/context/RouletteContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH * 0.78, 300);
const RADIUS = WHEEL_SIZE / 2;

const SLICE_COLORS = [
    '#F43378',
    '#2563EB',
    '#16A34A',
    '#F59E0B',
    '#8B5CF6',
    '#0EA5E9',
    '#DC2626',
    '#14B8A6',
];

function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeSlice(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

function truncateLabel(label, sliceCount) {
    const maxLength = sliceCount > 6 ? 10 : 16;
    return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

export default function RouletteWheel({ visible, onClose, workplaces }) {
    const { toggleRoulette, clearRoulette } = useRoulette();
    const [displayItems, setDisplayItems] = useState(workplaces);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const rotation = useSharedValue(0);
    const winnerItemsRef = useRef([]);

    useEffect(() => {
        if (!spinning) {
            setDisplayItems(workplaces);
        }
    }, [workplaces, spinning]);

    useEffect(() => {
        if (!visible) {
            setWinner(null);
        }
    }, [visible]);

    const animatedWheelStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const handleSpinEnd = (finalRotation) => {
        const items = winnerItemsRef.current;
        const normalized = ((finalRotation % 360) + 360) % 360;
        const anglePerSlice = 360 / items.length;
        const localAngle = (360 - normalized) % 360;
        const index = Math.min(items.length - 1, Math.floor(localAngle / anglePerSlice));
        setWinner(items[index]);
        setSpinning(false);
    };

    const handleWinnerPress = () => {
        if (!winner) return;
        onClose();
        router.push({ pathname: '/(detail)/detail', params: { workplace: JSON.stringify(winner) } });
    };

    const handleSpin = () => {
        if (spinning || displayItems.length < 2) return;
        winnerItemsRef.current = displayItems;
        setWinner(null);
        setSpinning(true);

        const extraSpins = 5 + Math.floor(Math.random() * 3);
        const randomOffset = Math.random() * 360;
        const target = rotation.value + extraSpins * 360 + randomOffset;

        rotation.value = withTiming(
            target,
            { duration: 4200, easing: Easing.out(Easing.cubic) },
            (finished) => {
                if (finished) {
                    runOnJS(handleSpinEnd)(target);
                }
            }
        );
    };

    const anglePerSlice = displayItems.length > 0 ? 360 / displayItems.length : 0;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Spin the Wheel</Text>
                        <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.textPrimary} />
                        </Pressable>
                    </View>

                    {displayItems.length < 2 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="dice-outline" size={40} color={Colors.textMuted} />
                            <Text style={styles.emptyTitle}>Not enough places yet</Text>
                            <Text style={styles.emptyCopy}>
                                Tap the dice icon on at least two workplace cards to add them here,
                                then spin to let chance decide.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <View style={styles.wheelWrapper}>
                                <View style={styles.pointer} />
                                <Animated.View style={[{ width: WHEEL_SIZE, height: WHEEL_SIZE }, animatedWheelStyle]}>
                                    <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                                        {displayItems.map((item, index) => {
                                            const startAngle = index * anglePerSlice;
                                            const endAngle = startAngle + anglePerSlice;
                                            const midAngle = startAngle + anglePerSlice / 2;
                                            const labelPos = polarToCartesian(
                                                RADIUS,
                                                RADIUS,
                                                RADIUS * 0.62,
                                                midAngle
                                            );
                                            return (
                                                <React.Fragment key={item.id}>
                                                    <Path
                                                        d={describeSlice(RADIUS, RADIUS, RADIUS, startAngle, endAngle)}
                                                        fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                                                        stroke={Colors.backgroundWhite}
                                                        strokeWidth={2}
                                                    />
                                                    <SvgText
                                                        x={labelPos.x}
                                                        y={labelPos.y}
                                                        fill={Colors.textWhite}
                                                        fontSize={displayItems.length > 6 ? 11 : 13}
                                                        fontWeight="700"
                                                        textAnchor="middle"
                                                        transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}
                                                    >
                                                        {truncateLabel(item.title, displayItems.length)}
                                                    </SvgText>
                                                </React.Fragment>
                                            );
                                        })}
                                    </Svg>
                                </Animated.View>
                            </View>

                            {winner && !spinning && (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.winnerBanner,
                                        pressed && styles.winnerBannerPressed,
                                    ]}
                                    onPress={handleWinnerPress}
                                >
                                    <Ionicons name="trophy" size={20} color={Colors.primary} />
                                    <Text style={styles.winnerText}>{winner.title} wins!</Text>
                                    <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                                </Pressable>
                            )}

                            <Pressable
                                style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
                                onPress={handleSpin}
                                disabled={spinning}
                            >
                                <Text style={styles.spinButtonText}>
                                    {spinning ? 'Spinning…' : winner ? 'Spin again' : 'Spin'}
                                </Text>
                            </Pressable>

                            <View style={styles.chipRow}>
                                {displayItems.map((item, index) => (
                                    <View key={item.id} style={styles.chip}>
                                        <View
                                            style={[
                                                styles.chipDot,
                                                { backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] },
                                            ]}
                                        />
                                        <Text style={styles.chipText} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Pressable
                                            onPress={() => toggleRoulette(item.id)}
                                            disabled={spinning}
                                            hitSlop={8}
                                        >
                                            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>

                            <Pressable
                                onPress={clearRoulette}
                                disabled={spinning}
                                style={styles.clearAllButton}
                            >
                                <Text style={styles.clearAllText}>Clear all</Text>
                            </Pressable>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: Colors.backgroundWhite,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    title: {
        ...Typography.body,
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    closeButton: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    emptyTitle: {
        ...Typography.body,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    emptyCopy: {
        ...Typography.caption,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    wheelWrapper: {
        width: WHEEL_SIZE,
        height: WHEEL_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    pointer: {
        position: 'absolute',
        top: -6,
        zIndex: 2,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 18,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: Colors.textPrimary,
    },
    winnerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.backgroundSubtle,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginTop: 16,
    },
    winnerBannerPressed: {
        opacity: 0.7,
    },
    winnerText: {
        ...Typography.body,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    spinButton: {
        marginTop: 16,
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
        width: '100%',
        alignItems: 'center',
    },
    spinButtonDisabled: {
        opacity: 0.6,
    },
    spinButtonText: {
        ...Typography.body,
        fontWeight: '700',
        color: Colors.textWhite,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 20,
        width: '100%',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.backgroundBase,
        borderRadius: 14,
        paddingVertical: 6,
        paddingHorizontal: 10,
        maxWidth: '100%',
    },
    chipDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    chipText: {
        ...Typography.caption,
        color: Colors.textPrimary,
        maxWidth: 140,
    },
    clearAllButton: {
        marginTop: 12,
    },
    clearAllText: {
        ...Typography.caption,
        color: Colors.textMuted,
        textDecorationLine: 'underline',
    },
});
