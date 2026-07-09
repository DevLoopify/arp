import CrowdChart from "@/components/CrowdChart";
import FavouriteButton from "@/components/FavouriteButton";
import IconButton from "@/components/IconButton";
import ImageCarousel from "@/components/ImageCarousel";
import ReviewCard from "@/components/ReviewCard";
import SelectionChip from "@/components/SelectionChip";
import Colors from "@/constants/Colors";
import crowdLevels from "@/constants/crowdLevels";
import floatingButtonStyle from "@/constants/floatingButtonStyle";
import Typography from "@/constants/Typography";
import { getUtilityIcon } from "@/constants/utilityIcons";
import workplaceMetaStyles from "@/constants/workplaceMetaStyles";
import { useAuth } from "@/context/AuthContext";
import { useWorkplaces } from "@/context/WorkplacesContext";
import { getAvatarUri } from "@/utils/avatar";
import { resolveImage } from "@/utils/resolveImage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from "react";
import { Alert, Dimensions, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function DetailScreen(){
    const { workplace, reviewSubmitted } = useLocalSearchParams<{ workplace: string; reviewSubmitted?: string }>();
    const parsedWorkplace = JSON.parse(workplace);
    const [showReviewToast, setShowReviewToast] = useState(false);

    useEffect(() => {
        if (!reviewSubmitted) return;
        setShowReviewToast(true);
        const timeout = setTimeout(() => setShowReviewToast(false), 1200);
        return () => clearTimeout(timeout);
    }, [reviewSubmitted]);
    const { rating, noise, crowdedness, reviews, utilities } = parsedWorkplace;
    const { user } = useAuth();
    const { deleteReview } = useWorkplaces();
    const resolvedImages = parsedWorkplace.images.map(resolveImage).filter(Boolean);
    const currentHour = new Date().getHours();
    const liveCrowdedness = parsedWorkplace.crowdByHourToday?.[currentHour] ?? crowdedness;
    const crowdLevel = crowdLevels[liveCrowdedness];
    const handleShare = () => {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${parsedWorkplace.latitude},${parsedWorkplace.longitude}`;
        Share.share({
            title: parsedWorkplace.title,
            message: `${parsedWorkplace.title}\n${mapsUrl}`,
        });
    };
    const handleEditReview = (review: { id: number }) => {
        router.push({ pathname: '/(detail)/review', params: { workplace, review: JSON.stringify(review) } });
    };
    const handleDeleteReview = async (reviewId: number) => {
        try {
            await deleteReview(reviewId);
        } catch (err) {
            Alert.alert('Could not delete review', err instanceof Error ? err.message : 'Please try again.');
        }
    };
    return(
        <>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.imageContainer}>
                <ImageCarousel images={resolvedImages} width={screenWidth} height={screenHeight / 2} />
                <View style={[styles.backButtonPosition, floatingButtonStyle.button]}>
                    <IconButton
                        icon={<Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />}
                        clickHandler={() => router.back()}
                    />
                </View>
                <View style={styles.topRightActions}>
                    <Pressable style={floatingButtonStyle.button} onPress={handleShare} hitSlop={8}>
                        <Ionicons name="share-outline" size={20} color={Colors.textPrimary} />
                    </Pressable>
                    <FavouriteButton workplaceId={parsedWorkplace.id} />
                </View>
            </View>
            <Text style={styles.title}>{parsedWorkplace.title}</Text>
            <View style={styles.metaRow}>
                <View style={workplaceMetaStyles.metaItem}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={workplaceMetaStyles.metaText}>{rating.toFixed(1)}</Text>
                </View>
                <View style={styles.liveBoxWrapper}>
                    <Text style={styles.liveLabel}>Live</Text>
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
                <View style={workplaceMetaStyles.metaItem}>
                    <Ionicons name="chatbubble-outline" size={16} color={Colors.textMuted} />
                    <Text style={workplaceMetaStyles.metaText}>{reviews.length} reviews</Text>
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionHeading}>Utilities</Text>
                <View style={[styles.utilitiesGrid, styles.utilitiesSpacing]}>
                    {utilities?.map((utility: string) => (
                        <SelectionChip
                            key={utility}
                            text={utility}
                            icon={<Ionicons name={getUtilityIcon(utility)} size={16} color={Colors.textWhite} />}
                            selected
                        />
                    ))}
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionHeading}>Live Capacity</Text>
                <CrowdChart
                    average={parsedWorkplace.crowdByHourAverage}
                    today={parsedWorkplace.crowdByHourToday}
                    currentHour={currentHour}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionHeading}>Reviews</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.reviewsRow}
                >
                    {reviews?.map((review: { id: number; userId?: number; author: string; rating: number; comment: string; date: string }) => (
                        <ReviewCard
                            key={review.id}
                            author={review.author}
                            rating={review.rating}
                            comment={review.comment}
                            date={review.date}
                            avatarUri={getAvatarUri(review.id)}
                            isOwner={user != null && review.userId === user.id}
                            onEdit={() => handleEditReview(review)}
                            onDelete={() => handleDeleteReview(review.id)}
                        />
                    ))}
                </ScrollView>
            </View>
            {(parsedWorkplace.phoneNumber || parsedWorkplace.email) && (
                <View style={styles.section}>
                    <Text style={styles.sectionHeading}>Contact</Text>
                    <View style={[styles.contactList, styles.utilitiesSpacing]}>
                        {parsedWorkplace.phoneNumber && (
                            <Pressable
                                style={styles.contactRow}
                                onPress={() => Linking.openURL(`tel:${parsedWorkplace.phoneNumber}`)}
                            >
                                <Ionicons name="call-outline" size={18} color={Colors.primary} />
                                <Text style={styles.contactText}>{parsedWorkplace.phoneNumber}</Text>
                            </Pressable>
                        )}
                        {parsedWorkplace.email && (
                            <Pressable
                                style={styles.contactRow}
                                onPress={() => Linking.openURL(`mailto:${parsedWorkplace.email}`)}
                            >
                                <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                                <Text style={styles.contactText}>{parsedWorkplace.email}</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            )}
        </ScrollView>

        <Modal visible={showReviewToast} transparent animationType="fade">
            <View style={styles.toastOverlay} pointerEvents="none">
                <View style={styles.toast}>
                    <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                    <Text style={styles.toastText}>
                        {reviewSubmitted === 'updated' ? 'Review updated' : 'Review submitted'}
                    </Text>
                </View>
            </View>
        </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundBase,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    imageContainer: {
        width: '100%',
        height: screenHeight / 2,
    },
    backButtonPosition: {
        position: 'absolute',
        top: 48,
        left: 16,
    },
    topRightActions: {
        position: 'absolute',
        top: 48,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        ...Typography.body,
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 12,
        padding: 12,
    },
    section: {
        marginTop: 24,
        marginBottom: 8,
    },
    utilitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    utilitiesSpacing: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    sectionHeading: {
        ...Typography.body,
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        paddingHorizontal: 16,
    },
    reviewsRow: {
        gap: 12,
        paddingHorizontal: 16,
        marginTop: 8,
    },
    contactList: {
        gap: 12,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    contactText: {
        ...Typography.body,
        color: Colors.textPrimary,
    },
    liveBoxWrapper: {
        alignItems: 'center',
        gap: 2,
    },
    liveLabel: {
        ...Typography.caption,
        fontSize: 11,
        fontWeight: '700',
        color: Colors.live,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
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