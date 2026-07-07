import Colors from '@/constants/Colors';
import crowdLevels from '@/constants/crowdLevels';
import floatingButtonStyle from '@/constants/floatingButtonStyle';
import Typography from '@/constants/Typography';
import { getUtilityIcon } from '@/constants/utilityIcons';
import workplaceMetaStyles from '@/constants/workplaceMetaStyles';
import { useAuth } from '@/context/AuthContext';
import { useWorkplaces } from '@/context/WorkplacesContext';
import { formatDistance, getDistanceKm } from '@/utils/geo';
import { resolveImage } from '@/utils/resolveImage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, router } from 'expo-router';
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import FavouriteButton from './FavouriteButton';
import ImageCarousel from './ImageCarousel';
import SelectionChip from './SelectionChip';

const screenWidth = Dimensions.get('window').width;
const MAX_VISIBLE_UTILITIES = 3;

export default function WorkplaceCard({ workplace, width = screenWidth - 32, userLocation = null, highlighted = false }) {
    const { title, description, images, rating, noise, crowdedness, crowdByHourToday, utilities, latitude, longitude } = workplace;
    const { user } = useAuth();
    const { deleteWorkplace } = useWorkplaces();
    const isOwner = user != null && workplace.ownerUserId === user.id;
    const resolvedImages = images.map(resolveImage).filter(Boolean);
    const liveCrowdedness = crowdByHourToday?.[new Date().getHours()] ?? crowdedness;
    const crowdLevel = crowdLevels[liveCrowdedness];
    const distanceLabel = userLocation
        ? formatDistance(getDistanceKm(userLocation, { latitude, longitude }))
        : null;
    const visibleUtilities = utilities?.slice(0, MAX_VISIBLE_UTILITIES) ?? [];
    const hiddenUtilityCount = (utilities?.length ?? 0) - visibleUtilities.length;

    const handleEditPress = () => {
        Alert.alert(title, 'What would you like to do?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Edit',
                onPress: () => router.push({ pathname: '/create_workspace', params: { workplace: JSON.stringify(workplace) } }),
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    Alert.alert(
                        'Delete workplace?',
                        `This will permanently delete "${title}" and its reviews. This cannot be undone.`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                    try {
                                        await deleteWorkplace(workplace.id);
                                    } catch (err) {
                                        Alert.alert(
                                            'Could not delete workplace',
                                            err instanceof Error ? err.message : 'Please try again.'
                                        );
                                    }
                                },
                            },
                        ]
                    );
                },
            },
        ]);
    };

    return (
        <Link
            href={{ pathname: '/(detail)/detail', params: { workplace: JSON.stringify(workplace) } }}
            asChild
        >
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    { width },
                    highlighted && styles.cardHighlighted,
                    pressed && styles.cardPressed,
                ]}
            >
                <View>
                    {resolvedImages.length > 0 ? (
                        <ImageCarousel images={resolvedImages} width={width} />
                    ) : (
                        <View style={[styles.imagePlaceholder, { width }]}>
                            <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                        </View>
                    )}
                    <View style={styles.favouriteButtonPosition}>
                        <FavouriteButton workplaceId={workplace.id} />
                    </View>
                    {isOwner && (
                        <View style={styles.editButtonPosition}>
                            <Pressable style={floatingButtonStyle.button} onPress={handleEditPress} hitSlop={8}>
                                <Ionicons name="pencil" size={16} color={Colors.textPrimary} />
                            </Pressable>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleTextGroup}>
                            <Text style={styles.title} numberOfLines={1}>{title}</Text>
                            {distanceLabel && <Text style={styles.distance}>({distanceLabel})</Text>}
                        </View>
                        <View style={workplaceMetaStyles.metaItem}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={workplaceMetaStyles.metaText}>{rating.toFixed(1)}</Text>
                        </View>
                    </View>
                    <Text style={styles.description} numberOfLines={2}>{description}</Text>

                    {utilities?.length > 0 && (
                        <View style={[workplaceMetaStyles.utilities, styles.utilitiesSpacing]}>
                            {visibleUtilities.map((utility) => (
                                <SelectionChip
                                    key={utility}
                                    text={utility}
                                    icon={<Ionicons name={getUtilityIcon(utility)} size={12} color={Colors.textWhite} />}
                                    selected
                                    small
                                />
                            ))}
                            {hiddenUtilityCount > 0 && (
                                <SelectionChip key="more" text={`+${hiddenUtilityCount}`} selected small />
                            )}
                        </View>
                    )}

                    <View style={styles.metaRow}>
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                        <View style={workplaceMetaStyles.liveBox}>
                            <View style={workplaceMetaStyles.metaItem}>
                                <Ionicons name="volume-medium-outline" size={16} color={Colors.textMuted} />
                                <Text style={workplaceMetaStyles.metaText}>{noise}/5</Text>
                            </View>
                            {crowdLevel && (
                                <View style={workplaceMetaStyles.metaItem}>
                                    <Ionicons name={crowdLevel.icon} size={16} color={crowdLevel.color} />
                                    <Text style={[workplaceMetaStyles.metaText, { color: crowdLevel.color }]}>{crowdLevel.label}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.backgroundWhite,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    cardPressed: {
        opacity: 0.85,
    },
    cardHighlighted: {
        borderWidth: 2,
        borderColor: Colors.accent,
    },
    imagePlaceholder: {
        height: 220,
        backgroundColor: Colors.backgroundBase,
        alignItems: 'center',
        justifyContent: 'center',
    },
    favouriteButtonPosition: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    editButtonPosition: {
        position: 'absolute',
        top: 12,
        left: 12,
    },
    content: {
        padding: 12,
        gap: 6,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    titleTextGroup: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        flexShrink: 1,
        minWidth: 0,
    },
    title: {
        ...Typography.body,
        fontWeight: '700',
        color: Colors.textPrimary,
        flexShrink: 1,
    },
    distance: {
        ...Typography.caption,
        color: Colors.textMuted,
        flexShrink: 0,
    },
    description: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.live,
    },
    liveText: {
        ...Typography.caption,
        fontSize: 11,
        fontWeight: '700',
        color: Colors.live,
        letterSpacing: 0.5,
    },
    utilitiesSpacing: {
        marginTop: 4,
    },
});
