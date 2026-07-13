import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import SelectionChip from '@/components/SelectionChip';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import utilityIcons, { getUtilityIcon } from '@/constants/utilityIcons';
import { getWorkModeIcon, getWorkModeLabel } from '@/constants/workModeIcons';
import { useWorkplaces } from '@/context/WorkplacesContext';
import useCurrentLocation from '@/hooks/useCurrentLocation';
import { Workplace } from '@/utils/api';
import { Coordinate, getDistanceKm } from '@/utils/geo';
import { resolveImage } from '@/utils/resolveImage';
import { clearWorkspaceDraft, getWorkspaceDraft, saveWorkspaceDraft } from '@/utils/workspaceDraft';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

const UTILITIES = Object.keys(utilityIcons);
const WORK_MODES = ['solo', 'group', 'both'];
const NEARBY_THRESHOLD_KM = 0.1;
const TIME_OF_DAY_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const timeStringToDate = (time: string, fallback: string): Date => {
    const isValidTime = TIME_OF_DAY_PATTERN.test(time);
    const timeToUse = isValidTime ? time : fallback;

    const [hours, minutes] = timeToUse.split(':').map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

const dateToTimeString = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

function TimeField({
    label,
    time,
    fallback,
    onChange,
}: {
    label: string;
    time: string;
    fallback: string;
    onChange: (time: string) => void;
}) {
    const value = timeStringToDate(time, fallback);

    if (Platform.OS === 'android') {
        return (
            <Pressable
                style={styles.androidTimeButton}
                onPress={() =>
                    DateTimePickerAndroid.open({
                        value,
                        mode: 'time',
                        is24Hour: true,
                        minuteInterval: 15,
                        onChange: (_event, selected) => {
                            if (selected) {
                                onChange(dateToTimeString(selected));
                            }
                        },
                    })
                }
            >
                <Text style={[Typography.caption, styles.hoursLabel]}>{label}</Text>
                <Text style={styles.androidTimeValue}>{time || '--:--'}</Text>
            </Pressable>
        );
    }

    return (
        <View>
            <Text style={[Typography.caption, styles.hoursLabel]}>{label}</Text>
            <View style={styles.timePickerWrapper}>
                <DateTimePicker
                    value={value}
                    mode="time"
                    display="spinner"
                    locale="de-DE"
                    minuteInterval={15}
                    onChange={(_event, selected) => {
                        if (selected) {
                            onChange(dateToTimeString(selected));
                        }
                    }}
                    style={styles.timePicker}
                />
            </View>
        </View>
    );
}

const FALLBACK_REGION = {
    latitude: 52.5200,
    longitude: 13.4050,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export default function CreateWorkspace() {
    const params = useLocalSearchParams<{ workplace?: string }>();
    const [editingWorkplace] = useState<Workplace | null>(() =>
        params.workplace ? (JSON.parse(params.workplace) as Workplace) : null
    );
    const isEditMode = editingWorkplace != null;

    const [draft] = useState(() => (isEditMode ? null : getWorkspaceDraft()));
    const [name, setName] = useState(editingWorkplace?.title ?? draft?.name ?? '');
    const [description, setDescription] = useState(editingWorkplace?.description ?? draft?.description ?? '');
    const [selectedUtilities, setSelectedUtilities] = useState<string[]>(
        editingWorkplace?.utilities ?? draft?.selectedUtilities ?? []
    );
    const [workMode, setWorkMode] = useState<string>(editingWorkplace?.workMode ?? draft?.workMode ?? 'both');
    const [opensAt, setOpensAt] = useState<string>(editingWorkplace?.opensAt ?? draft?.opensAt ?? '');
    const [closesAt, setClosesAt] = useState<string>(editingWorkplace?.closesAt ?? draft?.closesAt ?? '');
    const [existingImages, setExistingImages] = useState<string[]>(editingWorkplace?.images ?? []);
    const [newPhotoUris, setNewPhotoUris] = useState<string[]>(isEditMode ? [] : draft?.photoUris ?? []);
    const [markerCoordinate, setMarkerCoordinate] = useState<Coordinate | null>(
        editingWorkplace
            ? { latitude: editingWorkplace.latitude, longitude: editingWorkplace.longitude }
            : draft?.markerCoordinate ?? null
    );
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { location, permissionGranted } = useCurrentLocation();
    const mapRef = useRef<MapView>(null);
    const { workplaces, addWorkplace, updateWorkplace } = useWorkplaces();

    const findNearbyWorkplace = (coordinate: Coordinate) => {
        return workplaces.find((wp) => {
            const isEditingCurrentWorkplace =
                editingWorkplace && wp.id === editingWorkplace.id;

            const distance = getDistanceKm(coordinate, wp);
            const isNearby = distance <= NEARBY_THRESHOLD_KM;

            return !isEditingCurrentWorkplace && isNearby;
        });
    };

    const toggleUtility = (utility: string) => {
        setSelectedUtilities((prev) => {
            const isAlreadySelected = prev.includes(utility);

            if (isAlreadySelected) {
                return prev.filter((u) => u !== utility);
            }

            return [...prev, utility];
        });
    };

    const pickPhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            const newUris = result.assets.map((asset) => asset.uri);
            setNewPhotoUris((prev) => [...prev, ...newUris]);
        }
    };

    const removeExistingImage = (url: string) => {
        setExistingImages((prev) => prev.filter((u) => u !== url));
    };

    const removeNewPhoto = (uri: string) => {
        setNewPhotoUris((prev) => prev.filter((u) => u !== uri));
    };

    const handleMapPress = (event: MapPressEvent) => {
        setMarkerCoordinate(event.nativeEvent.coordinate);
    };

    const totalPhotoCount = existingImages.length + newPhotoUris.length;

    const computeHasUnsavedChanges = () => {
        if (editingWorkplace) {
            const titleChanged = name !== editingWorkplace.title;
            const descriptionChanged = description !== editingWorkplace.description;
            const utilitiesChanged =
                JSON.stringify(selectedUtilities) !== JSON.stringify(editingWorkplace.utilities);
            const workModeChanged = workMode !== editingWorkplace.workMode;
            const opensAtChanged = opensAt !== (editingWorkplace.opensAt ?? '');
            const closesAtChanged = closesAt !== (editingWorkplace.closesAt ?? '');
            const imagesChanged =
                JSON.stringify(existingImages) !== JSON.stringify(editingWorkplace.images);
            const hasNewPhotos = newPhotoUris.length > 0;
            const latitudeChanged = markerCoordinate?.latitude !== editingWorkplace.latitude;
            const longitudeChanged = markerCoordinate?.longitude !== editingWorkplace.longitude;

            return (
                titleChanged ||
                descriptionChanged ||
                utilitiesChanged ||
                workModeChanged ||
                opensAtChanged ||
                closesAtChanged ||
                imagesChanged ||
                hasNewPhotos ||
                latitudeChanged ||
                longitudeChanged
            );
        }

        const hasName = Boolean(name.trim());
        const hasDescription = Boolean(description.trim());
        const hasUtilities = selectedUtilities.length > 0;
        const hasOpensAt = Boolean(opensAt);
        const hasClosesAt = Boolean(closesAt);
        const hasPhotos = totalPhotoCount > 0;
        const hasLocation = Boolean(markerCoordinate);

        return (
            hasName ||
            hasDescription ||
            hasUtilities ||
            hasOpensAt ||
            hasClosesAt ||
            hasPhotos ||
            hasLocation
        );
    };

    const hasUnsavedChanges = computeHasUnsavedChanges();

    const handleLeaveAttempt = () => {
        if (!hasUnsavedChanges) {
            router.back();
            return;
        }

        if (isEditMode) {
            Alert.alert('Discard changes?', 'You have unsaved changes. Do you want to discard them?', [
                { text: 'Keep Editing', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => router.back() },
            ]);
            return;
        }

        Alert.alert(
            'Unsaved changes',
            'You have unsaved changes. Do you want to save them as a draft or discard them?',
            [
                { text: 'Keep Editing', style: 'cancel' },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => {
                        clearWorkspaceDraft();
                        router.back();
                    },
                },
                {
                    text: 'Save',
                    onPress: () => {
                        saveWorkspaceDraft({
                            name,
                            description,
                            selectedUtilities,
                            workMode,
                            opensAt: opensAt.trim() || null,
                            closesAt: closesAt.trim() || null,
                            photoUris: newPhotoUris,
                            markerCoordinate,
                        });
                        router.back();
                    },
                },
            ]
        );
    };

    useEffect(() => {
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            handleLeaveAttempt();
            return true;
        });
        return () => subscription.remove();
    }, [hasUnsavedChanges, name, description, selectedUtilities, workMode, opensAt, closesAt, existingImages, newPhotoUris, markerCoordinate]);

    const computeInitialRegion = () => {
        if (markerCoordinate) {
            return { ...markerCoordinate, latitudeDelta: 0.02, longitudeDelta: 0.02 };
        }

        if (location) {
            return { ...location, latitudeDelta: 0.02, longitudeDelta: 0.02 };
        }

        return FALLBACK_REGION;
    };

    const initialRegion = computeInitialRegion();

    useEffect(() => {
        if (isEditMode || !location) return;
        mapRef.current?.animateToRegion(
            { ...location, latitudeDelta: 0.02, longitudeDelta: 0.02 },
            300
        );
    }, [isEditMode, location?.latitude, location?.longitude]);

    const getSubmitButtonLabel = () => {
        if (isSubmitting) {
            return isEditMode ? 'Saving...' : 'Adding...';
        }

        return isEditMode ? 'Save' : 'Add';
    };

    const handleSubmit = async () => {
        const missing: string[] = [];
        if (!name.trim()) missing.push('a title');
        if (!description.trim()) missing.push('a description');
        if (totalPhotoCount === 0) missing.push('at least one photo');
        if (!markerCoordinate) missing.push('a location');

        if (missing.length > 0) {
            setError(`Please add ${missing.join(', ')}.`);
            return;
        }
        const trimmedOpensAt = opensAt.trim();
        const trimmedClosesAt = closesAt.trim();
        const opensAtIsInvalid = trimmedOpensAt !== '' && !TIME_OF_DAY_PATTERN.test(trimmedOpensAt);
        const closesAtIsInvalid = trimmedClosesAt !== '' && !TIME_OF_DAY_PATTERN.test(trimmedClosesAt);

        if (opensAtIsInvalid || closesAtIsInvalid) {
            setError('Opening and closing times must be in HH:MM format.');
            return;
        }
        setError(null);

        const nearby = findNearbyWorkplace(markerCoordinate!);
        if (nearby) {
            Alert.alert(
                'Is this the same place?',
                `There's already a workplace called "${nearby.title}" very close to this pin. Did you mean that one?`,
                [
                    { text: 'No, different place', style: 'cancel', onPress: () => performSubmit() },
                    { text: 'Yes, take me there', onPress: () => router.back() },
                ]
            );
            return;
        }

        await performSubmit();
    };

    const performSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (editingWorkplace) {
                await updateWorkplace(editingWorkplace.id, {
                    name,
                    description,
                    utilities: selectedUtilities,
                    workMode,
                    opensAt: opensAt.trim() || null,
                    closesAt: closesAt.trim() || null,
                    location: markerCoordinate!,
                    existingImages,
                    newPhotoUris,
                });
            } else {
                await addWorkplace({
                    name,
                    description,
                    utilities: selectedUtilities,
                    workMode,
                    opensAt: opensAt.trim() || null,
                    closesAt: closesAt.trim() || null,
                    location: markerCoordinate!,
                    photoUris: newPhotoUris,
                });
                clearWorkspaceDraft();
            }
            router.back();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save the workplace.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={handleLeaveAttempt}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Workspace' : 'Create Workspace'}</Text>
            </View>

            <ScrollView>
            <View style={styles.content}>
                <InputField
                    label="Workspace Name"
                    value={name}
                    onChangeText={setName}
                    secureTextEntry={undefined}
                    keyboardType={undefined}
                />
                <View style={styles.descriptionField}>
                    <InputField
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        secureTextEntry={undefined}
                        keyboardType={undefined}
                    />
                </View>
                <Text style={[Typography.caption, styles.sectionLabel]}>Utilities</Text>
                <View style={styles.chipsContainer}>
                    {UTILITIES.map((utility) => (
                        <SelectionChip
                            key={utility}
                            text={utility}
                            icon={<Ionicons name={getUtilityIcon(utility)} size={16} color={selectedUtilities.includes(utility) ? Colors.textWhite : Colors.primary} />}
                            selected={selectedUtilities.includes(utility)}
                            onPress={() => toggleUtility(utility)}
                        />
                    ))}
                </View>

                <Text style={[Typography.caption, styles.sectionLabel]}>Work Mode</Text>
                <View style={styles.chipsContainer}>
                    {WORK_MODES.map((mode) => (
                        <SelectionChip
                            key={mode}
                            text={getWorkModeLabel(mode)}
                            icon={<Ionicons name={getWorkModeIcon(mode)} size={16} color={workMode === mode ? Colors.textWhite : Colors.primary} />}
                            selected={workMode === mode}
                            onPress={() => setWorkMode(mode)}
                        />
                    ))}
                </View>

                <Text style={[Typography.caption, styles.sectionLabel]}>Opening Hours (optional)</Text>
                <View style={styles.hoursRow}>
                    <View style={styles.hoursField}>
                        <TimeField label="Opens at" time={opensAt} fallback="09:00" onChange={setOpensAt} />
                    </View>
                    <View style={styles.hoursField}>
                        <TimeField label="Closes at" time={closesAt} fallback="17:00" onChange={setClosesAt} />
                    </View>
                </View>

                {totalPhotoCount > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                        {existingImages.map((url) => (
                            <View key={url} style={styles.photoThumbnailWrapper}>
                                <Image source={resolveImage(url)} style={styles.photoThumbnail} />
                                <Pressable style={styles.removePhotoButton} onPress={() => removeExistingImage(url)}>
                                    <Ionicons name="close" size={14} color={Colors.textWhite} />
                                </Pressable>
                            </View>
                        ))}
                        {newPhotoUris.map((uri) => (
                            <View key={uri} style={styles.photoThumbnailWrapper}>
                                <Image source={{ uri }} style={styles.photoThumbnail} />
                                <Pressable style={styles.removePhotoButton} onPress={() => removeNewPhoto(uri)}>
                                    <Ionicons name="close" size={14} color={Colors.textWhite} />
                                </Pressable>
                            </View>
                        ))}
                        <Pressable style={styles.addMorePhoto} onPress={pickPhoto}>
                            <Ionicons name="add" size={28} color={Colors.textMuted} />
                        </Pressable>
                    </ScrollView>
                ) : (
                    <Pressable style={styles.photoPicker} onPress={pickPhoto}>
                        <Ionicons name="camera-outline" size={28} color={Colors.textMuted} />
                        <Text style={[Typography.caption, styles.photoPickerText]}>Add photos</Text>
                    </Pressable>
                )}

                <Text style={[Typography.caption, styles.sectionLabel]}>Location</Text>
                <View style={styles.mapWrapper}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={initialRegion}
                        onPress={handleMapPress}
                        showsUserLocation={permissionGranted}
                    >
                        {markerCoordinate && <Marker coordinate={markerCoordinate} />}
                    </MapView>
                </View>
                <Text style={[Typography.caption, styles.mapHint]}>
                    {markerCoordinate ? 'Tap the map to move the pin' : 'Tap the map to set the location'}
                </Text>

                {error && <Text style={[Typography.caption, styles.errorText]}>{error}</Text>}

                <View style={styles.footer}>
                    <Pressable style={styles.cancelButton} onPress={handleLeaveAttempt}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <View style={styles.addButton}>
                        <PrimaryButton
                            label={getSubmitButtonLabel()}
                            onPress={handleSubmit}
                        />
                    </View>
                </View>
            </View>
            </ScrollView>
        </View>
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
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: Colors.backgroundWhite,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        ...Typography.screenTitle,
        flex: 1,
        fontSize: 20,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginRight: 36,
    },
    content: {
        padding: 16,
    },
    descriptionField: {
        marginTop: 12,
    },
    errorText: {
        marginTop: 16,
        color: Colors.live,
    },
    photoPicker: {
        height: 160,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1e1fa',
        backgroundColor: Colors.backgroundWhite,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 20,
    },
    photoPickerText: {
        marginTop: 6,
        color: Colors.textMuted,
    },
    photoRow: {
        gap: 10,
        marginBottom: 20,
    },
    photoThumbnailWrapper: {
        position: 'relative',
    },
    photoThumbnail: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },
    removePhotoButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addMorePhoto: {
        width: 120,
        height: 120,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1e1fa',
        backgroundColor: Colors.backgroundWhite,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionLabel: {
        marginTop: 20,
        marginBottom: 4,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    hoursRow: {
        flexDirection: 'column',
        gap: 16,
        marginBottom: 28,
    },
    hoursField: {
        width: '100%',
    },
    hoursLabel: {
        color: Colors.textMuted,
        marginBottom: 4,
    },
    timePickerWrapper: {
        height: 130,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    timePicker: {
        alignSelf: 'stretch',
        transform: [{ scale: 0.75 }],
    },
    androidTimeButton: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d1e1fa',
        backgroundColor: Colors.backgroundWhite,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    androidTimeValue: {
        ...Typography.body,
        color: Colors.textPrimary,
        marginTop: 2,
    },
    mapWrapper: {
        height: 440,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
    },
    map: {
        flex: 1,
    },
    mapHint: {
        marginTop: 6,
        color: Colors.textMuted,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 32,
        marginBottom: 100,
    },
    cancelButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1e1fa',
        backgroundColor: Colors.backgroundWhite,
    },
    cancelButtonText: {
        ...Typography.button,
        color: Colors.textPrimary,
    },
    addButton: {
        flex: 1,
    },
});
