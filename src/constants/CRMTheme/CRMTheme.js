// src/constants/CRMTheme/CRMTheme.js
import { Dimensions as RN_Dimensions, Platform } from 'react-native';

const { width, height } = RN_Dimensions.get('window');

// Base screen dimensions
const SCREEN_WIDTH = width;
const SCREEN_HEIGHT = height;

// Responsive calculations
const scale = (size) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size) => (SCREEN_HEIGHT / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Platform detection
const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Device type detection
const isSmallDevice = SCREEN_WIDTH < 375; // iPhone SE, 5, 5s
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414; // iPhone 6,7,8, X, XS
const isLargeDevice = SCREEN_WIDTH >= 414; // iPhone 6+,7+,8+, XR, XS Max, 11, 12, 13
const isTablet = SCREEN_WIDTH >= 768;

// Colors
const Colors = {
  // Primary Colors
  primary: '#2F4FE3',
  primaryLight: '#5D7BEF',
  primaryDark: '#1C3AC7',
  
  // Background Colors
  background: '#EDEBEB',
  backgroundLight: '#ffffff',
  backgroundDark: '#F5F5F5',
  backgroundGrey: '#EDEBEB',
  
  // Text Colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textLight: '#BBBBBB',
  textInverse: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  successLight: '#E6F4EA',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FDEAEA',
  info: '#3B82F6',
  infoLight: '#F0F9FF',
  
  // UI Colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Status Specific
  statusNew: '#3B82F6',
  statusWorking: '#F59E0B',
  statusConverted: '#10B981',
  statusExpired: '#EF4444',
  
  // Button Colors
  buttonPrimary: '#2F4FE3',
  buttonSecondary: '#FFFFFF',
  buttonDisabled: '#CCCCCC',
  
  // Card Colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E0E0E0',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
};

// Typography
const Typography = {
  // Font Families
  fontFamily: {
    regular: 'K2D-Regular',
    medium: 'K2D-Medium',
    semiBold: 'K2D-SemiBold',
    bold: 'K2D-Bold',
  },
  
  // Responsive Font Sizes
  fontSize: {
    // Heading Sizes
    h1: scale(28),
    h2: scale(24),
    h3: scale(20),
    h4: scale(18),
    
    // Body Sizes
    large: scale(16),
    medium: scale(14),
    small: scale(12),
    xsmall: scale(10),
    
    // Special Sizes
    button: scale(16),
    input: scale(16),
    label: scale(14),
  },
  
  // Line Heights
  lineHeight: {
    h1: scale(36),
    h2: scale(32),
    h3: scale(28),
    h4: scale(24),
    large: scale(24),
    medium: scale(20),
    small: scale(16),
    xsmall: scale(14),
  },
  
  // Letter Spacing
  letterSpacing: {
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// Spacing & Dimensions
const Spacing = {
  // Standard Spacing Units
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),
  xxxxl: scale(40),
};

// Rename Dimensions to Layout to avoid conflict
const Layout = {
  // Screen Dimensions
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  
  // Responsive Functions
  scale,
  verticalScale,
  moderateScale,
  
  // Platform
  isIOS,
  isAndroid,
  
  // Device Type
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  
  // Spacing
  spacing: Spacing,
  
  // Border Radius
  borderRadius: {
    xs: scale(2),
    sm: scale(4),
    md: scale(6),
    lg: scale(8),
    xl: scale(12),
    xxl: scale(16),
    round: scale(999),
  },
  
  // Icon Sizes
  iconSize: {
    xs: scale(12),
    sm: scale(16),
    md: scale(20),
    lg: scale(24),
    xl: scale(28),
    xxl: scale(32),
  },
  
  // Button Sizes
  button: {
    height: {
      sm: verticalScale(36),
      md: verticalScale(44),
      lg: verticalScale(52),
    },
    padding: {
      sm: scale(8),
      md: scale(12),
      lg: scale(16),
    },
  },
  
  // Input Sizes
  input: {
    height: verticalScale(44),
    padding: scale(12),
    borderRadius: scale(8),
  },
  
  // Card Sizes
  card: {
    padding: scale(12),
    margin: scale(8),
    borderRadius: scale(8),
  },
  
  // Modal Sizes
  modal: {
    maxHeight: isTablet ? '70%' : verticalScale(500),
    borderRadius: scale(20),
  },
  
  // Floating Button
  floatingButton: {
    size: scale(60),
    bottom: verticalScale(20),
    right: scale(20),
  },
  
  // Header Sizes
  header: {
    height: verticalScale(56),
    padding: scale(16),
  },
  
  // Safe Area
  safeArea: {
    top: isIOS ? verticalScale(44) : verticalScale(24),
    bottom: isIOS ? verticalScale(34) : verticalScale(0),
  },
};

// Export single theme object
const CRMTheme = {
  Colors,
  Typography,
  Layout, // Changed from Dimensions to Layout
  Spacing,
  scale,
  verticalScale,
  moderateScale,
  isIOS,
  isAndroid,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
};

export default CRMTheme;