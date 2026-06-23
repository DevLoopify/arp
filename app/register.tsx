import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputBase, TouchableOpacity, View } from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import TextButton from '@/components/TextButton';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';

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
        marginTop: 24,
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
