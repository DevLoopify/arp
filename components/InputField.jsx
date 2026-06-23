import { StyleSheet, TextInput } from 'react-native';

export default function InputField({label, value, onChangeText, secureTextEntry, keyboardType}) {
    return (
        <TextInput
            style={styles.input}
            placeholder={label}
            placeholderTextColor="#9ca3af"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize="none"
            autoCorrect={false}
        />
    );
}

const styles = StyleSheet.create(
    {
        input: {
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#d1e1fa',
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            fontSize: 16,
            color: '#111827',
        },
    }
);