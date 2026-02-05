import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, {useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import Entypo from 'react-native-vector-icons/dist/Entypo';
import {useNavigation} from '@react-navigation/native';
import Filter from './Filter';

const CustomHeader = ({
  title,
  RightIcon,
  RightPress,
  style,
  MessageNameIcon,
  MessageOnPress,
}) => {
  const navigation = useNavigation();

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Choose the appropriate back icon based on platform
  const getBackIcon = () => {
    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity 
          style={styles.iosBackButton}
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
          {Platform.OS === 'ios' && (
            <Text style={styles.iosBackText}>Back</Text>
          )}
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={30} color="#fff" />
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {getBackIcon()}
        
        <Text style={styles.title}>{title}</Text>
       
        {RightIcon ? (
          <TouchableOpacity>
            <MaterialCommunityIcons
              name={RightIcon}
              size={25}
              color="#fff"
              onPress={RightPress}
            />
          </TouchableOpacity>
        ) : (
          <Text> {''}</Text>
        )}
        {/* {MessageNameIcon ? (
          <TouchableOpacity>
            <Entypo name={MessageNameIcon} size={34} color='#fff' onPress={MessageOnPress} />
          </TouchableOpacity>
        ) : (<Text > {""}</Text>)} */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2F4FE3',
    justifyContent: 'center',
    height: 80,
    paddingTop: Platform.OS === 'ios' ? 40 : 10,
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 0,
   
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'K2D-Regular',
    flex: 1,
    textAlign: 'center',
    marginLeft: Platform.OS === 'ios' ? -40 : 0, // Compensate for iOS back button width
  },
  iosBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingRight: 5,
    minWidth: 80,
  },
  iosBackText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 2,
  },
});

export default CustomHeader;