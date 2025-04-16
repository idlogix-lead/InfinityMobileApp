import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React from 'react';

const PortalCards = ({text, onPress, icon, image}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.Container}>
      <View style={{flexDirection: 'row'}}>
        <View
          style={{
            height: 40,
            width: 40,
            backgroundColor: '#fff',
            borderRadius: 20,
            marginLeft: 10,
            marginTop: 6,
            shadowColor: '#000',
            // shadowOpacity: 0.8,
            elevation: 11,
            shadowRadius: 2,
          }}>
          {/* <Image source={Image} style={{height: 20, width: 20}} /> */}
          <Image source={image} style={{height: 35, width: 35}} />
        </View>
        <Text style={styles.TextBox}>{text}</Text>
      </View>
      <View style={styles.IconBox}>{icon}</View>
    </TouchableOpacity>
  );
};

export default PortalCards;

const styles = StyleSheet.create({
  Container: {
    height: 70,
    width: '90%',
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 5,
    marginTop: 20,
    // borderBottomWidth:3,
    // borderBottomColor:'#00b0f0',
    borderWidth: 2,
    borderColor: 'lightgray',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  TextBox: {
    // width: '80%',
    padding: 10,
    color: '#000',
    fontFamily: 'K2D-BoldItalic',
    fontSize: 16,
  },
  IconBox: {
    // width: '20%',
    // justifyContent: 'center',
    // alignItems: 'center',
    right: 15,
  },
});
