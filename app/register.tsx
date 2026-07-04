import React, { useState } from 'react';
import { View, Text } from 'react-native';
import InputField from '../components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import TextButton from '@/components/TextButton';
import { Link } from 'expo-router';
import authStyles from '@/constants/authStyles';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');

    return (
        <View style={authStyles.container}>
            <Text style={authStyles.title}>ARP</Text>
            <Text style={authStyles.subtitle}>
            Nice to meet you! Create an account and start finding the perfect place to work.
            </Text>

            <View style={[authStyles.form, { marginTop: 24 }]}>
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

                <View style={authStyles.registerRow}>
                    <Text style={authStyles.registerHint}>Already have an account? </Text>
                    <Link href="/login" style={authStyles.registerLink}>
                        Log in
                    </Link>
                </View>
            </View>
        </View>
    );
}
