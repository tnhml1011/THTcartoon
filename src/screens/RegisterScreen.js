import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { TextInput, Provider as PaperProvider } from 'react-native-paper';
import { validateEmail, validatePhone } from '../utils/validate';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!username || !phone || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Số điện thoại không hợp lệ (9-11 số).');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email phải đúng định dạng @gmail.com.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { uid } = userCredential.user;
      await firestore()
        .collection('users')
        .doc(uid)
        .set({
          username: username.trim(),
          phone: phone.trim(),
          email: email.trim(),
          role: 'user',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      await auth().signOut();
      alert('Tạo tài khoản thành công!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.header}>Đăng ký tài khoản</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            label="Tên người dùng"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="phone" />}
          />
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
            label="Mật khẩu (tối thiểu 6 ký tự)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
          />
          <TextInput
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock-check" />}
            right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    paddingVertical: 32,
  },
  card: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'stretch',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f8fafd',
  },
  button: {
    backgroundColor: '#2196f3',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  error: {
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 15,
  },
  linkText: {
    color: '#007bff',
    textAlign: 'center',
    fontSize: 15,
    marginTop: 10,
  },
});
