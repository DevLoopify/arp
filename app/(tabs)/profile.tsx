import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import utilityIcons, { getUtilityIcon } from '@/constants/utilityIcons';
import { DistanceUnit, Language, NoiseLevel, useUserProfile, WorkMode } from '@/context/UserProfileContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View,} from 'react-native';
import InputField from '@/components/InputField';
import SelectionChip from '@/components/SelectionChip';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UTILITIES = Object.keys(utilityIcons);

const TOGGLE_HEIGHT = 50;
const KNOB_MARGIN = 4;

const UNIT_OPTIONS = [
    { value: 'km', label: 'Kilometers' },
    { value: 'mi', label: 'Miles' },
];

const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
];

const DEFAULT_AVATAR =
    'https://static.vecteezy.com/ti/fotos-kostenlos/p2/55121385-capybara-steht-bewachen-uber-es-ist-jung-im-ein-heiter-naturlich-lebensraum-wahrend-tageslicht-std-im-das-wild-prasentieren-das-bindung-zwischen-mutter-und-baby-foto.jpeg';

export default function ProfileScreen() {
    const { settings, isLoaded, saveSettings } = useUserProfile();

    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [name, setName] = useState('');

    const [preferencesExpanded, setPreferencesExpanded] = useState(false);
    const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>('average');
    const [radius, setRadius] = useState(500);
    const [workMode, setWorkMode] = useState<WorkMode>('solo');
    const [selectedUtilities, setSelectedUtilities] = useState<string[]>([]);

    const [unit, setUnit] = useState<DistanceUnit>('km');
    const [language, setLanguage] = useState<Language>('en');

    const [showSavedToast, setShowSavedToast] = useState(false);

    const [toggleWidth, setToggleWidth] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isLoaded) return;
        setAvatarUri(settings.avatarUri);
        setName(settings.name);
        setNoiseLevel(settings.noiseLevel);
        setRadius(settings.radius);
        setWorkMode(settings.workMode);
        slideAnim.setValue(settings.workMode === 'group' ? 1 : 0);
        setSelectedUtilities(settings.utilities);
        setUnit(settings.unit);
        setLanguage(settings.language);
    }, [isLoaded, settings, slideAnim]);

    const knobWidth = toggleWidth > 0 ? toggleWidth / 2 - KNOB_MARGIN * 2 : 0;
    const knobTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [KNOB_MARGIN, Math.max(toggleWidth - knobWidth - KNOB_MARGIN, KNOB_MARGIN)],
    });

    const togglePreferences = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPreferencesExpanded((prev) => !prev);
    };

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

    const pickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleLogout = () => {
        router.replace('/login');
    };

    const handleSave = async () => {
        await saveSettings({
            name,
            avatarUri,
            noiseLevel,
            radius,
            workMode,
            utilities: selectedUtilities,
            unit,
            language,
        });
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 1200);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Pressable style={styles.avatarWrapper} onPress={pickAvatar}>
                <Image source={{ uri: avatarUri ?? DEFAULT_AVATAR }} style={styles.avatar} />
                <View style={styles.avatarBadge}>
                    <Ionicons name="camera" size={16} color={Colors.textWhite} />
                </View>
            </Pressable>

            <View style={styles.nameField}>
                <InputField
                    label="Your name"
                    value={name}
                    onChangeText={setName}
                    secureTextEntry={undefined}
                    keyboardType={undefined}
                />
            </View>

            <View style={styles.section}>
                <Pressable style={styles.sectionHeader} onPress={togglePreferences}>
                    <Text style={styles.sectionTitle}>Workspace Preferences</Text>
                    <Ionicons
                        name={preferencesExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={Colors.textPrimary}
                    />
                </Pressable>

                {preferencesExpanded && (
                    <View style={styles.sectionBody}>
                        <Text style={styles.fieldLabel}>Noise Level</Text>
                        <View style={styles.noiseRow}>
                            <Pressable
                                onPress={() => setNoiseLevel('quiet')}
                                style={[
                                    styles.noiseBox,
                                    styles.quietBox,
                                    noiseLevel === 'quiet' && styles.quietBoxSelected,
                                ]}
                            >
                                <Text style={noiseLevel === 'quiet' && styles.noiseTextSelected}>Quiet</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setNoiseLevel('average')}
                                style={[
                                    styles.noiseBox,
                                    styles.averageBox,
                                    noiseLevel === 'average' && styles.averageBoxSelected,
                                ]}
                            >
                                <Text style={noiseLevel === 'average' && styles.noiseTextSelected}>Average</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setNoiseLevel('noisy')}
                                style={[
                                    styles.noiseBox,
                                    styles.noisyBox,
                                    noiseLevel === 'noisy' && styles.noisyBoxSelected,
                                ]}
                            >
                                <Text style={noiseLevel === 'noisy' && styles.noiseTextSelected}>Noisy</Text>
                            </Pressable>
                        </View>

                        <View style={styles.radiusHeader}>
                            <Text style={styles.fieldLabel}>Search Radius</Text>
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
                                    { width: knobWidth, height: TOGGLE_HEIGHT - KNOB_MARGIN * 2, transform: [{ translateX: knobTranslateX }] },
                                ]}
                            />
                            <Text style={styles.toggleLabel}>
                                {workMode === 'solo' ? 'Solo Work' : 'Group Work'}
                            </Text>
                        </Pressable>

                        <Text style={styles.fieldLabel}>Utilities</Text>
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
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>App Settings</Text>
                <View style={styles.sectionBody}>
                    <Text style={styles.fieldLabel}>Distance Unit</Text>
                    <OptionGroup
                        options={UNIT_OPTIONS}
                        value={unit}
                        onChange={(value) => setUnit(value as DistanceUnit)}
                    />

                    <Text style={styles.fieldLabel}>Language</Text>
                    <OptionGroup
                        options={LANGUAGE_OPTIONS}
                        value={language}
                        onChange={(value) => setLanguage(value as Language)}
                    />
                </View>
            </View>

            <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color={Colors.live} />
                <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>

            {showSavedToast && (
                <View style={styles.toast} pointerEvents="none">
                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                    <Text style={styles.toastText}>Profile saved</Text>
                </View>
            )}
        </ScrollView>
    );
}

