import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/splash.mp4')}
        style={styles.full}
        resizeMode="contain"
        repeat={false}
        controls={false}
        ignoreSilentSwitch="obey"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  full: { width, height },
});

export default SplashScreen;
