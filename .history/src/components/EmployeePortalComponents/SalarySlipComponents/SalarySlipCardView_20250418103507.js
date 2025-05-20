import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';

const SalarySlipCardView = ({Icon, TitleText, Txt, image}) => {
  return (
    <View style={styles.ContainerView}>
      {/* <View style={styles.IconView}>{Icon}</View>
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
          justifyContent: 'center',
        }}>
        <Image source={image} style={{alignSelf: 'center'}} />
      </View> */}
      <View style={styles.IconView}>
        {Icon ? (
          Icon
        ) : image ? (
          <Image source={image} style={{alignSelf: 'center'}} />
        ) : null}
      </View>

      <View>
        <Text style={styles.TextTop}>{TitleText}</Text>
        <Text style={styles.TextBottom}>{Txt}</Text>
      </View>
    </View>
  );
};

export default SalarySlipCardView;

const styles = StyleSheet.create({
  ContainerView: {
    flexDirection: 'row',
    // padding:10,
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
    // backgroundColor: 'red',
    borderRadius: 5,
    borderColor: 'lightgray',
    borderWidth: 1,
    paddingLeft: 10,
  },
  IconView: {
    // width: '15%',
    // justifyContent: 'center',
    // alignItems:'center',
    height: 40,
    width: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginLeft: 10,
    marginTop: 6,
    marginRight: 8,
    shadowColor: '#000',
    // shadowOpacity: 0.8,
    elevation: 11,
    shadowRadius: 2,
    justifyContent: 'center',
  },
  TextTop: {
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 16,
  },
  TextBottom: {
    color: '#000',
    fontFamily: 'K2D-Bold',
    fontSize: 16,
    width: 300,
  },
});
