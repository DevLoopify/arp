import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import utilityIcons, { getUtilityIcon } from '@/constants/utilityIcons';
import { useAuth } from '@/context/AuthContext';
import { filtersFromProfileSettings, useFilters } from '@/context/FiltersContext';
import { DistanceUnit, Language, NoiseLevel, useUserProfile, WorkMode } from '@/context/UserProfileContext';
import { useWorkplaces } from '@/context/WorkplacesContext';
import { Review, Workplace } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, LayoutAnimation, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View,} from 'react-native';
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

const NOISE_LEVELS: NoiseLevel[] = [1, 2, 3, 4, 5];

const DEFAULT_AVATAR =
    'https://static.vecteezy.com/ti/fotos-kostenlos/p2/55121385-capybara-steht-bewachen-uber-es-ist-jung-im-ein-heiter-naturlich-lebensraum-wahrend-tageslicht-std-im-das-wild-prasentieren-das-bindung-zwischen-mutter-und-baby-foto.jpeg';

export default function ProfileScreen() {
    const { settings, isLoaded, saveSettings } = useUserProfile();
    const { setFilters } = useFilters();
    const { user } = useAuth();
    const { workplaces, deleteWorkplace, deleteReview } = useWorkplaces();

    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [name, setName] = useState('');

    const [preferencesExpanded, setPreferencesExpanded] = useState(false);
    const [noiseLevel, setNoiseLevel] = useState<NoiseLevel>(3);
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

    const myWorkplaces = workplaces.filter((wp) => user != null && wp.ownerUserId === user.id);
    const myReviews = workplaces.flatMap((wp) =>
        (wp.reviews ?? [])
            .filter((review) => user != null && review.userId === user.id)
            .map((review) => ({ ...review, workplace: wp }))
    );

    const handleViewWorkplace = (wp: Workplace) => {
        router.push({ pathname: '/(detail)/detail', params: { workplace: JSON.stringify(wp) } });
    };

    const handleEditWorkplace = (wp: Workplace) => {
        router.push({ pathname: '/create_workspace', params: { workplace: JSON.stringify(wp) } });
    };

    const handleDeleteWorkplace = (wp: Workplace) => {
        Alert.alert(
            'Delete workplace?',
            `This will permanently delete "${wp.title}" and its reviews. This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteWorkplace(wp.id);
                        } catch (err) {
                            Alert.alert('Could not delete workplace', err instanceof Error ? err.message : 'Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleEditReview = (wp: Workplace, review: Review) => {
        router.push({
            pathname: '/(detail)/review',
            params: { workplace: JSON.stringify(wp), review: JSON.stringify(review) },
        });
    };

    const handleDeleteReview = (review: Review) => {
        Alert.alert('Delete review?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteReview(review.id);
                    } catch (err) {
                        Alert.alert('Could not delete review', err instanceof Error ? err.message : 'Please try again.');
                    }
                },
            },
        ]);
    };

    const handleSave = async () => {
        try {
            const updated = await saveSettings({
                name,
                avatarUri,
                noiseLevel,
                radius,
                workMode,
                utilities: selectedUtilities,
                unit,
                language,
            });
            setFilters(filtersFromProfileSettings(updated));
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 1200);
        } catch (err) {
            Alert.alert('Could not save profile', err instanceof Error ? err.message : 'Please try again.');
        }
    };

    return (
        <>
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

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>My Workplaces</Text>
                <View style={styles.sectionBody}>
                    {myWorkplaces.length === 0 ? (
                        <Text style={styles.emptyListText}>You haven&apos;t added any workplaces yet.</Text>
                    ) : (
                        myWorkplaces.map((wp) => (
                            <Pressable key={wp.id} style={styles.listRow} onPress={() => handleViewWorkplace(wp)}>
                                <Text style={styles.listRowTitle} numberOfLines={1}>{wp.title}</Text>
                                <View style={styles.listRowActions}>
                                    <Pressable style={styles.listRowIcon} onPress={() => handleEditWorkplace(wp)} hitSlop={8}>
                                        <Ionicons name="pencil" size={18} color={Colors.primary} />
                                    </Pressable>
                                    <Pressable style={styles.listRowIcon} onPress={() => handleDeleteWorkplace(wp)} hitSlop={8}>
                                        <Ionicons name="trash-outline" size={18} color={Colors.live} />
                                    </Pressable>
                                </View>
                            </Pressable>
                        ))
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>My Reviews</Text>
                <View style={styles.sectionBody}>
                    {myReviews.length === 0 ? (
                        <Text style={styles.emptyListText}>You haven&apos;t written any reviews yet.</Text>
                    ) : (
                        myReviews.map((review) => (
                            <Pressable
                                key={review.id}
                                style={styles.listRow}
                                onPress={() => handleViewWorkplace(review.workplace)}
                            >
                                <View style={styles.reviewRowContent}>
                                    <Text style={styles.listRowTitle} numberOfLines={1}>{review.workplace.title}</Text>
                                    <View style={styles.reviewStars}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Ionicons
                                                key={star}
                                                name={star <= review.rating ? 'star' : 'star-outline'}
                                                size={12}
                                                color="#FFD700"
                                            />
                                        ))}
                                    </View>
                                    <Text style={styles.reviewComment} numberOfLines={2}>{review.comment}</Text>
                                </View>
                                <View style={styles.listRowActions}>
                                    <Pressable
                                        style={styles.listRowIcon}
                                        onPress={() => handleEditReview(review.workplace, review)}
                                        hitSlop={8}
                                    >
                                        <Ionicons name="pencil" size={18} color={Colors.primary} />
                                    </Pressable>
                                    <Pressable
                                        style={styles.listRowIcon}
                                        onPress={() => handleDeleteReview(review)}
                                        hitSlop={8}
                                    >
                                        <Ionicons name="trash-outline" size={18} color={Colors.live} />
                                    </Pressable>
                                </View>
                            </Pressable>
                        ))
                    )}
                </View>
            </View>

            <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color={Colors.live} />
                <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>

            <Pressable style={styles.devButton} onPress={() => router.push('/checkup')}>
                <Ionicons name="flask-outline" size={18} color={Colors.textMuted} />
                <Text style={styles.devButtonText}>Quick CheckUp (Test)</Text>
            </Pressable>
        </ScrollView>

        <Modal visible={showSavedToast} transparent animationType="fade">
            <View style={styles.toastOverlay} pointerEvents="none">
                <View style={styles.toast}>
                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                    <Text style={styles.toastText}>Profile saved</Text>
                </View>
            </View>
        </Modal>
        </>
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
        flexWrap: 'wrap',
        gap: 8,
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
    emptyListText: {
        ...Typography.caption,
        color: Colors.textMuted,
        paddingVertical: 12,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    listRowTitle: {
        ...Typography.body,
        fontWeight: '600',
        color: Colors.textPrimary,
        flex: 1,
    },
    listRowActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    listRowIcon: {
        padding: 2,
    },
    reviewRowContent: {
        flex: 1,
        gap: 4,
    },
    reviewStars: {
        flexDirection: 'row',
    },
    reviewComment: {
        ...Typography.caption,
        color: Colors.textSecondary,
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
    devButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
        paddingVertical: 10,
    },
    devButtonText: {
        ...Typography.caption,
        color: Colors.textMuted,
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
