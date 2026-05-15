import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { AuthBackButton } from '../../../shared/components/AuthBackButton';
import { IconFacebook, IconGoogle, IconApple } from '../../../shared/components/AuthIcons';
import { normalizeFont, radius, scale, spacing } from '../../../shared/utils/responsive';
import { useTranslation } from 'react-i18next';

export const SignUpScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <AuthBackButton onPress={() => navigation.goBack()} />

                <View style={styles.centerSection}>
                    <Image 
                        source={require('../../../../assets/images/logo_v2.png')} 
                        style={styles.logoImage} 
                        resizeMode="contain"
                    />

                    <Text style={styles.title}>{t('auth.signUp_title')}</Text>

                    <View style={styles.buttonsStack}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={() => navigation.navigate('EmailSignUp')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>{t('auth.continueWithEmail')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>{t('auth.orSignInWith')}</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                           <IconGoogle size={28} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomLinks}>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>{t('auth.terms_of_use')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>{t('auth.privacy_policy')}</Text>
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
        paddingHorizontal: spacing(24),
        paddingTop: spacing(16),
        paddingBottom: spacing(28),
        backgroundColor: '#F3F3F3',
    },
    centerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing(22),
    },
    logoImage: {
        width: scale(92),
        height: scale(92),
        borderRadius: radius(46),
    },
    title: {
        color: '#111111',
        fontSize: normalizeFont(28),
        fontWeight: '600',
        textAlign: 'center',
    },
    buttonsStack: {
        width: '100%',
        gap: spacing(12),
        marginTop: spacing(8),
    },
    actionButton: {
        width: '100%',
        paddingVertical: spacing(16),
        borderRadius: radius(16),
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#EF4444',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: normalizeFont(16),
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    secondaryButtonText: {
        color: '#EF4444',
        fontSize: normalizeFont(16),
        fontWeight: '600',
    },
    dividerRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing(8),
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#D9D9D9',
    },
    dividerText: {
        color: '#9CA3AF',
        fontSize: normalizeFont(12),
    },
    socialRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing(14),
    },
    socialBtn: {
        width: scale(64),
        height: scale(64),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: radius(16),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    bottomLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing(24),
    },
    linkText: {
        color: '#EF4444',
        fontSize: normalizeFont(13),
        fontWeight: '500',
    },
});
