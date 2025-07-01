// App.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, TouchableOpacity, Modal, Text, StyleSheet, Alert } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';

import useUserRole from './src/hooks/useUserRole'; // 👈 Mới thêm
import HomeScreen from './src/screens/HomeScreen';
import VideoScreen from './src/screens/VideoScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SavedScreen from './src/screens/SavedScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDrawer from './Admin/admin_routers/AdminDrawer'; // 👈 Navigation riêng cho admin
import MenuModal from './src/components/MenuModal';
import SplashScreen from './src/screens/SplashScreen'; // Thêm import
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
const Stack = createStackNavigator();
const navigationRef = createNavigationContainerRef();

// ... giữ nguyên MenuModal ...

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showSplash, setShowSplash] = useState(true); // Thêm state splash

  const { role, loading: roleLoading } = useUserRole(); // 👈 lấy role người dùng

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000); // 2 giây
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(usr => {
      setUser(usr);
      setInitializing(false);
    });
    return subscriber;
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng xuất không thành công. Vui lòng thử lại.');
    }
  };

  if (showSplash) {
    return <SplashScreen />; // Chỉ hiện splash, không render navigation
  }

  if (initializing || roleLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? (
        role === 'admin' ? (
          <AdminDrawer />
        ) : (
          <>
            <Stack.Navigator
              screenOptions={{
                headerRight: () => (
                  <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 15 }}>
                    <Text style={{ fontSize: 24 }}>☰</Text>
                  </TouchableOpacity>
                ),
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'THT Cartoon' }} />
              <Stack.Screen name="VideoScreen" component={VideoScreen} options={{ title: 'Xem phim' }} />
              <Stack.Screen name="Saved" component={SavedScreen} options={{ title: 'Phim đã lưu' }} />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Thông tin người dùng' }} />
            </Stack.Navigator>
            <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} onLogout={handleLogout} />
          </>
        )
      ) : (
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Đăng ký' }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Quên mật khẩu' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
