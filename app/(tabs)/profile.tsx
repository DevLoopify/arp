import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import utilityIcons, { getUtilityIcon } from '@/constants/utilityIcons';
import { DistanceUnit, Language, NoiseLevel, useUserProfile, WorkMode } from '@/context/UserProfileContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    LayoutAnimation,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    UIManager,
    View,
} from 'react-native';
import InputField from '@/components/InputField';
import SelectionChip from '@/components/SelectionChip';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const UTILITIES = Object.keys(utilityIcons);

const NOISE_OPTIONS = [
    { value: 'quiet', label: 'Quiet' },
    { value: 'average', label: 'Average' },
    { value: 'noisy', label: 'Noisy' },
];

const WORK_MODE_OPTIONS = [
    { value: 'solo', label: 'Solo Work' },
    { value: 'group', label: 'Group Work' },
];

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

    useEffect(() => {
        if (!isLoaded) return;
        setAvatarUri(settings.avatarUri);
        setName(settings.name);
        setNoiseLevel(settings.noiseLevel);
        setRadius(settings.radius);
        setWorkMode(settings.workMode);
        setSelectedUtilities(settings.utilities);
        setUnit(settings.unit);
        setLanguage(settings.language);
    }, [isLoaded, settings]);

    const togglePreferences = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPreferencesExpanded((prev) => !prev);
    };

    const toggleUtility = (utility: string) => {
        setSelectedUtilities((prev) =>
            prev.includes(utility) ? prev.filter((u) => u !== utility) : [...prev, utility]
        );
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
                        <OptionGroup
                            options={NOISE_OPTIONS}
                            value={noiseLevel}
                            onChange={(value) => setNoiseLevel(value as NoiseLevel)}
                        />

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
                            minimumTrackTintColor={Colors.primary}
                            maximumTrackTintColor="#ccc"
                            thumbTintColor={Colors.primary}
                        />

                        <Text style={styles.fieldLabel}>Work Mode</Text>
                        <OptionGroup
                            options={WORK_MODE_OPTIONS}
                            value={workMode}
                            onChange={(value) => setWorkMode(value as WorkMode)}
                        />

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
        color: Colors.primary,
    },
    slider: {
        width: '100%',
        height: 40,
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
