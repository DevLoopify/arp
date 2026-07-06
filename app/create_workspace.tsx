import IconButton from '@/components/IconButton';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import SelectionChip from '@/components/SelectionChip';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import utilityIcons, { getUtilityIcon } from '@/constants/utilityIcons';
import { useCustomWorkplaces } from '@/context/CustomWorkplacesContext';
import useCurrentLocation from '@/hooks/useCurrentLocation';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

const UTILITIES = Object.keys(utilityIcons);

const FALLBACK_REGION = {
    latitude: 52.5200,
    longitude: 13.4050,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export default function CreateWorkspace() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUtilities, setSelectedUtilities] = useState<string[]>([]);
    const [photoUris, setPhotoUris] = useState<string[] | null>(null);
    const [markerCoordinate, setMarkerCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { location, permissionGranted } = useCurrentLocation() as {
        location: { latitude: number; longitude: number } | null;
        permissionGranted: boolean;
    };
    const mapRef = useRef<MapView>(null);
    const { addWorkplace } = useCustomWorkplaces();

    const toggleUtility = (utility: string) => {
        setSelectedUtilities((prev) =>
            prev.includes(utility) ? prev.filter((u) => u !== utility) : [...prev, utility]
        );
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
            setPhotoUris((prev) => [...(prev || []), ...newUris]);
        }
    };

    const handleMapPress = (event: MapPressEvent) => {
        setMarkerCoordinate(event.nativeEvent.coordinate);
    };

    const initialRegion = location
        ? { ...location, latitudeDelta: 0.02, longitudeDelta: 0.02 }
        : FALLBACK_REGION;

    useEffect(() => {
        if (!location) return;
        mapRef.current?.animateToRegion(
            { ...location, latitudeDelta: 0.02, longitudeDelta: 0.02 },
            300
        );
    }, [location?.latitude, location?.longitude]);

    const handleAdd = async () => {
        const missing: string[] = [];
        if (!name.trim()) missing.push('a title');
        if (!description.trim()) missing.push('a description');
        if (!photoUris?.length) missing.push('at least one photo');
        if (!markerCoordinate) missing.push('a location');

        if (missing.length > 0) {
            setError(`Please add ${missing.join(', ')}.`);
            return;
        }
        setError(null);

        await addWorkplace({
            name,
            description,
            utilities: selectedUtilities,
            location: markerCoordinate!,
            photoUris: photoUris ?? [],
        });
        router.back();
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Create Workspace',
                    headerTitleAlign: 'center',
                    headerTitleStyle: { fontSize: Typography.button.fontSize, fontWeight: Typography.button.fontWeight },
                    headerStyle: { backgroundColor: Colors.backgroundBase },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <IconButton
                            icon={<Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />}
                            clickHandler={() => router.back()}
                        />
                    ),
                }}
            />
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

                    {photoUris?.length ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                            {photoUris.map((uri) => (
                                <Image key={uri} source={{ uri }} style={styles.photoThumbnail} />
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
                    <Pressable style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <View style={styles.addButton}>
                        <PrimaryButton label="Add" onPress={handleAdd} />
                    </View>
                </View>
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
    photoThumbnail: {
        width: 120,
        height: 120,
        borderRadius: 12,
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
