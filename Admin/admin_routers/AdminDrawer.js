// Admin/adminrouters/AdminDrawer.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import AdminHomeScreen from '../admin_screens/AdminHomeScreen';
import AdminMovieStack from './AdminMovieStack';
import UserManagementScreen from '../admin_screens/UserManagementScreen';
import ProfileScreen from '../admin_screens/ProfileScreen';
import LogoutScreen from '../admin_screens/LogoutScreen';
import AppInfoScreen from '../admin_screens/AppInfoScreen';
import AdminDrawerContent from './AdminDrawerContent';

const Drawer = createDrawerNavigator();

const AdminDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="AdminHome"
      drawerContent={props => <AdminDrawerContent {...props} />}
    >
      <Drawer.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Trang chủ Admin' }} />
      <Drawer.Screen name="MovieManagement" component={AdminMovieStack} options={{ title: 'Quản lý phim' }} />
      <Drawer.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Quản lý người dùng' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Thông tin người dùng' }} />
      <Drawer.Screen name="AppInfo" component={AppInfoScreen} options={{ title: 'Thông tin ứng dụng' }} />
      <Drawer.Screen name="Logout" component={LogoutScreen} options={{ title: 'Đăng xuất' }} />
    </Drawer.Navigator>
  );
};

export default AdminDrawer;
