import CrowdChart from "@/components/CrowdChart";
import ImageCarousel from "@/components/ImageCarousel";
import Colors from "@/constants/Colors";
import crowdLevels from "@/constants/crowdLevels";
import Typography from "@/constants/Typography";
import { resolveImage } from "@/utils/resolveImage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function DetailScreen(){
    const { workplace } = useLocalSearchParams<{ workplace: string }>();
    const parsedWorkplace = JSON.parse(workplace);
    const { rating, noise, crowdedness, reviews, utilities } = parsedWorkplace;
    const resolvedImages = parsedWorkplace.images.map(resolveImage).filter(Boolean);
    const crowdLevel = crowdLevels[crowdedness];
    return(
        <ScrollView>
            <View style={styles.imageContainer}>
                <ImageCarousel images={resolvedImages} width={screenWidth} height={screenHeight / 2} />
            </View>
            <Text style={styles.title}>{parsedWorkplace.title}</Text>
            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
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
                <View style={styles.metaItem}>
                    <Ionicons name="chatbubble-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{reviews.length} reviews</Text>
                </View>
            </View>
            <View>
                <Text>Utilities</Text>
                <View style={styles.utilities}>
                    {utilities?.map((utility: string) => (
                        <View key={utility} style={styles.chip}>
                            <Text style={styles.chipText}>{utility}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <View>
                <Text>Live Capacity</Text>
                <CrowdChart
                    average={parsedWorkplace.crowdByHourAverage}
                    today={parsedWorkplace.crowdByHourToday}
                    currentHour={new Date().getHours()}
                />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    imageContainer: {
        width: '100%',
        height: screenHeight / 2,
    },
    title: {
        ...Typography.body,
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 12,
        padding: 12,
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
    utilities: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        padding: 12,
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