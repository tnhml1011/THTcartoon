import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';

const LogoutScreen = ({ navigation }) => {
  useEffect(() => {
    const doLogout = async () => {
      await auth().signOut();
    };
    doLogout();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LogoutScreen; 