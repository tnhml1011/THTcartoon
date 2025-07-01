import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import auth from '@react-native-firebase/auth';
import { TextInput, Provider as PaperProvider } from 'react-native-paper';

const bg = require('../assets/bg_1.png');

const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    setSuccess(false);
    
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Email phải đúng định dạng @gmail.com');
      return;
    }

    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      setSuccess(true);
      setEmail('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.header}>Đặt lại mật khẩu</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {success ? (
              <Text style={styles.success}>
                Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.
              </Text>
            ) : null}
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
            <TouchableOpacity
              style={[styles.resetBtn, loading && styles.disabledBtn]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.resetBtnText}>
                {loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>Quay lại đăng nhập</Text>
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
  success: {
    color: '#2ecc71',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  resetBtn: {
    backgroundColor: '#2196f3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  disabledBtn: {
    backgroundColor: '#95a5a6',
  },
  resetBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  backBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#007bff',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
}); 