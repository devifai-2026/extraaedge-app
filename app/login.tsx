import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const PRIMARY_RED = '#E53935';
const SECONDARY_BLACK = '#000000';
const BACKGROUND_WHITE = '#FFFFFF';
const INPUT_GREY = '#F5F5F5';
const TEXT_GREY = '#757575';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Section: Logo & Welcome */}
          <Animated.View 
            entering={FadeInDown.duration(800).delay(200)}
            style={styles.header}
          >
            <View style={styles.logoCircle}>
              <View style={styles.logoInner}>
                <View style={styles.logoMark} />
              </View>
            </View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Login to continue managing your leads</Text>
          </Animated.View>

          {/* Middle Section: Inputs with Icons */}
          <Animated.View 
            entering={FadeInDown.duration(800).delay(400)}
            style={styles.form}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={TEXT_GREY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@company.com"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={TEXT_GREY} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#9E9E9E"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={TEXT_GREY} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary CTA */}
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Secondary Option */}
            <TouchableOpacity style={styles.otpButton}>
              <Text style={styles.otpButtonText}>Login with OTP</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom Section: Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>ExtraaEdge CRM v1.0.0</Text>
            <Text style={styles.footerSubText}>Built for Education Excellence</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_WHITE,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: PRIMARY_RED,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: PRIMARY_RED,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  logoInner: {
    width: 40,
    height: 40,
    borderWidth: 5,
    borderColor: BACKGROUND_WHITE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoMark: {
    width: 15,
    height: 15,
    backgroundColor: BACKGROUND_WHITE,
    borderRadius: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: SECONDARY_BLACK,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    color: TEXT_GREY,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SECONDARY_BLACK,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: INPUT_GREY,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: SECONDARY_BLACK,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: PRIMARY_RED,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: PRIMARY_RED,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  loginButtonText: {
    color: BACKGROUND_WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  otpButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
  },
  otpButtonText: {
    color: SECONDARY_BLACK,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#BDBDBD',
    fontWeight: '600',
    letterSpacing: 1,
  },
  footerSubText: {
    fontSize: 10,
    color: '#E0E0E0',
    marginTop: 4,
  },
});
