import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import { StyleSheet } from 'react-native';

const workplaceMetaStyles = StyleSheet.create({
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
    },
});

export default workplaceMetaStyles;
