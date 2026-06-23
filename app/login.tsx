import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputBase, TouchableOpacity, View } from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import TextButton from '@/components/TextButton';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

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
        marginTop: 64,
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
    registerLink: {
        ...Typography.link,
        color: Colors.primary,
    },
});
