import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputBase, TouchableOpacity, View } from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import TextButton from '@/components/TextButton';
import { Link } from 'expo-router';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ARP</Text>
            <Text style={styles.subtitle}>
            Nice to meet you! Create an account and start finding the perfect place to work.
            </Text>

            <View style={styles.form}>
                <InputField
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    secureTextEntry={false}
                    keyboardType="default"
                />
                <InputField
                    label="E-Mail"
                    value={email}
                    onChangeText={setEmail}
                    secureTextEntry={false}
                    keyboardType="email-address"
                />
                <InputField
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    keyboardType="default"
                />
                <InputField
                    label="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    keyboardType="default"
                />
                <View style={{ marginTop: 24 }}>
                    <PrimaryButton
                        label="Create Account"
                        onPress={() => console.log('Create Account pressed! Name: ', name, 'Email: ', email, 'Password: ', password)}
                    />
                </View>

                <View style={styles.registerRow}>
                    <Text style={styles.registerHint}>Already have an account? </Text>
                    <Link href="/login" style={styles.registerLink}>
                        Log in
                    </Link>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: 24,
    },
    title: {
        color: '#111827',
        fontSize: 64,
        fontWeight: '800',
    },
    subtitle: {
        marginTop: 12,
        color: '#4b5563',
        fontSize: 16,
        textAlign: 'center',
        maxWidth: 280,
    },
    form: {
        width: '100%',
        marginTop: 24,
        gap: 12,
    },
    textButton: {
        color: '#4b5563',
        fontSize: 14,
        textAlign: 'right',
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerHint: {
        color: '#4b5563',
        fontSize: 14,
    },
    registerLink: {
        color: '#2563EB',
        fontSize: 14,
        fontWeight: '600',
    },
});
