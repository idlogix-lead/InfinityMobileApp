import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import React, { useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCheckAuth } from '../../hooks/useAuth';

const { height, width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const moveAnim = useMemo(() => new Animated.Value(-1000), []);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  const { hasServerConfig, isAuthenticated } = useAuthStore();
  const { data: authCheck, error, isLoading } = useCheckAuth();

  useEffect(() => {
    // EXACT SAME ANIMATION as old splash
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(moveAnim, {
        toValue: 0,
        speed: 2,
        duration: 1000,
        bounciness: 10,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);

  useEffect(() => {
    // New authentication logic
    const handleNavigation = async () => {
      // Check server configuration first
      if (!hasServerConfig) {
        setTimeout(() => {
          navigation.replace('WelcomeScreen');
        }, 2000);
        return;
      }

      // If still checking auth, wait
      if (isLoading) return;

      // Handle authentication results
      if (error || !isAuthenticated) {
        // Not authenticated or error occurred
        setTimeout(() => {
          navigation.replace('SignIn');
        }, 2000);
      } else if (authCheck) {
        // Successfully authenticated
        setTimeout(() => {
          navigation.replace('FingerPrintScreen', {
            token: authCheck.token,
            userId: authCheck.userId,
          });
        }, 2000);
      }
    };

    handleNavigation();
  }, [hasServerConfig, isAuthenticated, authCheck, error, isLoading]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '30deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor="transparent" />
      <Animated.View
        style={{
          width: 200,
          height: 900,
          flexDirection: 'row',
          alignItems: 'center',
          marginRight: '0%',
          transform: [{rotate: rotateInterpolate}],
        }}>
        <Image
          source={require('../../asserts/splashScreenAsserts/Frame393(3).png')}
          style={{width: 100, height: 120}}
        />
        <View>
          <Animated.Image
            source={require('../../asserts/splashScreenAsserts/dot(1).png')}
            style={{
              transform: [{translateY: moveAnim}],
              width: 30,
              height: 30,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2F4FE2',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});