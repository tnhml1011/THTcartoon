import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const APP_NAME = 'THT Cartoon Admin';
const APP_VERSION = 'v1.0.0';
const STUDENTS = [
    { name: 'Trần Công Thành', id: '2124802010805', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: 'Trần Nhật Hào', id: '2124802010699', avatar: 'https://randomuser.me/api/portraits/men/51.jpg' },
    { name: 'Đỗ Thành Trọng', id: '2124802010285', avatar: 'https://randomuser.me/api/portraits/men/11.jpg' },
  ];

const AdminDrawerContent = (props) => {
  const { navigation } = props;
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../admin_assets/app_logo.png')} style={styles.logo} />
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.version}>Phiên bản {APP_VERSION}</Text>
      </View>
      {/* Main nav */}
      <View style={styles.section}>
        <DrawerItem
          label="Trang chủ"
          icon={({ color, size }) => <Icon name="home-outline" color={color} size={size} />}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
          onPress={() => navigation.navigate('AdminHome')}
        />
        <DrawerItem
          label="Quản lý phim"
          icon={({ color, size }) => <Icon name="filmstrip" color={color} size={size} />}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
          onPress={() => navigation.navigate('MovieManagement')}
        />
        <DrawerItem
          label="Quản lý người dùng"
          icon={({ color, size }) => <Icon name="account-group" color={color} size={size} />}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
          onPress={() => navigation.navigate('UserManagement')}
        />
        <DrawerItem
          label="Thông tin ứng dụng"
          icon={({ color, size }) => <Icon name="information-outline" color={color} size={size} />}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
          onPress={() => navigation.navigate('AppInfo')}
        />
        <DrawerItem
          label="Thông tin cá nhân"
          icon={({ color, size }) => <Icon name="account" color={color} size={size} />}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
      {/* App info section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin nhóm</Text>
        {STUDENTS.map((sv, idx) => (
          <View key={idx} style={styles.studentRow}>
            <Image source={{ uri: sv.avatar }} style={styles.avatar} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.studentName}>{sv.name}</Text>
              <Text style={styles.studentId}>{sv.id}</Text>
            </View>
          </View>
        ))}
      </View>
      {/* Đăng xuất cuối drawer */}
      <View style={styles.logoutSection}>
        <DrawerItem
          label="Đăng xuất"
          icon={({ color, size }) => <Icon name="logout" color="#ff3b30" size={size} />}
          labelStyle={[styles.drawerLabel, { color: '#ff3b30', fontWeight: 'bold' }]}
          style={[styles.drawerItem, styles.logoutBtn]}
          onPress={() => navigation.navigate('Logout')}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerScroll: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#e3eaff',
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 18,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  version: {
    color: '#007bff',
    fontWeight: '600',
    marginBottom: 2,
  },
  section: {
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 6,
    marginLeft: 4,
    fontSize: 15,
  },
  drawerItem: {
    borderRadius: 16,
    marginVertical: 2,
    backgroundColor: '#fff',
    elevation: 1,
  },
  drawerLabel: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#007bff',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e3eaff',
  },
  studentName: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 14,
  },
  studentId: {
    color: '#6c7a89',
    fontSize: 12,
  },
  logoutSection: {
    marginTop: 32,
    marginBottom: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderColor: '#e3eaff',
  },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 8,
    elevation: 1,
  },
});

export default AdminDrawerContent;
