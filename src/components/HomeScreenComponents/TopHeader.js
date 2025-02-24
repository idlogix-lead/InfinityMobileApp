import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import { Image } from 'react-native-elements';
const { height, width } = Dimensions.get('window');

const TopHeader = () => {
  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <Image
          source={require('../../asserts/HomeScreenAssets/HeaderAssets/Notification.png')}
          style={styles.leftImage}
        />
      </TouchableOpacity>
      <Text style={styles.headerText}>INFINITY</Text>
      <View style={styles.rightImagesContainer}>
        <TouchableOpacity>
          <Image
            source={require('../../asserts/HomeScreenAssets/HeaderAssets/Reset.png')}
            style={styles.rightImage}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../../asserts/HomeScreenAssets/HeaderAssets/Search.png')}
            style={styles.rightImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: height / 12,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(128, 0, 0, 0.67)'
  },
  leftImage: {
    width: width / 10,
    height: height,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'K2D-Bold'
  },
  rightImagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightImage: {
    width: width / 13,
    height: height,
    resizeMode: 'contain',
    marginLeft: 10,
  },
});


export default TopHeader

