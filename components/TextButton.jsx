import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function TextButton({label, onPress, textStyle}) {
    return (
        <TouchableOpacity onPress={onPress}>
            <Text style={textStyle}>{label}</Text>
        </TouchableOpacity>
    );
}