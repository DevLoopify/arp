import React, { useState } from 'react';
import { Alert, View, Text } from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import TextButton from '@/components/TextButton';
import { Link, router } from 'expo-router';
import authStyles from '@/constants/authStyles';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/utils/api';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        setIsSubmitting(true);
        try {
            await login(email, password);
            router.replace('/(tabs)/explore');
        } catch (err) {
            const message = err instanceof ApiError ? err.message : 'Could not reach the server.';
            Alert.alert('Login failed', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={authStyles.container}>
            <Text style={authStyles.title}>ARP</Text>
            <Text style={authStyles.subtitle}>
            Log in to your account and start finding the perfect place to work.
            </Text>

            <View style={[authStyles.form, { marginTop: 64 }]}>
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
                    textStyle={authStyles.textButton}
                />
                <View style={{ marginTop: 36 }}>
                    <PrimaryButton
                        label={isSubmitting ? 'Logging in...' : 'Log In'}
                        onPress={handleLogin}
                    />
                </View>

                <View style={authStyles.registerRow}>
                    <Text style={authStyles.registerHint}>Don't have an account yet? </Text>
                    <Link href="/register" style={authStyles.registerLink}>
                        Create One
                    </Link>
                </View>
            </View>
        </View>
    );
}
