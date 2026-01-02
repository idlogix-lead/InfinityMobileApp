import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import React, { useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCheckAuth } from '../../hooks/useAuth';
import colors from '../../constants/Colors';

const { height, width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const moveAnim = useMemo(() => new Animated.Value(-1000), []);
  const rotateAnim = useMemo(() => new Animated.Value(0), []);
  const opacityAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.5), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  
  const { hasServerConfig, isAuthenticated } = useAuthStore();
  const { data: authCheck, error, isLoading } = useCheckAuth();

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.sequence([
        Animated.spring(moveAnim, {
          toValue: 0,
          speed: 1.5,
          bounciness: 12,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  useEffect(() => {
    // Navigation logic based on auth state
    if (!hasServerConfig) {
      setTimeout(() => {
        navigation.replace('WelcomeScreen');
      }, 2500);
      return;
    }

    if (isLoading) return; // Still checking auth

    if (error || !isAuthenticated) {
      // Not authenticated or error
      setTimeout(() => {
        navigation.replace('SignIn');
      }, 2500);
    } else if (authCheck) {
      // Successfully authenticated
      setTimeout(() => {
        navigation.replace('FingerPrintScreen', {
          token: authCheck.token,
          userId: authCheck.userId,
        });
      }, 2500);
    }
  }, [hasServerConfig, isAuthenticated, authCheck, error, isLoading]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '25deg'],
  });

  const fadeInterpolate = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.primary}
        translucent={false}
      />
      
      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        <Animated.View 
          style={[
            styles.circle, 
            styles.circle1,
            { 
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.circle, 
            styles.circle2,
            { 
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0.7, 1]
              })}] 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.circle, 
            styles.circle3,
            { 
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim.interpolate({
                inputRange: [0.5, 1],
                outputRange: [0.8, 1]
              })}] 
            }
          ]} 
        />
      </View>

      {/* Main Logo Container */}
      <View style={styles.logoContainer}>
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../../asserts/splashScreenAsserts/infinityLoginIcon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Animated Dot */}
        <Animated.View
          style={{
            transform: [{ translateY: moveAnim }],
            opacity: fadeInterpolate,
          }}>
          <View style={styles.dotContainer}>
            <Image
              source={require('../../asserts/splashScreenAsserts/infinityLoginIcon.png')}
              style={styles.dot}
            />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })}],
            marginTop: 30,
          }}>
          <Text style={styles.appName}>Infinity ERP</Text>
          <Text style={styles.appTagline}>Enterprise Resource Planning</Text>
        </Animated.View>
      </View>

      {/* Loading Indicator */}
      <Animated.View 
        style={[
          styles.loadingContainer,
          { opacity: fadeAnim }
        ]}>
        <View style={styles.loadingBar}>
          <Animated.View 
            style={[
              styles.loadingProgress,
              { 
                transform: [{
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-width, 0]
                  })
                }] 
              }
            ]} 
          />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>

      {/* Version Info */}
      <Animated.View 
        style={[
          styles.versionContainer,
          { opacity: fadeAnim }
        ]}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 Infinity Solutions</Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle1: {
    width: 400,
    height: 400,
    top: -150,
    right: -150,
  },
  circle2: {
    width: 300,
    height: 300,
    bottom: -100,
    left: -100,
  },
  circle3: {
    width: 200,
    height: 200,
    top: '60%',
    right: '10%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
 
  logo: {
    width: 250,
    height: 250,
   
  },
  dotContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  dot: {
    width: 35,
    height: 35,
   
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textInverse,
    fontFamily: 'K2D-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: 'K2D-Regular',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    width: '80%',
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.textInverse,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'K2D-Regular',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'K2D-Regular',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'K2D-Regular',
  },
});