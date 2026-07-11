import InfoTooltip from '@/components/InfoTooltip';
import PrimaryButton from '@/components/PrimaryButton';
import SelectionChip from '@/components/SelectionChip';
import TextButton from '@/components/TextButton';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import utilityIcons, { getUtilityIcon } from '@/constants/utilityIcons';
import { filtersFromProfileSettings, useFilters } from '@/context/FiltersContext';
import { NoiseLevel, useUserProfile, WorkMode } from '@/context/UserProfileContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const UTILITIES = Object.keys(utilityIcons);
const NOISE_LEVELS: NoiseLevel[] = [1, 2, 3, 4, 5];

const TOGGLE_HEIGHT = 50;
const KNOB_MARGIN = 4;

export default function SetupPreferencesScreen() {
    const { settings, saveSettings } = useUserProfile();
    const { setFilters } = useFilters();

    const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>(settings.noiseLevel);
    const [radius, setRadius] = useState(settings.radius);
    const [workMode, setWorkMode] = useState<WorkMode>(settings.workMode);
    const [selectedUtilities, setSelectedUtilities] = useState<string[]>(settings.utilities);
    const [isSaving, setIsSaving] = useState(false);
    const [toggleWidth, setToggleWidth] = useState(0);
    const slideAnim = useRef(new Animated.Value(settings.workMode === 'group' ? 1 : 0)).current;

    const knobWidth = toggleWidth > 0 ? toggleWidth / 2 - KNOB_MARGIN * 2 : 0;
    const knobTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [KNOB_MARGIN, Math.max(toggleWidth - knobWidth - KNOB_MARGIN, KNOB_MARGIN)],
    });

    const toggleUtility = (utility: string) => {
        setSelectedUtilities((prev) =>
            prev.includes(utility) ? prev.filter((u) => u !== utility) : [...prev, utility]
        );
    };

    const toggleWorkMode = () => {
        const next: WorkMode = workMode === 'solo' ? 'group' : 'solo';
        setWorkMode(next);
        Animated.timing(slideAnim, {
            toValue: next === 'group' ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const finish = () => router.replace('/(tabs)/explore');

    const handleContinue = async () => {
        setIsSaving(true);
        try {
            const updated = await saveSettings({
                ...settings,
                noiseLevel,
                radius,
                workMode,
                utilities: selectedUtilities,
            });
            setFilters(filtersFromProfileSettings(updated));
            finish();
        } catch (err) {
            Alert.alert('Could not save preferences', err instanceof Error ? err.message : 'Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Workplace Preferences</Text>
            <Text style={styles.subtitle}>
                Tell us how you like to work so we can tailor your search defaults. You can always change this later
                in your profile.
            </Text>

            <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Noise Level</Text>
                <InfoTooltip
                    title="Noise Level"
                    message="Shows workplaces at or below the noise level you pick, from 1 (quietest) to 5 (loudest)."
                />
            </View>
            <View style={styles.noiseRow}>
                {NOISE_LEVELS.map((level) => (
                    <SelectionChip
                        key={level}
                        text={String(level)}
                        icon={undefined}
                        selected={noiseLevel === level}
                        onPress={() => setNoiseLevel(level)}
                    />
                ))}
            </View>

            <View style={styles.radiusHeader}>
                <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>Search Radius</Text>
                    <InfoTooltip
                        title="Search Radius"
                        message="Only shows workplaces within this distance from your current or searched location."
                    />
                </View>
                <Text style={styles.radiusValue}>{radius} m</Text>
            </View>
            <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={5000}
                step={100}
                value={radius}
                onValueChange={setRadius}
                minimumTrackTintColor="#1E88E5"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#1E88E5"
            />

            <Text style={styles.fieldLabel}>Work Mode</Text>
            <Pressable
                onPress={toggleWorkMode}
                onLayout={(e) => setToggleWidth(e.nativeEvent.layout.width)}
                style={styles.toggleButton}
            >
                <Animated.View
                    style={[
                        styles.toggleKnob,
                        {
                            width: knobWidth,
                            height: TOGGLE_HEIGHT - KNOB_MARGIN * 2,
                            transform: [{ translateX: knobTranslateX }],
                        },
                    ]}
                />
                <Text style={styles.toggleLabel}>{workMode === 'solo' ? 'Solo Work' : 'Group Work'}</Text>
            </Pressable>

            <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabel}>Utilities</Text>
                <InfoTooltip
                    title="Utilities"
                    message="Only shows workplaces that have all of the utilities you select here."
                />
            </View>
            <View style={styles.chipsContainer}>
                {UTILITIES.map((utility) => (
                    <SelectionChip
                        key={utility}
                        text={utility}
                        icon={
                            <Ionicons
                                name={getUtilityIcon(utility)}
                                size={16}
                                color={selectedUtilities.includes(utility) ? Colors.textWhite : Colors.primary}
                            />
                        }
                        selected={selectedUtilities.includes(utility)}
                        onPress={() => toggleUtility(utility)}
                    />
                ))}
            </View>

            <View style={styles.continueButton}>
                <PrimaryButton label={isSaving ? 'Saving...' : 'Continue'} onPress={handleContinue} />
            </View>
            <View style={styles.skipRow}>
                <TextButton label="Skip for now" onPress={finish} textStyle={styles.skipText} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundBase,
    },
    content: {
        padding: 24,
        paddingTop: 64,
        paddingBottom: 48,
    },
    title: {
        ...Typography.screenTitle,
        color: Colors.textPrimary,
    },
    subtitle: {
        ...Typography.body,
        marginTop: 12,
        color: Colors.textSecondary,
    },
    fieldLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginTop: 24,
        marginBottom: 8,
    },
    fieldLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noiseRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    radiusHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    radiusValue: {
        ...Typography.caption,
        fontWeight: '600',
        color: '#1E88E5',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    toggleButton: {
        height: TOGGLE_HEIGHT,
        borderRadius: TOGGLE_HEIGHT / 2,
        backgroundColor: '#90CAF9',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        width: '100%',
    },
    toggleKnob: {
        position: 'absolute',
        top: KNOB_MARGIN,
        left: 0,
        borderRadius: (TOGGLE_HEIGHT - KNOB_MARGIN * 2) / 2,
        backgroundColor: '#1E88E5',
    },
    toggleLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    continueButton: {
        marginTop: 32,
    },
    skipRow: {
        marginTop: 16,
        alignItems: 'center',
    },
    skipText: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
});
