import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MovieManagementScreen from '../admin_screens/MovieManagementScreen';
import AddMovieScreen from '../admin_screens/AddMovieScreen';
import EditMovieScreen from '../admin_screens/EditMovieScreen';
import DetailMovieScreen from '../admin_screens/DetailMovieScreen';
const Stack = createStackNavigator();

const AdminMovieStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MovieManagement" component={MovieManagementScreen} options={{ title: 'Danh sách phim' }} />
    <Stack.Screen name="AddMovie" component={AddMovieScreen} options={{ title: 'Thêm phim' }} />
    <Stack.Screen name="DetailMovie" component={DetailMovieScreen} options={{ title: 'Chi tiết phim' }} />
    <Stack.Screen name="EditMovie" component={EditMovieScreen} options={{ title: 'Sửa phim' }} />
  </Stack.Navigator>
);

export default AdminMovieStack;
