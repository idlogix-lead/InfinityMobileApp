import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const SalarySlipCardView = ({Icon, TitleText, Txt}) => {
  return (
    <View style={styles.ContainerView}>
      <View style={styles.IconView}>{Icon}</View>
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
        {/* <Image source={image} style /> */}
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
