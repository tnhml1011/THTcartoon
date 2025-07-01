import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAsyncStorageCredentials() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const saveCredentials = useCallback(async () => {
    if (rememberMe) {
      await AsyncStorage.setItem('userCredentials', JSON.stringify({ email, password }));
    } else {
      await AsyncStorage.removeItem('userCredentials');
    }
  }, [email, password, rememberMe]);

  const clearCredentials = useCallback(async () => {
    await AsyncStorage.removeItem('userCredentials');
    setEmail('');
    setPassword('');
    setRememberMe(false);
  }, []);

  const loadCredentials = useCallback(async () => {
    const creds = await AsyncStorage.getItem('userCredentials');
    if (creds) {
      const { email, password } = JSON.parse(creds);
      setEmail(email);
      setPassword(password);
      setRememberMe(true);
    }
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    saveCredentials,
    clearCredentials,
    loadCredentials,
  };
} 