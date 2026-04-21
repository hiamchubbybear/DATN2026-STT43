import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { AuthBackButton } from '../../../shared/components/AuthBackButton';
import { IconFacebook, IconGoogle, IconApple } from '../../../shared/components/AuthIcons';

export const SignUpScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <AuthBackButton onPress={() => navigation.goBack()} />

                <View style={styles.centerSection}>
                    <Image 
                        source={require('../../../../assets/images/logo.png')} 
                        style={styles.logoImage} 
                        resizeMode="contain"
                    />

                    <Text style={styles.title}>Sign up to continue</Text>

                    <View style={styles.buttonsStack}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={() => navigation.navigate('EmailSignUp')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>Continue with email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.secondaryButton]}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.secondaryButtonText}>Use phone number</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or sign up with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                           <IconFacebook size={28} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                           <IconGoogle size={28} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                           <IconApple size={28} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomLinks}>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Terms of use</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F3F3F3',
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 28,
        backgroundColor: '#F3F3F3',
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 22,
    },
    logoImage: {
        width: 92,
        height: 92,
        borderRadius: 46,
    },
    title: {
        color: '#111111',
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
    },
    buttonsStack: {
        width: '100%',
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#EF4444',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    secondaryButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#D9D9D9',
    },
    dividerText: {
        color: '#9CA3AF',
        fontSize: 12,
    },
    socialRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 14,
    },
    socialBtn: {
        width: 64,
        height: 64,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    bottomLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    linkText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '500',
    },
});
