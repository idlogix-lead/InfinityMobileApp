import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'

const ChatHeader = ({onPress}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <Image source={require('../../asserts/ChatAssets/backArrow.png')} style={styles.backArrowImage} />
      </TouchableOpacity>
      <View style={{ width: '70%', alignItems: 'center' }}>
        <Text style={styles.txtChat}>Chat</Text>
      </ View>
      <Image source={require('../../asserts/ChatAssets/chat.png')} style={styles.image} />
    </View>
  )
}

export default ChatHeader

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor:"white"
  },
  image: {
    height: '48%',
    width: '10%'
  },
  backArrowImage: {
    height: '60%',
    width: 40
  },
  txtChat:{
    fontSize:32,
    fontFamily:'K2D-Regular',
    color:'#1D4167'
  }
})