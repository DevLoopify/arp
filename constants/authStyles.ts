import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { StyleSheet } from 'react-native';

const authStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backgroundBase,
        padding: 24,
    },
    title: {
        ...Typography.display,
        color: Colors.textPrimary,
    },
    subtitle: {
        ...Typography.body,
        marginTop: 12,
        color: Colors.textSecondary,
        textAlign: 'center',
        maxWidth: 280,
    },
    form: {
        width: '100%',
        gap: 12,
    },
    textButton: {
        ...Typography.caption,
        color: Colors.textSecondary,
        textAlign: 'right',
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerHint: {
        ...Typography.caption,
        color: Colors.textSecondary,
    },
    hint: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginTop: -6,
    },
    registerLink: {
        ...Typography.link,
        color: Colors.primary,
    },
});

export default authStyles;
