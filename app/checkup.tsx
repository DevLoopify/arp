import Colors from '@/constants/Colors';
import crowdLevels from '@/constants/crowdLevels';
import Typography from '@/constants/Typography';
import { NoiseLevel } from '@/context/UserProfileContext';
import { Workplace } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const NOISE_LABELS: Record<NoiseLevel, string> = {
    1: 'Very quiet',
    2: 'Quiet',
    3: 'Moderate',
    4: 'Loud',
    5: 'Very loud',
};

const CROWD_KEYS = Object.keys(crowdLevels);

export default function CheckUpScreen() {
    const { workplace } = useLocalSearchParams<{ workplace?: string }>();
    const parsedWorkplace = workplace ? (JSON.parse(workplace) as Workplace) : null;

    const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>(3);
    const [crowdIndex, setCrowdIndex] = useState(0);
    const [showThanksToast, setShowThanksToast] = useState(false);

    const currentCrowd = crowdLevels[CROWD_KEYS[crowdIndex]];

    const handleClose = () => {
        router.back();
    };

    const handleSubmit = () => {
        // TODO: send { workplaceId: parsedWorkplace?.id, noiseLevel, crowdedness: CROWD_KEYS[crowdIndex] }
        // to the backend once a live-data endpoint exists.
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
                    <Text style={styles.headerSubtitle}>
                        {parsedWorkplace ? parsedWorkplace.title : 'How is it right now?'}
                    </Text>
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

                <View style={styles.section}>
                    <View style={styles.sliderHeader}>
                        <Text style={styles.sectionTitle}>Noise Level</Text>
                        <Text style={styles.sliderValue}>
                            {NOISE_LABELS[noiseLevel]} ({noiseLevel}/5)
                        </Text>
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={5}
                        step={1}
                        value={noiseLevel}
                        onValueChange={(value) => setNoiseLevel(value as NoiseLevel)}
                        minimumTrackTintColor={Colors.primary}
                        maximumTrackTintColor="#ccc"
                        thumbTintColor={Colors.primary}
                    />
                    <View style={styles.sliderEndLabels}>
                        <Text style={styles.sliderEndLabel}>Quiet</Text>
                        <Text style={styles.sliderEndLabel}>Loud</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sliderHeader}>
                        <Text style={styles.sectionTitle}>Crowdedness</Text>
                        <View style={styles.crowdFeedback}>
                            <Ionicons name={currentCrowd.icon} size={16} color={currentCrowd.color} />
                            <Text style={[styles.sliderValue, { color: currentCrowd.color }]}>
                                {currentCrowd.label}
                            </Text>
                        </View>
                    </View>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={CROWD_KEYS.length - 1}
                        step={1}
                        value={crowdIndex}
                        onValueChange={setCrowdIndex}
                        minimumTrackTintColor={currentCrowd.color}
                        maximumTrackTintColor="#ccc"
                        thumbTintColor={currentCrowd.color}
                    />
                    <View style={styles.sliderEndLabels}>
                        <Text style={styles.sliderEndLabel}>Empty</Text>
                        <Text style={styles.sliderEndLabel}>Very crowded</Text>
                    </View>
                </View>
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
