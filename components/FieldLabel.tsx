import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import InfoTooltip from './InfoTooltip';

export default function FieldLabel({
    label,
    textStyle,
    containerStyle,
    tooltipTitle,
    tooltipMessage,
}: {
    label: string;
    textStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    tooltipTitle?: string;
    tooltipMessage: string;
}) {
    return (
        <View style={[styles.row, containerStyle]}>
            <Text style={textStyle}>{label}</Text>
            <InfoTooltip title={tooltipTitle ?? label} message={tooltipMessage} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
