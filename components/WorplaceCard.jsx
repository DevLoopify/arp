import Colors from '@/constants/Colors';
import crowdLevels from '@/constants/crowdLevels';
import Typography from '@/constants/Typography';
import { getUtilityIcon } from '@/constants/utilityIcons';
import workplaceMetaStyles from '@/constants/workplaceMetaStyles';
import { formatDistance, getDistanceKm } from '@/utils/geo';
import { resolveImage } from '@/utils/resolveImage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import FavouriteButton from './FavouriteButton';
import ImageCarousel from './ImageCarousel';

const screenWidth = Dimensions.get('window').width;

export default function WorkplaceCard({ workplace, width = screenWidth - 32, userLocation = null }) {
    const { title, description, images, rating, noise, crowdedness, utilities, latitude, longitude } = workplace;
    const resolvedImages = images.map(resolveImage).filter(Boolean);
    const crowdLevel = crowdLevels[crowdedness];
    const distanceLabel = userLocation
        ? formatDistance(getDistanceKm(userLocation, { latitude, longitude }))
        : null;

    return (
        <View style={[styles.card, { width }]}>
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
            </View>

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <View style={styles.titleTextGroup}>
                        <Link style={styles.title} numberOfLines={1} href={{pathname: '/(detail)/detail', params:{
                            workplace: JSON.stringify(workplace)
                        }}}>{title}</Link>
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
                        {utilities.map((utility) => (
                            <View key={utility} style={workplaceMetaStyles.chip}>
                                <Ionicons name={getUtilityIcon(utility)} size={12} color={Colors.textWhite} />
                                <Text style={workplaceMetaStyles.chipText}>{utility}</Text>
                            </View>
                        ))}
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
        </View>
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
