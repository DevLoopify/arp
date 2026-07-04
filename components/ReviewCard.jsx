import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function ReviewCard({ author, rating, comment, date, avatarUri }) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.avatarColumn}>
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                                key={star}
                                name={star <= rating ? 'star' : 'star-outline'}
                                size={12}
                                color="#FFD700"
                            />
                        ))}
                    </View>
                </View>
                <View style={styles.nameColumn}>
                    <Text style={styles.name} numberOfLines={1}>{author}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
            </View>
            <Text style={styles.comment}>{comment}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 220,
        backgroundColor: Colors.backgroundWhite,
        borderRadius: 16,
        padding: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        gap: 10,
    },
    avatarColumn: {
        alignItems: 'center',
        gap: 4,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    stars: {
        flexDirection: 'row',
    },
    nameColumn: {
        flex: 1,
        justifyContent: 'center',
        gap: 2,
    },
    name: {
        ...Typography.body,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    date: {
        ...Typography.caption,
        fontSize: 12,
        color: Colors.textMuted,
    },
    comment: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
});
