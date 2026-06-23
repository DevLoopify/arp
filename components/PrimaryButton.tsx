import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';

export default function PrimaryButton({label, onPress}: {label: string, onPress: () => void}) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.textWhite,
        fontSize: 16,
        fontWeight: '600',
    },
});