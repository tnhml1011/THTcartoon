import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, TouchableOpacity, Modal, Text, StyleSheet, Alert } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';

import HomeScreen from './screens/HomeScreen';
import VideoScreen from './screens/VideoScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SavedScreen from './screens/SavedScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();
const navigationRef = createNavigationContainerRef();

const MenuModal = ({ visible, onClose, onLogout }) => (
  <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => { onClose(); navigationRef.navigate('Home'); }} style={styles.menuItem}>
          <Text style={styles.menuText}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { onClose(); navigationRef.navigate('Saved'); }} style={styles.menuItem}>
          <Text style={styles.menuText}>Phim đã lưu</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { onClose(); navigationRef.navigate('Profile'); }} style={styles.menuItem}>
          <Text style={styles.menuText}>Thông tin người dùng</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn đăng xuất?',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Đăng xuất', style: 'destructive', onPress: () => { onClose(); onLogout(); } },
            ],
            { cancelable: true }
          );
        }} style={[styles.menuItem, { borderBottomWidth: 0 }]}>
          <Text style={[styles.menuText, { color: 'red' }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
       // Đưa về màn hình Login sau khi logout
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng xuất không thành công. Vui lòng thử lại.');
    }
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerRight: () =>
            user ? (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={{ marginRight: 15 }}
              >
                <Text style={{ fontSize: 24 }}>☰</Text>
              </TouchableOpacity>
            ) : null,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'THT Cartoon' }} />
            <Stack.Screen name="VideoScreen" component={VideoScreen} options={{ title: 'Watch Video' }} />
            <Stack.Screen name="Saved" component={SavedScreen} options={{ title: 'Phim đã lưu' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Thông tin người dùng' }} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'Đăng nhập' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Đăng ký' }}
            />
          </>
        )}
      </Stack.Navigator>

      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} onLogout={handleLogout} />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 10,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: 160,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
});

export default App;
