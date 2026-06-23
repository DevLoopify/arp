import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputBase, TouchableOpacity, View } from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import TextButton from '@/components/TextButton';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ARP</Text>
            <Text style={styles.subtitle}>
            Log in to your account and start finding the perfect place to work.
            </Text>

            <View style={styles.form}>
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
                <TextButton
                    label="Forgot password?"
                    onPress={() => console.log('Forgot password pressed!')}
                    textStyle={styles.textButton}
                />
                <View style={{ marginTop: 36 }}>
                    <PrimaryButton
                        label="Log In"
                        onPress={() => router.replace('/(tabs)/explore')}
                    />
                </View>

                <View style={styles.registerRow}>
                    <Text style={styles.registerHint}>Don't have an account yet? </Text>
                    <Link href="/register" style={styles.registerLink}>
                        Create One
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
        backgroundColor: Colors.backgroundBase,
        padding: 24,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: 64,
        fontWeight: '800',
    },
    subtitle: {
        marginTop: 12,
        color: Colors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        maxWidth: 280,
    },
    form: {
        width: '100%',
        marginTop: 64,
        gap: 12,
    },
    textButton: {
        color: Colors.textSecondary,
        fontSize: 14,
        textAlign: 'right',
    },
    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    registerHint: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    registerLink: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
