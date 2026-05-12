import { ResponseType } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { RootStackParamList } from "../../../app/navigation/RootNavigator";
import { useAuthStore } from "../../../store/authStore";
import { AuthBackButton } from "../../../shared/components/AuthBackButton";
import { useToast } from "../../../shared/components/ToastProvider";

const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "792593212502-636i3fh12fe1m5makdjar4mvg6ufrcm8.apps.googleusercontent.com";
const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
  "792593212502-gtpc459mcq4qe1gqm4q4b57m1e0ouq26.apps.googleusercontent.com";
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

WebBrowser.maybeCompleteAuthSession();

const GoogleIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

export const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useToast();
  const isExpoGo = Constants.executionEnvironment === "storeClient";

  const redirectUriOptions = React.useMemo(
    () =>
      isExpoGo
        ? {
            useProxy: true,
            projectNameForProxy: "@tranvanhuy16032004/datn-2026",
          }
        : {
            scheme: "datn2026",
          },
    [isExpoGo]
  );

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
    },
    redirectUriOptions as any
  );

  const handleGoogleSignIn = async () => {
    try {
      if (Platform.OS === "android" && !GOOGLE_ANDROID_CLIENT_ID) {
        throw new Error(
          "Thiếu EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID trong .env. Hãy tạo Android OAuth Client (SHA-1) trong Google Cloud Console."
        );
      }

      if (!request) {
        throw new Error("Google auth request chưa sẵn sàng. Vui lòng thử lại.");
      }

      setLoading(true);
      console.log("🚀 [Google] Bắt đầu Google Auth Session...");

      const result = await promptAsync();
      if (result.type === "cancel" || result.type === "dismiss") {
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
      console.error("❌ [Google] Lỗi mở Google Auth:", error);
      showToast({
        title: "Lỗi Đăng Nhập",
        message: error.message || "Không thể đăng nhập bằng Google",
        type: "error"
      });
    }
  };

  const setAuth = useAuthStore(state => state.setAuth);

  const handleBackendLogin = React.useCallback(async (idToken?: string, accessToken?: string) => {
    try {
      const API_URL = `${
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5017"
      }/api/auth/google-login`;

      console.log("📡 [API] Gửi request tới:", API_URL);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, accessToken }),
      });

      const data = await res.json();
      console.log("📡 [API] Response:", JSON.stringify(data, null, 2));

      // Check for data.data because I updated the backend to wrap it in ApiResponse
      const authData = data.data || (data.accessToken ? data : null);
      console.log("🔍 [Google] Parsed authData:", JSON.stringify(authData, null, 2));

      if (res.ok && authData && authData.accessToken) {
        showToast({
          title: 'Thành công',
          message: 'Đăng nhập bằng Google thành công!',
          type: 'success'
        });
        setAuth(
          authData.user || { id: authData.userId || '', email: '' },
          authData.accessToken, 
          authData.refreshToken,
          authData.isProfileCompleted
        );
        console.log("✅ [API] Đăng nhập thành công! RootNavigator sẽ tự chuyển màn hình.");
      } else {
        const errorMsg = data?.message || data?.Message || data?.detail || data?.Detail || "Đăng nhập thất bại (Invalid structure)";
        showToast({
          title: "Lỗi",
          message: errorMsg,
          type: "error"
        });
      }
    } catch (error) {
      console.error("❌ [API] Network error:", error);
      showToast({
        title: "Lỗi Kết Nối",
        message: "Không thể kết nối đến Server. Kiểm tra IP và cổng Backend.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  }, [navigation, setAuth, showToast]);

  React.useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === "success") {
      const idToken =
        (response as any)?.params?.id_token ||
        (response as any)?.authentication?.idToken;
      
      const accessToken = 
        (response as any)?.params?.access_token ||
        (response as any)?.authentication?.accessToken;

      if (idToken || accessToken) {
        console.log("📨 [Google] Token nhận được, gửi tới Backend...");
        handleBackendLogin(idToken, accessToken);
      } else {
        setLoading(false);
        showToast({
          title: "Lỗi Đăng Nhập",
          message: "Không nhận được token từ Google.",
          type: "error"
        });
      }
    } else if (response.type === "error") {
      setLoading(false);
      const message =
        (response as any)?.error?.message || "Không thể đăng nhập bằng Google";
      showToast({
        title: "Lỗi Đăng Nhập",
        message: message,
        type: "error"
      });
    }
  }, [handleBackendLogin, response, showToast]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AuthBackButton onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../../assets/images/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Sign in to continue</Text>
          <Text style={styles.subtitle}>Welcome back! Please enter your details to continue your journey.</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate("EmailLogin")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Continue with email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("EmailLogin")} // Assuming we want login by default
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or sign in with</Text>
          <View style={styles.line} />
        </View>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[styles.socialBtn, loading && styles.socialBtnDisabled]}
            disabled={loading}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#4285F4" />
            ) : (
              <View style={styles.socialBtnContent}>
                <GoogleIcon />
                <Text style={styles.socialBtnText}>Google</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.footerLink}>Create Account</Text>
          </TouchableOpacity>
          <View style={styles.footerDivider} />
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPasswordEmail")}>
            <Text style={styles.footerLink}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.privacyLink}>
          <Text style={styles.privacyText}>By continuing, you agree to our Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  logoWrapper: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    padding: 2,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  welcomeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18181B',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#EE3F57',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#EE3F57',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F4F4F5',
    marginTop: 8,
  },
  secondaryBtnText: {
    color: '#18181B',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 32,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#F4F4F5',
  },
  orText: {
    paddingHorizontal: 16,
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialContainer: {
    width: '100%',
  },
  socialBtn: {
    width: '100%',
    height: 60,
    borderWidth: 1.5,
    borderColor: '#F4F4F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
  },
  socialBtnDisabled: {
    opacity: 0.5,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  footerLink: {
    color: '#EE3F57',
    fontSize: 15,
    fontWeight: '700',
  },
  footerDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  privacyLink: {
    marginTop: 4,
  },
  privacyText: {
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
  },
});
