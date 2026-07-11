import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { useAuth } from '@/context/AuthContext';
import { api, AppNotification } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text } from 'react-native';

const POLL_INTERVAL_MS = 5000;

export default function NotificationBanner() {
    const { token } = useAuth();
    const [notification, setNotification] = useState<AppNotification | null>(null);
    const slideAnim = useRef(new Animated.Value(-200)).current;

    useEffect(() => {
        if (!token) return;

        let cancelled = false;
        const poll = async () => {
            try {
                const { notification: incoming } = await api.notifications.poll(token);
                if (!cancelled && incoming) {
                    setNotification(incoming);
                }
            } catch {
            }
        };

        poll();
        const interval = setInterval(poll, POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [token]);

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: notification ? 0 : -200,
            useNativeDriver: true,
            bounciness: 6,
        }).start();
    }, [notification]);

    const dismiss = () => setNotification(null);

    const handlePress = () => {
        if (!notification) return;
        dismiss();
        if (notification.action === 'checkup') {
            router.push('/checkup');
        }
    };

    if (!notification) return null;

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable style={styles.banner} onPress={handlePress}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} style={styles.icon} />
                <Text style={styles.message} numberOfLines={3}>
                    {notification.message}
                </Text>
                <Pressable style={styles.closeButton} onPress={dismiss} hitSlop={8}>
                    <Ionicons name="close" size={18} color={Colors.textMuted} />
                </Pressable>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingTop: Platform.OS === 'ios' ? 56 : 32,
        paddingHorizontal: 12,
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        borderRadius: 16,
        padding: 12,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    icon: {
        marginTop: 1,
    },
    message: {
        ...Typography.body,
        flex: 1,
        fontSize: 14,
        color: Colors.textPrimary,
    },
    closeButton: {
        padding: 4,
    },
});
