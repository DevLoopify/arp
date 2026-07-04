import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import ImageCarousel from './ImageCarousel';

const imageMap = {
    'Unknown.jpg': require('../assets/images/Unknown.jpg'),
    'Unknown-2.jpg': require('../assets/images/Unknown-2.jpg'),
    'Unknown-3.jpg': require('../assets/images/Unknown-3.jpg'),
    'Unknown-4.jpg': require('../assets/images/Unknown-4.jpg'),
    'Unknown-5.jpg': require('../assets/images/Unknown-5.jpg'),
    'Unknown-6.jpg': require('../assets/images/Unknown-6.jpg'),
    'Unknown-7.jpg': require('../assets/images/Unknown-7.jpg'),
    'Unknown-8.jpg': require('../assets/images/Unknown-8.jpg'),
    'Unknown-9.jpg': require('../assets/images/Unknown-9.jpg'),
    'unnamed.jpg': require('../assets/images/unnamed.jpg'),
    'Luisenplatz Darmstadt Innenstadt Entwicklungskonzept 09062023.webp': require('../assets/images/Luisenplatz Darmstadt Innenstadt Entwicklungskonzept 09062023.webp'),
};

function resolveImage (path){
    return imageMap[path.split('/').pop()]
}

const screenWidth = Dimensions.get('window').width;

const crowdLevels = {
    empty: { label: 'Empty', icon: 'people-outline', color: Colors.crowdEmpty },
    slightly_crowded: { label: 'Slightly crowded', icon: 'people-outline', color: Colors.crowdSlight },
    medium_full: { label: 'Medium full', icon: 'people', color: Colors.crowdMedium },
    very_crowded: { label: 'Very crowded', icon: 'people', color: Colors.crowdHigh },
};

function toRad (deg) {
    return (deg * Math.PI) / 180;
}

function getDistanceKm (from, to){
    const R = 6371;
    const dLat = toRad(to.latitude - from.latitude);
    const dLon = toRad(to.longitude - from.longitude);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function formatDistance (km) {
    if (km < 1){
        return `${Math.round(km * 1000)} m away`
    }
    else{
        return `${km.toFixed(1)} km away`
    }
} 

export default function WorkplaceCard({ workplace, width = screenWidth - 32, userLocation }) {
    const { title, description, images, rating, noise, crowdedness, utilities, latitude, longitude } = workplace;
    const resolvedImages = images.map(resolveImage).filter(Boolean);
    const crowdLevel = crowdLevels[crowdedness];
    const distanceLabel = userLocation
        ? formatDistance(getDistanceKm(userLocation, { latitude, longitude }))
        : null;

    return (
        <View style={[styles.card, { width }]}>
            {resolvedImages.length > 0 ? (
                <ImageCarousel images={resolvedImages} width={width} />
            ) : (
                <View style={[styles.imagePlaceholder, { width }]}>
                    <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <View style={styles.titleTextGroup}>
                        <Text style={styles.title} numberOfLines={1}>{title}</Text>
                        {distanceLabel && <Text style={styles.distance}>({distanceLabel})</Text>}
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
                    </View>
                </View>
                <Text style={styles.description} numberOfLines={2}>{description}</Text>

                {utilities?.length > 0 && (
                    <View style={styles.utilities}>
                        {utilities.map((utility) => (
                            <View key={utility} style={styles.chip}>
                                <Text style={styles.chipText}>{utility}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.metaRow}>
                    <View style={styles.liveIndicator}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE</Text>
                    </View>
                    <View style={styles.liveBox}>
                        <View style={styles.metaItem}>
                            <Ionicons name="volume-medium-outline" size={16} color={Colors.textMuted} />
                            <Text style={styles.metaText}>{noise}/5</Text>
                        </View>
                        {crowdLevel && (
                            <View style={styles.metaItem}>
                                <Ionicons name={crowdLevel.icon} size={16} color={crowdLevel.color} />
                                <Text style={[styles.metaText, { color: crowdLevel.color }]}>{crowdLevel.label}</Text>
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
    liveBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: Colors.liveBackground,
        borderWidth: 1,
        borderColor: Colors.liveBorder,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    utilities: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    chip: {
        backgroundColor: Colors.backgroundSubtle,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    chipText: {
        ...Typography.caption,
        fontSize: 12,
        color: Colors.textPrimary,
    },
});
