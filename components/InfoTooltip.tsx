import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet } from 'react-native';

export default function InfoTooltip({ title, message }: { title: string; message: string }) {
    return (
        <Pressable onPress={() => Alert.alert(title, message)} hitSlop={8} style={styles.button}>
            <Ionicons name="help-circle" size={18} color={Colors.primary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        marginLeft: 6,
    },
});