function OptionGroup({
    options,
    value,
    onChange,
}: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <View style={styles.optionRow}>
            {options.map((option) => {
                const selected = option.value === value;
                return (
                    <Pressable
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        style={[styles.optionPill, selected && styles.optionPillSelected]}
                    >
                        <Text style={[styles.optionPillText, selected && styles.optionPillTextSelected]}>
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundBase,
    },
    content: {
        padding: 20,
        paddingBottom: 60,
        alignItems: 'center',
    },
    avatarWrapper: {
        marginTop: 8,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.backgroundWhite,
    },
    avatarBadge: {
        position: 'absolute',
        right: 2,
        bottom: 2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.backgroundBase,
    },
    nameField: {
        width: '100%',
        marginTop: 20,
    },
    section: {
        width: '100%',
        marginTop: 20,
        backgroundColor: Colors.backgroundWhite,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1e1fa',
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        ...Typography.button,
        color: Colors.textPrimary,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    sectionBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    fieldLabel: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginTop: 12,
        marginBottom: 6,
    },
    radiusHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginTop: 12,
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
    noiseRow: {
        flexDirection: 'row',
        gap: 8,
    },
    noiseBox: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    quietBox: {
        backgroundColor: '#DFF5E1',
    },
    quietBoxSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#2E7D32',
    },
    averageBox: {
        backgroundColor: '#FFF3CD',
    },
    averageBoxSelected: {
        backgroundColor: '#FFC107',
        borderColor: '#B28704',
    },
    noisyBox: {
        backgroundColor: '#FDE0E0',
    },
    noisyBoxSelected: {
        backgroundColor: '#F44336',
        borderColor: '#B71C1C',
    },
    noiseTextSelected: {
        color: 'white',
        fontWeight: '700',
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
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionPill: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: Colors.backgroundBase,
        borderWidth: 1,
        borderColor: '#d1e1fa',
    },
    optionPillSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    optionPillText: {
        ...Typography.caption,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    optionPillTextSelected: {
        color: Colors.textWhite,
    },
    saveButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 28,
        paddingVertical: 16,
        borderRadius: 12,
        width: '100%',
        backgroundColor: Colors.primary,
    },
    saveButtonText: {
        ...Typography.button,
        color: Colors.textWhite,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.liveBorder,
        backgroundColor: Colors.liveBackground,
    },
    logoutText: {
        ...Typography.button,
        color: Colors.live,
    },
    toast: {
        position: 'absolute',
        top: 12,
        alignSelf: 'center',
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
