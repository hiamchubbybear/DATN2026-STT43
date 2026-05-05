import { ResponseType } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  ActivityIndicator,
  Alert,
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
import { normalizeFont, radius, scale, spacing, verticalScale } from "../../../shared/utils/responsive";

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
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      responseType: ResponseType.Token,
      shouldAutoExchangeCode: false,
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
      Alert.alert("Lỗi Đăng Nhập", error.message || "Không thể đăng nhập bằng Google");
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
        Alert.alert('Success', 'Google login successful!');
        setAuth(
          authData.user || { id: authData.userId || '', email: '', username: '' },
          authData.accessToken, 
          authData.refreshToken,
          authData.isProfileCompleted
        );
        console.log("✅ [API] Đăng nhập thành công! Điều hướng về Home...");
        navigation.replace("MainTabs");
      } else {
        Alert.alert("Lỗi", data.message || "Đăng nhập thất bại (Invalid structure)");
      }
    } catch (error) {
      console.error("❌ [API] Network error:", error);
      Alert.alert(
        "Lỗi Kết Nối",
        "Không thể kết nối đến Server. Kiểm tra IP và cổng Backend."
      );
    } finally {
      setLoading(false);
    }
  }, [navigation, setAuth]);

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
        Alert.alert("Lỗi Đăng Nhập", "Không nhận được token từ Google.");
      }
    } else if (response.type === "error") {
      setLoading(false);
      const message =
        (response as any)?.error?.message || "Không thể đăng nhập bằng Google";
      Alert.alert("Lỗi Đăng Nhập", message);
    }
  }, [handleBackendLogin, response]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.backButtonWrapper}>
          <AuthBackButton onPress={() => navigation.goBack()} />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../../../assets/images/logo.png')} style={styles.logoImage} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Sign in to continue</Text>

        {/* Email Button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("EmailLogin")}
        >
          <Text style={styles.primaryBtnText}>Continue with email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testBtn}
          onPress={() => navigation.navigate('TestHub')}
        >
          <Text style={styles.testBtnText}>Test</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        {/* Social Login */}
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[styles.socialBtn, loading && styles.socialBtnDisabled]}
            disabled={loading}
            onPress={handleGoogleSignIn}
          >
            {loading ? <ActivityIndicator color="#4285F4" /> : <GoogleIcon />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.footerLink}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ForgotPasswordEmail")}>
          <Text style={styles.footerLink}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingHorizontal: spacing(24),
    paddingTop: Platform.OS === "ios" ? spacing(10) : spacing(20),
    paddingBottom: spacing(10),
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: radius(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing(24),
    paddingTop: Platform.OS === "ios" ? spacing(20) : spacing(40),
  },
  backButtonWrapper: {
    position: "absolute",
    top: spacing(16),
    left: spacing(24),
    zIndex: 10,
  },
  logoContainer: { marginBottom: spacing(40) },
  logoImage: {
    width: scale(100),
    height: scale(100),
    borderRadius: radius(24),
  },
  title: {
    fontSize: normalizeFont(22),
    fontWeight: "700",
    color: "#000000",
    marginBottom: spacing(30),
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#EF4444",
    paddingVertical: spacing(16),
    borderRadius: radius(16),
    alignItems: "center",
    marginBottom: spacing(12),
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: normalizeFont(16), fontWeight: "600" },
  testBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius(16),
    borderWidth: 1,
    borderColor: '#EE3F57',
    paddingVertical: spacing(14),
    alignItems: 'center',
    marginBottom: spacing(26),
  },
  testBtnText: {
    color: '#EE3F57',
    fontSize: normalizeFont(16),
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: spacing(30),
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  orText: { paddingHorizontal: spacing(16), color: "#374151", fontSize: normalizeFont(14) },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  socialBtn: {
    width: scale(72),
    height: scale(72),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: radius(20),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  socialBtnDisabled: { opacity: 0.5 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: Platform.OS === "ios" ? spacing(40) : spacing(20),
    width: "100%",
  },
  footerLink: { color: "#EF4444", fontSize: normalizeFont(14), fontWeight: "500" },
});
