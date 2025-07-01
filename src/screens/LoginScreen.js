import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Provider as PaperProvider } from 'react-native-paper';
import useAsyncStorageCredentials from '../hooks/useAsyncStorageCredentials';

const bg = require('../assets/bg_1.png');

const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

export default function LoginScreen({ navigation }) {
  const {
    email, setEmail, password, setPassword,
    rememberMe, setRememberMe,
    saveCredentials, clearCredentials, loadCredentials
  } = useAsyncStorageCredentials();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email phải đúng định dạng @gmail.com');
      return;
    }
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      if (rememberMe) {
        await saveCredentials({ email, password });
      } else {
        await clearCredentials();
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  // Đăng xuất: xóa sạch AsyncStorage
  const handleLogout = async () => {
    await auth().signOut();
    await clearCredentials();
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Image source={bg} style={styles.bg} resizeMode="cover" />
        <View style={styles.centeredContainer}>
          <View style={styles.formCard}>
            <Text style={styles.header}>Đăng nhập</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
              label="Email (@gmail.com)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
            />
            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />
            <View style={styles.rowBetween}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkIcon}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Lưu đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>ĐĂNG NHẬP</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 24 }}>
              <Text style={styles.registerText}>Chưa có tài khoản? <Text style={{ color: '#007bff' }}>Đăng ký ngay</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  bg: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    zIndex: 0,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  formCard: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'stretch',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f8fafd',
  },
  error: {
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  checkIcon: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: -1,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  forgotText: {
    color: '#007bff',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loginBtn: {
    backgroundColor: '#2196f3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  registerText: {
    textAlign: 'center',
    color: '#222',
    fontSize: 15,
    marginTop: 10,
  },
});
