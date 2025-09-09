// App.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';

import useUserRole from './src/hooks/useUserRole';
import HomeScreen from './src/screens/HomeScreen';
import VideoScreen from './src/screens/VideoScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SavedScreen from './src/screens/SavedScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDrawer from './Admin/admin_routers/AdminDrawer';
import SplashScreen from './src/screens/SplashScreen';
import ShortsScreen from './src/screens/ShortsScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import MovieManagementScreen from './Admin/admin_screens/MovieManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 🟢 Stack riêng cho Home
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="VideoScreen" component={VideoScreen} />
  </Stack.Navigator>
);

const UserTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home-outline';
        else if (route.name === 'Shorts') iconName = 'play-circle-outline';
        else if (route.name === 'AddNew') iconName = 'add-circle-outline';
        else if (route.name === 'Saved') iconName = 'bookmark-outline';
        else if (route.name === 'Profile') iconName = 'person-outline';

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ff3333',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeStack} 
      options={{ title: 'Trang chủ', headerShown: false }} 
    />
    <Tab.Screen name="Shorts" component={ShortsScreen} options={{ title: 'Shorts' }} />
    <Tab.Screen name="AddNew" component={MovieManagementScreen} options={{ title: '+' }} />
    <Tab.Screen name="Saved" component={SavedScreen} options={{ title: 'Đã lưu' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
  </Tab.Navigator>
);

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(usr => {
      setUser(usr);
      setInitializing(false);
    });
    return subscriber;
  }, []);

  if (showSplash) return <SplashScreen />;
  if (initializing || roleLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          role === 'admin' ? (
            <Stack.Screen name="AdminApp" component={AdminDrawer} />
          ) : (
            <Stack.Screen name="UserApp" component={UserTabs} />
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
