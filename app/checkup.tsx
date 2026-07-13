import Colors from '@/constants/Colors';
import crowdLevels from '@/constants/crowdLevels';
import Typography from '@/constants/Typography';
import { NoiseLevel } from '@/context/UserProfileContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { ComponentProps, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const NOISE_LABELS: Record<NoiseLevel, string> = {
    1: 'Very quiet',
    2: 'Quiet',
    3: 'Moderate',
    4: 'Loud',
    5: 'Very loud',
};

const CROWD_KEYS = Object.keys(crowdLevels);

const MOCK_WORKPLACE_NAME = 'Workplace in Frankfurt';

function SliderSection({
    title,
    valueLabel,
    valueColor,
    valueIcon,
    minimumValue,
    maximumValue,
    value,
    onValueChange,
    tintColor,
    lowLabel,
    highLabel,
}: {
    title: string;
    valueLabel: string;
    valueColor: string;
    valueIcon?: ComponentProps<typeof Ionicons>['name'];
    minimumValue: number;
    maximumValue: number;
    value: number;
    onValueChange: (value: number) => void;
    tintColor: string;
    lowLabel: string;
    highLabel: string;
}) {
    return (
        <View style={styles.section}>
            <View style={styles.sliderHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View style={styles.crowdFeedback}>
                    {valueIcon && <Ionicons name={valueIcon} size={16} color={valueColor} />}
                    <Text style={[styles.sliderValue, { color: valueColor }]}>{valueLabel}</Text>
                </View>
            </View>
            <Slider
                style={styles.slider}
                minimumValue={minimumValue}
                maximumValue={maximumValue}
                step={1}
                value={value}
                onValueChange={onValueChange}
                minimumTrackTintColor={tintColor}
                maximumTrackTintColor="#ccc"
                thumbTintColor={tintColor}
            />
            <View style={styles.sliderEndLabels}>
                <Text style={styles.sliderEndLabel}>{lowLabel}</Text>
                <Text style={styles.sliderEndLabel}>{highLabel}</Text>
            </View>
        </View>
    );
}

export default function CheckUpScreen() {
    const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>(3);
    const [crowdIndex, setCrowdIndex] = useState(0);
    const [showThanksToast, setShowThanksToast] = useState(false);

    const currentCrowd = crowdLevels[CROWD_KEYS[crowdIndex]];

    const handleClose = () => {
        router.back();
    };

    const handleSubmit = () => {
        setShowThanksToast(true);
        setTimeout(() => {
            setShowThanksToast(false);
            router.back();
        }, 1200);
    };

    return (
        <>
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTextGroup}>
                    <Text style={styles.headerTitle}>Quick CheckUp</Text>
                    <Text style={styles.headerSubtitle}>{MOCK_WORKPLACE_NAME}</Text>
                </View>
                <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={8}>
                    <Ionicons name="close" size={26} color={Colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.introText}>
                    Share a quick update about this place. It only takes a few seconds and helps other
                    users know what to expect before they arrive.
                </Text>

                <SliderSection
                    title="Noise Level"
                    valueLabel={`${NOISE_LABELS[noiseLevel]} (${noiseLevel}/5)`}
                    valueColor={Colors.primary}
                    minimumValue={1}
                    maximumValue={5}
                    value={noiseLevel}
                    onValueChange={(value) => setNoiseLevel(value as NoiseLevel)}
                    tintColor={Colors.primary}
                    lowLabel="Quiet"
                    highLabel="Loud"
                />

                <SliderSection
                    title="Crowdedness"
                    valueLabel={currentCrowd.label}
                    valueColor={currentCrowd.color}
                    valueIcon={currentCrowd.icon}
                    minimumValue={0}
                    maximumValue={CROWD_KEYS.length - 1}
                    value={crowdIndex}
                    onValueChange={setCrowdIndex}
                    tintColor={currentCrowd.color}
                    lowLabel="Empty"
                    highLabel="Very crowded"
                />
            </ScrollView>

            <View style={styles.footer}>
                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </Pressable>
            </View>
        </View>

        <Modal visible={showThanksToast} transparent animationType="fade">
            <View style={styles.toastOverlay} pointerEvents="none">
                <View style={styles.toast}>
                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                    <Text style={styles.toastText}>Thanks for the update!</Text>
                </View>
            </View>
        </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundBase,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
        backgroundColor: Colors.backgroundWhite,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTextGroup: {
        flex: 1,
        marginRight: 12,
    },
    headerTitle: {
        ...Typography.screenTitle,
        fontSize: 22,
        color: Colors.textPrimary,
    },
    headerSubtitle: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
        gap: 28,
    },
    introText: {
        ...Typography.caption,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    section: {
        gap: 4,
    },
    sliderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        ...Typography.body,
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    sliderValue: {
        ...Typography.caption,
        fontWeight: '700',
        color: Colors.primary,
    },
    crowdFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    slider: {
        width: '100%',
        height: 40,
        marginTop: 8,
    },
    sliderEndLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sliderEndLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: Colors.backgroundWhite,
    },
    submitButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: Colors.primary,
    },
    submitButtonText: {
        ...Typography.button,
        color: Colors.textWhite,
    },
    toastOverlay: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 60,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#DFF5E1',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    toastText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '700',
    },
});
