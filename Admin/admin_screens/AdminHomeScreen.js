// Admin/admin_screens/AdminHomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const APP_NAME = 'THT Cartoon Admin';
const APP_VERSION = 'v1.0.0';

const AdminHomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../admin_assets/app_logo.png')} style={styles.logo} />
      <Text style={styles.appName}>{APP_NAME}</Text>
      <Text style={styles.version}>Phiên bản {APP_VERSION}</Text>
      <Text style={styles.greeting}>Chào Admin!</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MovieManagement')}>
          <Icon name="filmstrip" size={32} color="#007bff" />
          <Text style={styles.actionText}>Quản lý phim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('UserManagement')}>
          <Icon name="account-group" size={32} color="#007bff" />
          <Text style={styles.actionText}>Quản lý Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AppInfo')}>
          <Icon name="information" size={32} color="#007bff" />
          <Text style={styles.actionText}>Thông tin App</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.logoutBtn}
        onPress={() => navigation.navigate('Logout')}
      >
        <Icon name="logout" size={24} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: 18,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  version: {
    color: '#007bff',
    fontWeight: '600',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#444',
    marginBottom: 28,
  },
  quickActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  actionBtn: {
    width: 110,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 18,
    marginHorizontal: 8,
    shadowColor: '#007bff',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#ff3b30',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    alignSelf: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default AdminHomeScreen;
